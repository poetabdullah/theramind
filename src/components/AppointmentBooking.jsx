import React, { useState, useEffect } from 'react';
import { createGoogleMeetEvent } from '../utils/google_api';
import { sendAppointmentConfirmationEmail } from './AppointmentConfirmationEmail';
import { motion } from 'framer-motion';
import { db } from '../firebaseConfig.js';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const AppointmentBooking = () => {
	const [doctors, setDoctors] = useState([]);
	const [selectedDoctor, setSelectedDoctor] = useState(null);
	const [selectedTimeslot, setSelectedTimeslot] = useState('');
	const [patientName, setPatientName] = useState('');
	const [patientEmail, setPatientEmail] = useState('');

	// ✅ Fetching doctors from Firestore using v9 modular syntax
	useEffect(() => {
		const fetchDoctors = async () => {
			try {
				const doctorsCollection = collection(db, 'doctors');
				const snapshot = await getDocs(doctorsCollection);
				const doctorList = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data(),
				}));
				setDoctors(doctorList);
			} catch (error) {
				console.error('Error fetching doctors:', error);
			}
		};

		fetchDoctors();
	}, []);

	// ✅ Booking logic
	const handleBooking = async () => {
		if (!selectedDoctor || !selectedTimeslot || !patientName || !patientEmail) {
			alert('Please fill all fields before booking.');
			return;
		}

		try {
			const event = await createGoogleMeetEvent(
				`Appointment with ${selectedDoctor.name}`,
				`TheraMind Appointment`,
				selectedTimeslot,
				new Date(
					new Date(selectedTimeslot).getTime() + 30 * 60000
				).toISOString(),
				selectedDoctor.email
			);

			const meetLink = event.hangoutLink;

			// ✅ Save appointment to Firestore
			await addDoc(collection(db, 'appointments'), {
				doctorEmail: selectedDoctor.email,
				patientName,
				patientEmail,
				timeslot: selectedTimeslot,
				meetLink,
			});

			// ✅ Send confirmation email
			await sendAppointmentConfirmationEmail({
				patient_name: patientName,
				doctor_name: selectedDoctor.fullName,
				email: patientEmail,
				time: selectedTimeslot,
				meet_link: meetLink,
			});

			alert(
				'Appointment Booked Successfully! Check your email for confirmation.'
			);
		} catch (error) {
			console.error('Booking failed:', error);
			alert('Something went wrong. Please try again.');
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

				{/* Doctor Selection */}
				<select
					className="border p-2 w-full mb-2"
					value={selectedDoctor?.email || ''}
					onChange={e => {
						const selected = doctors.find(d => d.email === e.target.value);
						setSelectedDoctor(selected || null);
					}}
				>
					<option value="">Select a Doctor</option>
					{doctors.map(doc => (
						<option key={doc.email} value={doc.email}>
							{doc.fullName}
						</option>
					))}
				</select>

				{/* Timeslot Selection */}
				{selectedDoctor && (
					<select
						className="border p-2 w-full mb-2"
						value={selectedTimeslot}
						onChange={e => setSelectedTimeslot(e.target.value)}
					>
						<option value="">Select a Timeslot</option>
						{selectedDoctor.timeslots?.map((slot, idx) => (
							<option key={idx} value={slot}>
								{slot}
							</option>
						))}
					</select>
				)}

				{/* Patient Name */}
				<input
					type="text"
					className="border p-2 w-full mb-2"
					placeholder="Enter your name"
					value={patientName}
					onChange={e => setPatientName(e.target.value)}
				/>

				{/* Patient Email */}
				<input
					type="email"
					className="border p-2 w-full mb-4"
					placeholder="Enter your email"
					value={patientEmail}
					onChange={e => setPatientEmail(e.target.value)}
				/>

				{/* Book Button */}
				<button
					type="submit"
					className="bg-purple-500 text-white p-2 rounded w-full"
					onClick={handleBooking}
				>
					Book Appointment
				</button>
			</div>
		</motion.div>
	);
};

export default AppointmentBooking;
