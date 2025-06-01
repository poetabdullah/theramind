import { initGoogleApi, signInWithGoogle } from './google_api';

export const initGoogleCalendarAuth = async () => {
  try {
    // Load API scripts and initialize client
    await initGoogleApi();

    // Request access token from user
    const accessToken = await signInWithGoogle();

    if (!accessToken) {
      throw new Error("Access token not granted.");
    }

    console.log("✅ Google Calendar access granted");
    return accessToken; // You can now use this with gapi.client calls
  } catch (err) {
    console.error("Google Calendar Auth Error:", err);
    throw err;
  }
};
