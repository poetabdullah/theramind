let tokenClient;
let accessToken = null;

const CLIENT_ID = "996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

// Wait until Google Identity Services loads
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

// Initialize GIS token client (NO PROMPT)
export async function initGoogleApi() {
  await waitForGoogle();

  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      prompt: "", // ✅ don't trigger login again
      callback: (resp) => {
        if (resp && resp.access_token) {
          accessToken = resp.access_token;
          localStorage.setItem("google_calendar_access_token", accessToken);
          resolve(resp);
        } else {
          reject(new Error("Token client init failed"));
        }
      },
    });
  });
}

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


// Refresh access token using refresh_token (used by doctor auth usually)
export async function refreshAccessToken(refreshToken) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: "996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com", // same as earlier
      client_secret: "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", // 🔐 get from Google Cloud Console → OAuth 2.0 credentials

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

// Create Google Meet event with existing access token
export async function createGoogleMeetEvent(summary, description, startISO, endISO, patientEmail, doctorEmail) {
  const token = localStorage.getItem("google_calendar_access_token");

  if (!token) {
    throw new Error("Google access token not found. Please login again.");
  }

  const body = {
    summary,
    description,
    start: { dateTime: startISO, timeZone: "Asia/Karachi" },
    end: { dateTime: endISO, timeZone: "Asia/Karachi" },
    attendees: [
      { email: patientEmail },
      { email: doctorEmail },
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
    throw new Error("Access token expired or unauthorized. Please re-login.");
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Calendar API error ${res.status}: ${errorText}`);
  }

  return await res.json();
}

// Delete Google Calendar event with stored access token
export async function deleteEventWithToken(calendarId, eventId, token) {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status !== 204) {
    const errorText = await res.text();
    throw new Error(`Failed to delete event: ${res.status} ${errorText}`);
  }

  return { success: true };
}

// Fallback for deleting calendar events
export async function deleteGoogleCalendarEvent(calendarId, eventId) {
  const token = localStorage.getItem("google_calendar_access_token");
  if (!token) throw new Error("No token. Please re-login.");

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (res.status === 401) {
    throw new Error("Unauthorized. Token expired.");
  }

  if (res.status === 410) {
    return { success: true, message: "Already deleted" };
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Delete failed: ${res.status} - ${err}`);
  }

  return { success: true };
}
