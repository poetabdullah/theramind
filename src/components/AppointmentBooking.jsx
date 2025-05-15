import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { motion } from 'framer-motion';
import axios from 'axios';

const therapistOptions = [
	{
		value: 'drruqiabajwa.theramind@gmail.com',
		label: 'Dr. Ruqia Safdar Bajwa',
	},
	{ value: 'fatimasana.theramind@gmail.com', label: 'Ms. Fatima Sana' },
	{ value: 'eshaahmed.theramind@gmail.com', label: 'Ms. Esha Ahmed' },
	{ value: 'eshafazal.theramind@gmail.com', label: 'Ms. Esha Fazal' },
];

export default function AppointmentBooking() {
	const [selectedTherapist, setSelectedTherapist] = useState(null);
	const [startDate, setStartDate] = useState(null);
	const [duration, setDuration] = useState(30); // Duration in minutes
	const [message, setMessage] = useState('');

	const handleBooking = async () => {
		if (!selectedTherapist || !startDate) {
			setMessage('Please select a therapist and a date.');
			return;
		}

		const start = new Date(startDate);
		const end = new Date(start.getTime() + duration * 60000); // 60000 ms = 1 minute

		const payload = {
			therapist_email: selectedTherapist.value,
			start_time: start.toISOString(),
			end_time: end.toISOString(),
		};

		try {
			const response = await fetch(
				'http://localhost:8000/api/calendar/create-event/',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
					body: JSON.stringify(payload),
				}
			);

			const data = await response.json();
			if (response.ok) {
				setMessage(
					`Appointment booked successfully! Join Link: ${data.meetLink}`
				);
			} else {
				setMessage(data.error || 'Something went wrong. Please try again.');
			}
		} catch (error) {
			console.error('Error:', error);
			setMessage('An error occurred. Please try again.');
		}
	};

	return (
		<motion.div className="booking-container p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
			<motion.h2 className="text-xl font-semibold">
				Book a Therapy Session
			</motion.h2>

			<Select
				options={therapistOptions}
				value={selectedTherapist}
				onChange={setSelectedTherapist}
				isClearable
				isSearchable
				name="therapist"
				placeholder="Select a therapist"
			/>

			<DatePicker
				selected={startDate}
				onChange={date => setStartDate(date)}
				showTimeSelect
				timeIntervals={15}
				dateFormat="Pp"
				className="w-full p-2 border rounded"
				placeholderText="Select start date and time"
			/>

			<motion.button
				onClick={handleBooking}
				whileHover={{ scale: 1.05 }}
				className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow"
			>
				Book Appointment
			</motion.button>

			{message && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5 }}
					className="mt-4 text-sm text-green-600"
				>
					{message}
				</motion.div>
			)}
		</motion.div>
	);
}
