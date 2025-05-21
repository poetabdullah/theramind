import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorAppointment = ({ doctorEmail }) => {
	const [appointments, setAppointments] = useState([]);
	const [selectedDate, setSelectedDate] = useState('');
	const [openDates, setOpenDates] = useState({});

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				const appointmentsRef = collection(db, 'appointments');
				const q = query(appointmentsRef, where('doctorEmail', '==', doctorEmail));
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

	const formatDateTime = isoString => {
		if (!isoString) return '—';
		const date = new Date(isoString);
		if (isNaN(date)) return 'Invalid date';
		return date.toLocaleString(undefined, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	};

	const formatDate = isoString =>
		new Date(isoString).toLocaleDateString(undefined, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

	const toggleDateSection = date => {
		setOpenDates(prev => ({ ...prev, [date]: !prev[date] }));
	};

	const filteredAppointments = selectedDate
		? appointments.filter(app => {
				const appDate = new Date(app.timeslot).toISOString().split('T')[0];
				return appDate === selectedDate;
		  })
		: appointments;

	const groupedAppointments = filteredAppointments.reduce((acc, app) => {
		const dateKey = formatDate(app.timeslot);
		if (!acc[dateKey]) acc[dateKey] = [];
		acc[dateKey].push(app);
		return acc;
	}, {});

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="mx-auto py-8"
		>
			{/* Appointment Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-white rounded-2xl shadow-md p-6 mb-6"
			>
			<motion.h2 className="text-2xl font-bold mb-6 text-gray-700">
				Your Appointments
			</motion.h2>

			<motion.div className="mb-6">
				<motion.label htmlFor="dateFilter" className="block text-gray-700 font-medium mb-1">
					Filter by Date
				</motion.label>
				<motion.input
					type="date"
					id="dateFilter"
					value={selectedDate}
					onChange={e => setSelectedDate(e.target.value)}
					className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
				/>
			</motion.div>

			{Object.keys(groupedAppointments).length === 0 ? (
				<motion.p className="text-center text-gray-500 mt-6">
					No appointments found on this date.
				</motion.p>
			) : (
				Object.entries(groupedAppointments).map(([date, group]) => (
					<motion.div key={date} className="border rounded-2xl shadow-lg mb-4 overflow-hidden">
						<motion.button
							onClick={() => toggleDateSection(date)}
							className="w-full text-left text-gray-800 font-semibold text-lg py-3 px-5 bg-gradient-to-r from-orange-200 to-orange-300 hover:from-orange-300 hover:to-orange-400 transition"
						>
							{date} {openDates[date] ? '▲' : '▼'}
						</motion.button>

						<AnimatePresence initial={false}>
							{openDates[date] && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3 }}
									className="bg-white"
								>
									<motion.div className="p-4 space-y-4">
										{group.map(app => (
											<motion.div
												key={app.id}
												className="bg-gray-100 p-4 rounded-xl shadow-sm space-y-1"
											>
												<motion.p>
													<motion.span className="font-semibold">Patient Name:</motion.span>{' '}
													{app.patientName}
												</motion.p>
												<motion.p>
													<motion.span className="font-semibold">Patient Email:</motion.span>{' '}
													{app.patientEmail}
												</motion.p>
												<motion.p>
													<motion.span className="font-semibold">Date & Time:</motion.span>{' '}
													{formatDateTime(app.timeslot)}
												</motion.p>
												<motion.p>
													<motion.span className="font-semibold">Meet Link:</motion.span>{' '}
													<motion.a
														href={app.meetLink}
														target="_blank"
														rel="noopener noreferrer"
														className="text-orange-600 no-underline hover:text-orange-700"
													>
														Join the meeting
													</motion.a>
												</motion.p>
											</motion.div>
										))}
									</motion.div>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>
				))
			)}
		</motion.div>
		</motion.div>
	);
};

export default DoctorAppointment;
