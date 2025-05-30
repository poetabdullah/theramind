import { gapi } from "gapi-script";

// utils/google_api.js
export const initGoogleApi = () => {
	return new Promise((resolve, reject) => {
		if (window.gapi?.client) {
			return resolve(true); // Already initialized
		}

		const script = document.createElement('script');
		script.src = 'https://apis.google.com/js/api.js';
		script.onload = () => {
			window.gapi.load('client:auth2', () => {
				window.gapi.client
					.init({
						apiKey: 'AIzaSyCI_qHj3Ou0jlICgsKkeLzqwR9NTl0Tkqo',
						clientId: '996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com',
						discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
						scope: 'https://www.googleapis.com/auth/calendar.events',
					})
					.then(() => {
						resolve(gapi.auth2.getAuthInstance().isSignedIn.get());
					})
					.catch((err) => {
						console.error("GAPI init error:", err);
						reject('Failed to initialize Google API: ' + JSON.stringify(err));
					});
			});
		};
		script.onerror = () => reject('Failed to load gapi script.');
		document.body.appendChild(script);
	});
};




export function signInWithGoogle() {
	return gapi.auth2.getAuthInstance().signIn();
}

export const createGoogleMeetEvent = async (summary, description, start, end, attendeeEmail) => {
	try {
		const authInstance = window.gapi.auth2.getAuthInstance();
		const user = authInstance.currentUser.get();
		const isAuthorized = user && user.isSignedIn();

		if (!isAuthorized) {
			throw new Error('User is not signed in to Google');
		}

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
			attendees: [
				{ email: attendeeEmail }
			],
			conferenceData: {
				createRequest: {
					requestId: `meet-${new Date().getTime()}`,
					conferenceSolutionKey: {
						type: 'hangoutsMeet'
					}
				}
			}
		};

		const response = await window.gapi.client.calendar.events.insert({
			calendarId: 'primary',
			resource: event,
			conferenceDataVersion: 1
		});

		return response.result;
	} catch (error) {
		console.error('Error creating Google Calendar event:', error);
		throw error;
	}
};
export const getGoogleMeetLink = (event) => {
	if (event?.hangoutLink) return event.hangoutLink;

	const meetLink = event?.conferenceData?.entryPoints?.find(
		(e) => e.entryPointType === 'video'
	)?.uri;

	if (meetLink) return meetLink;

	throw new Error('No Google Meet link found in the event');
};

