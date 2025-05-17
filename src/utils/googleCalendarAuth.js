const CLIENT_ID = '996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCI_qHj3Ou0jlICgsKkeLzqwR9NTl0Tkqo'; 
const SCOPES = "https://www.googleapis.com/auth/calendar.events";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

export const initGoogleCalendarAuth = async () => {
  return new Promise((resolve, reject) => {
    window.gapi.load("client:auth2", async () => {
      try {
        await window.gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });

        const authInstance = window.gapi.auth2.getAuthInstance();

        if (!authInstance.isSignedIn.get()) {
          await authInstance.signIn({ prompt: "consent" }); // prompts user if not signed in
        }

        resolve(window.gapi.client);
      } catch (err) {
        console.error("Google Calendar Auth Error:", err);
        reject(err);
      }
    });
  });
};
