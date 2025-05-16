import { gapi } from 'gapi-script';

// Initialize Google API client
export const initGoogleClient = () => {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      discoveryDocs: [
        'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
      ],
    });
  });
};

// Create a Google Calendar event with Meet link
export const createGoogleMeetEvent = async (summary, description, startTime, endTime, attendeeEmail) => {
  try {
    const event = {
      summary,
      description,
      start: {
        dateTime: startTime,
        timeZone: 'Asia/Karachi', // Corrected time zone
      },
      end: {
        dateTime: endTime,
        timeZone: 'Asia/Karachi',
      },
      attendees: [
        { email: attendeeEmail }
      ],
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    return response.result;
  } catch (error) {
    console.error('Error creating Google Meet event:', error);
    throw error;
  }
};
