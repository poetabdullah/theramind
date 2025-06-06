let accessToken = null;
let tokenClient = null;

const GOOGLE_CLIENT_ID = '996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyCI_qHj3Ou0jlICgsKkeLzqwR9NTl0Tkqo';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

export const requestGoogleAccessToken = async () => {
  const clientId = "996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com";
  const redirectUri = "http://localhost:3000"; // or your deployed redirect URI
  const scope = encodeURIComponent(
  "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar"
);
  const responseType = "token";

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&prompt=consent`;

  // redirect the browser to Google's OAuth 2.0 consent screen
  window.location.href = authUrl;
};

/**
 * Load Google API scripts and initialize client + token client
 */
export const initGoogleApi = () => {
  return new Promise((resolve, reject) => {
    // Load scripts only once
    const loadScript = (src) =>
      new Promise((res, rej) => {
        if (document.querySelector(`script[src="${src}"]`)) return res();
        const script = document.createElement('script');
        script.src = src;
        script.onload = res;
        script.onerror = rej;
        document.body.appendChild(script);
      });

    Promise.all([
      loadScript('https://accounts.google.com/gsi/client'),
      loadScript('https://apis.google.com/js/api.js'),
    ])
      .then(() => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_API_KEY,
              discoveryDocs: [DISCOVERY_DOC],
            });

            tokenClient = window.google.accounts.oauth2.initTokenClient({
              client_id: GOOGLE_CLIENT_ID,
              scope: SCOPES,
              callback: (tokenResponse) => {
                if (tokenResponse.error) {
                  console.error('Token error:', tokenResponse);
                  // This callback will be overridden in signInWithGoogle, so keep empty here
                }
              },
            });

            resolve();
          } catch (err) {
            console.error('GAPI client init failed:', err);
            reject(err);
          }
        });
      })
      .catch((err) => {
        console.error('Failed to load Google scripts:', err);
        reject(err);
      });
  });
};

/**
 * Request Google OAuth token with user consent
 * Returns access token string
 */
export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject(new Error('Token client not initialized'));

    tokenClient.callback = (tokenResponse) => {
      if (tokenResponse.error) {
        console.error('Token error:', tokenResponse);
        reject(tokenResponse);
        return;
      }
      accessToken = tokenResponse.access_token;
      window.gapi.client.setToken({ access_token: accessToken });
      console.log('Access token obtained:', accessToken);
      resolve(accessToken);
    };

    // Request access token, prompt user for consent every time (set prompt: 'consent' for testing, 'none' to skip)
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

/**
 * Create a Google Calendar event with a Google Meet conference link
 * @param {string} summary Event title
 * @param {string} description Event description
 * @param {string} start ISO 8601 datetime string (e.g. '2025-06-06T15:00:00+05:00')
 * @param {string} end ISO 8601 datetime string
 * @param {string[]} attendeesEmails Array of attendee email strings
 * @returns Google Calendar event resource (Promise)
 */
export const createGoogleMeetEvent = async (
  summary,
  description,
  start,
  end,
  attendeesEmails = []
) => {
  try {
    if (!accessToken) throw new Error('No access token. Please sign in first.');

    const event = {
      summary,
      description,
      start: {
        dateTime: start,
        timeZone: 'Asia/Karachi', // adjust to your timezone or make dynamic
      },
      end: {
        dateTime: end,
        timeZone: 'Asia/Karachi',
      },
      attendees: attendeesEmails.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    window.gapi.client.setToken({ access_token: accessToken });
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    return response.result;
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw error;
  }
};

/**
 * Extract Google Meet link URL from a Google Calendar event resource
 * @param {object} event Google Calendar event object
 * @returns {string} Meet link URL
 */
export const getGoogleMeetLink = (event) => {
  if (event?.hangoutLink) return event.hangoutLink;

  const entryPoint = event?.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === 'video'
  );

  if (entryPoint) return entryPoint.uri;

  throw new Error(`No Google Meet link found in the event: ${JSON.stringify(event)}`);
};

export const deleteGoogleCalendarEvent = async (eventId) => {
  if (!window.gapi.client.getToken()) {
    await initGoogleApi(); // Ensure authenticated
  }

  try {
    const response = await window.gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
    return response;
  } catch (error) {
    console.error('Failed to delete Google Calendar event:', error);
    throw error;
  }
};
