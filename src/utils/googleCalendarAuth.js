import { initGoogleApi } from './google_api';

export const initGoogleCalendarAuth = async () => {
  try {
    await initGoogleApi(); // No prompt
    return localStorage.getItem("google_calendar_access_token");
  } catch (err) {
    console.error("Google Calendar Auth Init Error:", err);
    throw err;
  }
};
