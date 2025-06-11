let tokenClient;
let accessToken = null;

const CLIENT_ID = "996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// Wait for Google Identity Services script to load
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

// Create a Google Calendar event with Meet link
export async function createGoogleMeetEvent(summary, description, startISO, endISO, patientEmail) {
  const token = accessToken || localStorage.getItem("google_calendar_access_token");
  if (!token) throw new Error("No access token");

  const body = {
    summary,
    description,
    start: { dateTime: startISO, timeZone: "Asia/Kolkata" },
    end: { dateTime: endISO, timeZone: "Asia/Kolkata" },
    attendees: [{ email: patientEmail }],
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
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
export const deleteGoogleCalendarEvent = async (eventId, accessToken) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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

