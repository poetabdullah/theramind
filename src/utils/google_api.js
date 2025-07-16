let tokenClient;
let accessToken = null;

const CLIENT_ID = "996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

//Waiting for Google Identity Services (GIS) script to get loaded
export function waitForGoogle() {
  
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      resolve();
      return;
    }

    const interval = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        clearInterval(interval);
        resolve();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      reject(new Error("Google Identity Services script load timeout"));
    }, 5000);
  });
}

// Initialize GIS Token Client (no prompt yet)
export async function initGoogleApi() {
  await waitForGoogle();

  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      prompt: '', // No prompt initially
      callback: (resp) => {
        if (resp && resp.access_token) {
          accessToken = resp.access_token;
          localStorage.setItem("google_calendar_access_token", accessToken);
          resolve(resp);
        } else {
          reject(new Error("Token client initialization failed"));
        }
      },
    });
  });
}

// Explicitly request token (e.g. when user clicks “Book Appointment”)
export function requestAccessToken(prompt = 'consent') {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error("Token client not initialized"));
      return;
    }

    tokenClient.callback = (resp) => {
      if (resp.error) {
        reject(new Error(`Access token error: ${resp.error}`));
      } else {
        accessToken = resp.access_token;
        localStorage.setItem("google_calendar_access_token", accessToken);
        resolve(accessToken);
      }
    };

    tokenClient.requestAccessToken({ prompt });
  });
}

export async function refreshAccessToken(refreshToken) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to refresh access token: ${data.error}`);
  }

  return data.access_token;
}

export async function deleteEventWithToken(calendarId, eventId, accessToken) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (res.status !== 204) {
    const errorText = await res.text();
    throw new Error(`Failed to delete event: ${res.status} ${errorText}`);
  }
}

// Create a Google Calendar event with Meet link
export async function createGoogleMeetEvent(summary, description, startISO, endISO, patientEmail, doctorEmail) {
  const token = accessToken || localStorage.getItem("google_calendar_access_token");
  if (!token) throw new Error("No access token");

  const body = {
    summary,
    description,
    start: { dateTime: startISO, timeZone: "Asia/Karachi" },
    end: { dateTime: endISO, timeZone: "Asia/Karachi" },
    attendees: 
    [
      { email: patientEmail},
      { email: doctorEmail }
      ],
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (res.status === 401) {
    await requestAccessToken("consent");
    throw new Error("Unauthorized. Token expired. Please try again.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Calendar API error ${res.status}: ${errorText}`);
  }

  return res.json();
}

// Delete a Google Calendar event
export const deleteGoogleCalendarEvent = async (calendarId, eventId) => {
  const token = accessToken || localStorage.getItem("google_calendar_access_token");
  if (!token) throw new Error("No access token available");

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=all`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      // Try refreshing the token once
      const newToken = await requestAccessToken("consent");
      const retryResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        }
      );

      if (!retryResponse.ok) {
        const retryError = await retryResponse.json();
        throw new Error(`Retry failed: ${retryResponse.status} - ${JSON.stringify(retryError)}`);
      }

      return { success: true };
    }

    if (response.status === 410) {
      console.warn("Event already deleted.");
      return { success: true, message: "Event was already deleted." };
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Delete event failed: ${response.status} - ${JSON.stringify(error)}`);
    }

    return { success: true };
  } catch (err) {
    console.error("Error deleting calendar event:", err);
    throw err;
  }
};

