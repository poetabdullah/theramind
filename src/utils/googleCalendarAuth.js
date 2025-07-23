import { initGoogleApi } from './google_api';

export const initGoogleCalendarAuth = async () => {
  try {
    //Initializing Google API for Calendar authentication
    await initGoogleApi();
    //Getting the access token from local storage
    return localStorage.getItem("google_calendar_access_token");
  } catch (err) {
    console.error("Google Calendar Auth Init Error:", err);
    throw err;
  }
};
