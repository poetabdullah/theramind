let accessToken = null;
let tokenClient = null;

const GOOGLE_CLIENT_ID = '996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com';
const GOOGLE_API_KEY = 'AIzaSyCI_qHj3Ou0jlICgsKkeLzqwR9NTl0Tkqo';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

/**
 * Load and initialize Google API
 */
export const initGoogleApi = () => {
  return new Promise((resolve, reject) => {
    const loadScript = (src) =>
      new Promise((res, rej) => {
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
                  console.error("Token error:", tokenResponse);
                  reject(tokenResponse);
                } else {
                  accessToken = tokenResponse.access_token;
                  resolve(tokenResponse);
                }
              },
            });

            // Optional: auto-resolve if you want to indicate API is ready
            // resolve();
          } catch (err) {
            console.error("GAPI client init failed:", err);
            reject(err);
          }
        });
      })
      .catch((err) => {
        console.error("Failed to load Google scripts:", err);
        reject(err);
      });
  });
};

/**
 * Request access token from user
 */
export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject("Token client not initialized.");
    tokenClient.requestAccessToken();
    const checkAccess = setInterval(() => {
      if (accessToken) {
        clearInterval(checkAccess);
        resolve(accessToken);
      }
    }, 100);
  });
};

/**
 * Create a Google Calendar event with Meet link
 */
export const createGoogleMeetEvent = async (summary, description, start, end, attendeeEmail) => {
  try {
    if (!accessToken) throw new Error("User not authenticated");

    const event = {
      summary,
      description,
      start: {
        dateTime: start,
        timeZone: 'Asia/Karachi',
      },
      end: {
        dateTime: end,
        timeZone: 'Asia/Karachi',
      },
      attendees: [{ email: attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: `meet-${new Date().getTime()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

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
 * Extract Meet link from a Calendar event
 */
export const getGoogleMeetLink = (event) => {
  if (event?.hangoutLink) return event.hangoutLink;

  const meetLink = event?.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === 'video'
  )?.uri;

  if (meetLink) return meetLink;

  throw new Error(`No Google Meet link found in the event: ${JSON.stringify(event)}`);
};
