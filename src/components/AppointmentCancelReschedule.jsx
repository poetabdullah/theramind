import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { motion } from 'framer-motion';
import { sendCancelEmail } from './AppointmentCancelEmail';

const AppointmentCancelReschedule = ({ userEmail }) => {
	const [appointments, setAppointments] = useState([]);
	const [newTimes, setNewTimes] = useState({});

	useEffect(() => {
		const fetchAppointments = async () => {
			const snapshot = await db
				.collection('appointments')
				.where('patientEmail', '==', userEmail)
				.get();

			setAppointments(
				snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}))
			);
		};
		fetchAppointments();
	}, [userEmail]);

	const cancelAppointment = async (
		appointmentId,
		doctorId,
		timeslot,
		appData
	) => {
		await db.collection('appointments').doc(appointmentId).delete();

		await db
			.collection('doctors')
			.doc(doctorId)
			.update({
				timeslots: firebase.firestore.FieldValue.arrayUnion(timeslot),
			});

		alert('Appointment cancelled successfully.');

		sendCancelEmail({
			patient_name: appData.patientName,
			doctor_name: appData.doctorName,
			doctor_email: appData.doctorEmail,
			patient_email: appData.patientEmail,
			time: timeslot,
		});
	};

	const handleReschedule = async (
		appointmentId,
		doctorId,
		oldTimeslot,
		appData
	) => {
		const newTimeslot = newTimes[appointmentId];
		if (!newTimeslot) return alert('Please select a new time.');

		const appointmentRef = db.collection('appointments').doc(appointmentId);
		await appointmentRef.update({ timeslot: newTimeslot });

		const doctorRef = db.collection('doctors').doc(doctorId);
		await doctorRef.update({
			timeslots: firebase.firestore.FieldValue.arrayRemove(oldTimeslot),
		});
		await doctorRef.update({
			timeslots: firebase.firestore.FieldValue.arrayUnion(newTimeslot),
		});

		alert('Appointment rescheduled successfully!');

		sendCancelEmail({
			patient_name: appData.patientName,
			doctor_name: appData.doctorName,
			doctor_email: appData.doctorEmail,
			patient_email: appData.patientEmail,
			newTime: newTimeslot,
			meet_link: appData.meetLink,
		});
	};

	return (
		<motion.div className="p-4">
			<motion.h2 className="text-xl font-bold mb-4">
				Your Appointments
			</motion.h2>
			<motion.ul className="space-y-6">
				{appointments.map(app => (
					<motion.li key={app.id} className="border p-4 rounded shadow">
						<p>
							<b>Doctor:</b> {app.doctorName}
						</p>
						<p>
							<b>Patient:</b> {app.patientName}
						</p>
						<p>
							<b>Time:</b> {app.timeslot}
						</p>
						<p>
							<b>Meet Link:</b>{' '}
							<a href={app.meetLink} className="text-blue-500 underline">
								{app.meetLink}
							</a>
						</p>

						<input
							type="datetime-local"
							className="mt-2 p-1 border rounded"
							value={newTimes[app.id] || ''}
							onChange={e =>
								setNewTimes(prev => ({ ...prev, [app.id]: e.target.value }))
							}
						/>

						<div className="flex gap-2 mt-2">
							<button
								className="bg-green-500 text-white px-3 py-1 rounded"
								onClick={() =>
									handleReschedule(app.id, app.doctorId, app.timeslot, app)
								}
							>
								Reschedule
							</button>
							<button
								className="bg-red-500 text-white px-3 py-1 rounded"
								onClick={() =>
									cancelAppointment(app.id, app.doctorId, app.timeslot, app)
								}
							>
								Cancel
							</button>
						</div>
					</motion.li>
				))}
			</motion.ul>
		</motion.div>
	);
};

export default AppointmentCancelReschedule;
