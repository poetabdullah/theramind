import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { motion } from 'framer-motion';

const DoctorAppointment = ({ doctorEmail }) => {
	const [appointments, setAppointments] = useState([]);

	useEffect(() => {
		// Fetching Doctor's Information From Firestore Database
		db.collection('appointements')
			.where('doctorEmail', '==', doctorEmail)
			.where('email', '==', doctorEmail)
			.get()
			.then(snapshot => {
				setAppointments(
					snapshot.docs.map(doc => ({ email: doc.email, ...doc.data() }))
				);
			});
	}, [doctorEmail]);

	return (
		<motion.div>
			<motion.h2>Your Appointments</motion.h2>
			{appointments.length === 0 && <motion.p>No appointment yet!</motion.p>}
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
						<strong>Patient Name:</strong> {appointment.name}
					</motion.p>
					<motion.p>
						<strong>Patient Email:</strong> {appointment.email}
					</motion.p>
					<motion.p>
						<strong>Date:</strong> {appointment.date}
					</motion.p>
					<motion.p>
						<strong>Time:</strong> {appointment.time}
					</motion.p>
					<motion.p>
						<strong>Meet Link:</strong>{' '}
						<a
							href={appointment.meetLink}
							target="_blank"
							rel="noopener noreferrer"
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
