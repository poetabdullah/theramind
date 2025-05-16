import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig.js';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { motion } from 'framer-motion';

const DoctorAppointment = ({ doctorEmail }) => {
	const [appointments, setAppointments] = useState([]);

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				const appointmentsRef = collection(db, 'appointments');

				// Combined filter on doctorEmail (the second .where was likely redundant)
				const q = query(
					appointmentsRef,
					where('doctorEmail', '==', doctorEmail)
				);

				const snapshot = await getDocs(q);

				setAppointments(
					snapshot.docs.map(doc => ({
						id: doc.id,
						...doc.data(),
					}))
				);
			} catch (error) {
				console.error('Error fetching appointments:', error);
			}
		};

		if (doctorEmail) {
			fetchAppointments();
		}
	}, [doctorEmail]);

	return (
		<motion.div>
			<motion.h2 className="text-xl font-bold mb-4">
				Your Appointments
			</motion.h2>
			{appointments.length === 0 && <motion.p>No appointments yet!</motion.p>}

			{appointments.map(appointment => (
				<motion.div
					key={appointment.id}
					className="appointment"
					style={{
						border: '1px solid #ccc',
						padding: '10px',
						margin: '10px 0',
					}}
				>
					<motion.p>
						<strong>Patient Name:</strong> {appointment.patientName}
					</motion.p>
					<motion.p>
						<strong>Patient Email:</strong> {appointment.patientEmail}
					</motion.p>
					<motion.p>
						<strong>Date:</strong> {appointment.date || '—'}
					</motion.p>
					<motion.p>
						<strong>Time:</strong> {appointment.timeslot || appointment.time}
					</motion.p>
					<motion.p>
						<strong>Meet Link:</strong>{' '}
						<a
							href={appointment.meetLink}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-500 underline"
						>
							Join
						</a>
					</motion.p>
				</motion.div>
			))}
		</motion.div>
	);
};

export default DoctorAppointment;
