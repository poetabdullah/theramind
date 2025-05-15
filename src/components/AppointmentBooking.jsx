import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const AppointmentBooking = () => {
	const [form, setForm] = useState({
		name: '',
		email: '',
		doctor: '',
		datetime: '',
	});

	//Booking an Apppontment
	// This function handles the form submission
	const handleSubmit = async e => {
		e.preventDefault();
		try {
			const response = await axios.post(
				'http://localhost:8080/api/book-appointment',
				form
			);
			alert(
				'Appointment booked successfully! Check your email for confirmation.'
			);
		} catch (error) {
			console.error('Error booking appointment:', error);
			alert('Failed to book appointment. Please try again later.');
		}
	};

	//Cancelling an Appointment
	// This function handles the cancellation of an appointment
	const cancelAppointment = async appointmentId => {
		try {
			await axios.post('http://localhost:8080/api/cancel-appointment/', {
				appointmentId: appointmentId,
			});
			alert('Appointment cancelled successfully!');
		} catch (error) {
			console.error('Error cancelling appointment:', error);
			alert('Failed to cancel appointment. Please try again later.');
		}
	};

	//Reshedulling an Appointment
	// This function handles the rescheduling of an appointment
	const rescheduleAppointment = async (appointmentId, newDateTime) => {
		try {
			await axios.post('http://localhost:8080/api/reschedule-appointment/', {
				appointmentId: appointmentId,
				newDateTime: newDateTime,
			});
			alert('Appointment rescheduled successfully!');
		} catch (error) {
			console.error('Error rescheduling appointment:', error);
			alert('Failed to reschedule appointment. Please try again later.');
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			<motion.div className="container mx-auto p-4">
				<motion.h1 className="text-2xl font-bold mb-4">
					Book an Appointment
				</motion.h1>
				<motion.form className="space-y-4" onSubmit={handleSubmit}>
					<motion.input
						type="text"
						placeholder="Enter your name"
						className="border p-2 w-full"
						value={form.name}
						onChange={e => setForm({ ...form, name: e.target.value })}
						required
					/>
					<motion.input
						type="email"
						placeholder="Enter your email"
						className="border p-2 w-full"
						value={form.email}
						onChange={e => setForm({ ...form, email: e.target.value })}
						required
					/>
					<motion.select
						className="border p-2 w-full"
						value={form.doctor}
						onChange={e => setForm({ ...form, doctor: e.target.value })}
						required
					>
						<motion.option value="">Select Doctor</motion.option>
						<motion.option value="Dr. Ruqia Safdar Bajwa">
							Dr. Ruqia Safdar Bajwa
						</motion.option>
						<motion.option value="Ms. Fatima Sana">
							Ms. Fatima Sana
						</motion.option>
						<motion.option value="Ms. Esha Ahmed">Ms. Esha Ahmed</motion.option>
						<motion.option value="Ms. Esha Fazal">Ms. Esha Fazal</motion.option>
					</motion.select>
					<motion.input
						type="datetime-local"
						className="border p-2 w-full"
						value={form.datetime}
						onChange={e => setForm({ ...form, datetime: e.target.value })}
						required
					/>
					<motion.button
						type="submit"
						className="bg-blue-500 text-white p-2 rounded"
					>
						Book Appointment
					</motion.button>
					<motion.button
						type="button"
						className="bg-red-500 text-white p-2 rounded"
						onClick={() => cancelAppointment('appointmentId')}
					>
						Cancel Appointment
					</motion.button>
					<motion.button
						type="button"
						className="bg-yellow-500 text-white p-2 rounded"
						onClick={() => {
							const newDateTime = prompt(
								'Enter new date and time (YYYY-MM-DDTHH:MM):'
							);
							// Call the reschedule function with the appointment ID and new date-time
							rescheduleAppointment('appointmentId', newDateTime);
						}}
					>
						Reschedule Appointment
					</motion.button>
				</motion.form>
			</motion.div>
		</motion.div>
	);
};

export default AppointmentBooking;
