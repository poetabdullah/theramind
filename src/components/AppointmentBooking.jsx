import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebaseConfig.js';
import {
	collection,
	getDocs,
	addDoc,
	query,
	where,
	deleteDoc,
	doc,
	updateDoc,
} from 'firebase/firestore';
import { initGoogleClient } from '../utils/google_api';
import { initGoogleCalendarAuth } from '../utils/googleCalendarAuth';
import { sendAppointmentConfirmationEmail } from './AppointmentConfirmationEmail';

const AppointmentBooking = () => {
	const [doctors, setDoctors] = useState([]);
	const [selectedDoctor, setSelectedDoctor] = useState(null);
	const [selectedTimeslot, setSelectedTimeslot] = useState('');
	const [patientName, setPatientName] = useState('');
	const [patientEmail, setPatientEmail] = useState('');
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [error, setError] = useState('');
	const [appointments, setAppointments] = useState([]);
	const [loadingAppointments, setLoadingAppointments] = useState(false);
	const [reschedulingAppointment, setReschedulingAppointment] = useState(null);

	// Initialize Google API and fetch patient info
	useEffect(() => {
		const fetchPatientInfo = async () => {
			try {
				await initGoogleClient();
				const user = window.gapi.auth2.getAuthInstance().currentUser.get();
				if (user && user.isSignedIn()) {
					const profile = user.getBasicProfile();
					const email = profile.getEmail();
					const q = query(collection(db, 'patients'), where('email', '==', email));
					const snapshot = await getDocs(q);
					if (!snapshot.empty) {
						const patientDoc = snapshot.docs[0];
						const patientData = patientDoc.data();
						setPatientName(patientData.name);
						setPatientEmail(patientData.email);
					} else {
						console.warn('Patient not found in Firestore, using Google profile data');
						setPatientName(profile.getName());
						setPatientEmail(email);
					}
					setIsSignedIn(true);
				}
			} catch (err) {
				console.error('Error during Google sign-in or fetching patient info:', err);
			}
		};
		fetchPatientInfo();
	}, []);

	useEffect(() => {
		const fetchDoctors = async () => {
			try {
				const snapshot = await getDocs(collection(db, 'doctors'));
				const doctorList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				setDoctors(doctorList);
			} catch (error) {
				console.error('Error fetching doctors:', error);
			}
		};
		fetchDoctors();
	}, []);

	useEffect(() => {
		const fetchAppointments = async () => {
			if (!patientEmail) return;
			setLoadingAppointments(true);
			try {
				const q = query(collection(db, 'appointments'), where('patientEmail', '==', patientEmail));
				const snapshot = await getDocs(q);
				const appts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				setAppointments(appts);
			} catch (error) {
				console.error('Error fetching appointments:', error);
			}
			setLoadingAppointments(false);
		};
		fetchAppointments();
	}, [patientEmail]);

	const handleBooking = async () => {
		if (!selectedDoctor || !selectedTimeslot || !patientName) {
			setError('Please fill all fields before booking.');
			return;
		}
		setError('');
		try {
			await initGoogleCalendarAuth();
			const start = new Date(selectedTimeslot);
			const end = new Date(start.getTime() + 30 * 60000);
			const event = {
				summary: `Appointment with ${selectedDoctor.fullName}`,
				description: 'TheraMind Appointment',
				start: { dateTime: start.toISOString(), timeZone: 'Asia/Karachi' },
				end: { dateTime: end.toISOString(), timeZone: 'Asia/Karachi' },
				conferenceData: {
					createRequest: {
						requestId: Math.random().toString(36).substring(7),
						conferenceSolutionKey: { type: 'hangoutsMeet' },
					},
				},
				attendees: [ { email: patientEmail }, { email: selectedDoctor.email } ],
			};
			const response = await window.gapi.client.calendar.events.insert({
				calendarId: 'primary',
				resource: event,
				conferenceDataVersion: 1,
				sendUpdates: 'all',
			});
			const meetLink = response.result.hangoutLink;
			const calendarEventId = response.result.id;
			await addDoc(collection(db, 'appointments'), {
				doctorEmail: selectedDoctor.email,
				doctorName: selectedDoctor.fullName,
				patientName,
				patientEmail,
				timeslot: selectedTimeslot,
				meetLink,
				calendarEventId,
			});

			sendAppointmentConfirmationEmail({
				patientName,
				patientEmail,
				doctorName: selectedDoctor.fullName,
				timeslot: selectedTimeslot,
				meetLink,
			});

			alert('Appointment Booked Successfully! Check your email & calendar.');
			setSelectedDoctor(null);
			setSelectedTimeslot('');
			setAppointments(prev => [...prev, {
				doctorEmail: selectedDoctor.email,
				doctorName: selectedDoctor.fullName,
				patientName,
				patientEmail,
				timeslot: selectedTimeslot,
				meetLink,
				calendarEventId,
			}]);
		} catch (error) {
			console.error('Booking failed:', error);
			alert('Something went wrong. Please try again.');
		}
	};

	// Cancel appointment handler
	const handleCancel = async (appointment) => {
		if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

		try {
			await initGoogleCalendarAuth();

			// Delete from Google Calendar
			await window.gapi.client.calendar.events.delete({
				calendarId: 'primary',
				eventId: appointment.calendarEventId,
			});

			// Delete from Firestore
			await deleteDoc(doc(db, 'appointments', appointment.id));

			// Update UI
			setAppointments(appts => appts.filter(a => a.id !== appointment.id));
			alert('Appointment canceled successfully.');
		} catch (error) {
			console.error('Failed to cancel appointment:', error);
			alert('Failed to cancel appointment. Please try again.');
		}
	};

	// Start rescheduling: load appointment details into booking form
	const startReschedule = (appointment) => {
		setReschedulingAppointment(appointment);
		// Set selected doctor & timeslot to current appointment values
		const docObj = doctors.find(d => d.email === appointment.doctorEmail);
		setSelectedDoctor(docObj || null);
		setSelectedTimeslot(appointment.timeslot);
	};

	// Confirm rescheduling handler
	const confirmReschedule = async () => {
		if (!reschedulingAppointment) return;

		if (!selectedDoctor || !selectedTimeslot) {
			setError('Please select doctor and timeslot.');
			return;
		}

		setError('');

		try {
			await initGoogleCalendarAuth();

			const start = new Date(selectedTimeslot);
			const end = new Date(start.getTime() + 30 * 60000);

			// Update event on Google Calendar
			const event = {
				summary: `Appointment with ${selectedDoctor.fullName}`,
				description: 'TheraMind Appointment (Rescheduled)',
				start: {
					dateTime: start.toISOString(),
					timeZone: 'Asia/Pakistan',
				},
				end: {
					dateTime: end.toISOString(),
					timeZone: 'Asia/Pakistan',
				},
				attendees: [{ email: patientEmail }, { email: selectedDoctor.email }],
			};

			await window.gapi.client.calendar.events.update({
				calendarId: 'primary',
				eventId: reschedulingAppointment.calendarEventId,
				resource: event,
				sendUpdates: 'all',
			});

			// Update Firestore
			const appointmentRef = doc(db, 'appointments', reschedulingAppointment.id);
			await updateDoc(appointmentRef, {
				doctorEmail: selectedDoctor.email,
				doctorName: selectedDoctor.fullName,
				timeslot: selectedTimeslot,
			});

			// Update local state
			setAppointments(appts =>
				appts.map(a =>
					a.id === reschedulingAppointment.id
						? { ...a, doctorEmail: selectedDoctor.email, doctorName: selectedDoctor.fullName, timeslot: selectedTimeslot }
						: a
				)
			);

			alert('Appointment rescheduled successfully!');
			setReschedulingAppointment(null);
			setSelectedDoctor(null);
			setSelectedTimeslot('');
		} catch (error) {
			console.error('Failed to reschedule appointment:', error);
			alert('Failed to reschedule appointment. Please try again.');
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="container mx-auto p-4">
				<h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>

				{error && <p className="text-red-500 mb-2">{error}</p>}

				{/* Doctor Selection */}
				<select
					className="border p-2 w-full mb-2"
					value={selectedDoctor?.email || ''}
					onChange={e => {
						const selected = doctors.find(d => d.email === e.target.value);
						setSelectedDoctor(selected || null);
					}}
					disabled={!!reschedulingAppointment}
				>
					<option value="">Select a Doctor</option>
					{doctors.map(doc => (
						<option key={doc.id} value={doc.email}>
							{doc.fullName}
						</option>
					))}
				</select>

				{/* Timeslot Selection */}
				{selectedDoctor && selectedDoctor.timeslots?.length > 0 && (
					<select
						className="border p-2 w-full mb-2"
						value={selectedTimeslot}
						onChange={e => setSelectedTimeslot(e.target.value)}
					>
						<option value="">Select a Timeslot</option>
						{selectedDoctor.timeslots.map(slot => (
							<option key={slot} value={slot}>
								{new Date(slot).toLocaleString('en-US', {
									weekday: 'long',
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: 'numeric',
									minute: '2-digit',
									hour12: true,
								})}
							</option>
						))}
					</select>
				)}

				{/* Patient Info */}
				<input
					type="text"
					className="border p-2 w-full mb-2"
					placeholder="Enter your name"
					value={patientName}
					onChange={e => setPatientName(e.target.value)}
					disabled={!!reschedulingAppointment}
				/>

				{/* Book or Reschedule Button */}
				{reschedulingAppointment ? (
					<div className="flex space-x-2">
						<button
							className="p-2 rounded bg-yellow-500 text-white w-full"
							onClick={confirmReschedule}
							disabled={!selectedDoctor || !selectedTimeslot}
						>
							Confirm Reschedule
						</button>
						<button
							className="p-2 rounded bg-gray-400 text-white w-full"
							onClick={() => {
								setReschedulingAppointment(null);
								setSelectedDoctor(null);
								setSelectedTimeslot('');
							}}
						>
							Cancel
						</button>
					</div>
				) : (
					<button
						type="submit"
						className={`p-2 rounded w-full text-white ${
							selectedDoctor && selectedTimeslot && patientName
								? 'bg-purple-500 hover:bg-purple-600'
								: 'bg-gray-400 cursor-not-allowed'
						}`}
						onClick={handleBooking}
						disabled={!selectedDoctor || !selectedTimeslot || !patientName}
					>
						Book Appointment
					</button>
				)}

				{/* Existing Appointments */}
				<h2 className="text-xl font-semibold mt-8 mb-4">Your Appointments</h2>
				{loadingAppointments ? (
					<p>Loading appointments...</p>
				) : appointments.length === 0 ? (
					<p>No appointments found.</p>
				) : (
					<ul>
						{appointments.map(appointment => (
							<li
								key={appointment.id}
								className="border p-4 mb-2 rounded flex flex-col md:flex-row md:justify-between md:items-center"
							>
								<div>
									<p>
										<strong>Doctor:</strong> {appointment.doctorName}
									</p>
									<p>
										<strong>Time:</strong>{' '}
										{new Date(appointment.timeslot).toLocaleString('en-US', {
											weekday: 'long',
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: 'numeric',
											minute: '2-digit',
											hour12: true,
										})}
									</p>
									<p>
										<strong>Meet Link:</strong>{' '}
										<a
											href={appointment.meetLink}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 underline"
										>
											Join Meeting
										</a>
									</p>
								</div>
								<div className="mt-2 md:mt-0 flex space-x-2">
									<button
										className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded"
										onClick={() => startReschedule(appointment)}
									>
										Reschedule
									</button>
									<button
										className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
										onClick={() => handleCancel(appointment)}
									>
										Cancel
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</motion.div>
	);
};

export default AppointmentBooking;
