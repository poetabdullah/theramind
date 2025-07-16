import { initGoogleApi, signInWithGoogle } from './google_api';

export const initGoogleCalendarAuth = async () => {
  try {
    //Loading API scripts and initializing client
    await initGoogleApi();

    //Requesting access token from user
    const accessToken = await signInWithGoogle();

    if (!accessToken) {
      throw new Error("Access token not granted.");
    }

    console.log("✅ Google Calendar access granted");
    return accessToken;
  } catch (err) {
    console.error("Google Calendar Auth Error:", err);
    throw err;
  }
};
