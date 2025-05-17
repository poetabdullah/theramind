import { gapi } from "gapi-script";

// utils/google_api.js
export const initGoogleApi = async () => {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = 'https://apis.google.com/js/api.js';
		script.onload = () => {
			window.gapi.load('client:auth2', async () => {
				try {
					await window.gapi.client.init({
						apiKey: 'AIzaSyCI_qHj3Ou0jlICgsKkeLzqwR9NTl0Tkqo',
						clientId: '996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com',
						discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
						scope: 'https://www.googleapis.com/auth/calendar.events',
					});

				} catch (err) {
					console.error("GAPI init error:", err); // ← this helps
					reject('Failed to initialize Google API: ' + JSON.stringify(err));
				}
			});
		};
		script.onerror = () => reject('Failed to load gapi script.');
		document.body.appendChild(script);
	});
};


export function initGoogleClient() {
	return new Promise((resolve) => {
		gapi.load("client:auth2", () => {
			gapi.client
				.init({
					apiKey: 'AIzaSyCI_qHj3Ou0jlICgsKkeLzqwR9NTl0Tkqo',
					clientId: '996770367618-1u5ib31uqm033hf0n353rc45qt7r2gpg.apps.googleusercontent.com',
					discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
					scope: 'https://www.googleapis.com/auth/calendar.events',
				})
				.then(() => {
					const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
					resolve(isSignedIn);
				});
		});
	});
}

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
				timeZone: 'Asia/Pakistan',
			},
			end: {
				dateTime: end,
				timeZone: 'Asia/Pakistan',
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
	if (event && event.hangoutLink) {
		return event.hangoutLink;
	} else {
		throw new Error('No Google Meet link found in the event');
	}
};
