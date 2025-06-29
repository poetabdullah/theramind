import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { sendCancelEmail } from '../utils/sendEmail';
import { arrayUnion } from 'firebase/firestore';
import {
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { deleteGoogleCalendarEvent, refreshAccessToken, deleteEventWithToken } from '../utils/google_api';

const DoctorAppointment = ({ doctorEmail, currentUser, doctors = [] }) => {
	const [appointments, setAppointments] = useState([]);
	const [selectedDate, setSelectedDate] = useState('');
	const [openDates, setOpenDates] = useState({});
	const [doctorsList, setDoctorsList] = useState([]);

	useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'doctors'));
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  fetchDoctors();
}, []);

	useEffect(() => {
		const fetchAppointments = async () => {
			try {
				const appointmentsRef = collection(db, 'appointments');
				const q = query(appointmentsRef, where('doctorEmail', '==', doctorEmail));
				const snapshot = await getDocs(q);
				const sortedAppointments = snapshot.docs
				.map(doc => ({
					id: doc.id,
					...doc.data(),
				}))
				.sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot)); 

				setAppointments(sortedAppointments);

			} catch (error) {
				console.error('Error fetching appointments:', error);
			}
		};

		if (doctorEmail) {
			fetchAppointments();
		}
	}, [doctorEmail]);

	const handleCancelAppointment = async (appointmentId, doctorEmail, timeslot, appData) => {
  try {
    const emailToUse = appData.patientEmail;
    console.log("Patient email: ", emailToUse);

    if (!emailToUse) {
      console.error("Missing patient email during cancellation.");
      throw new Error("Cannot send cancellation email: patient email missing.");
    }

    if (appData.calendarEventId && appData.organizerRefreshToken) {
      const accessToken = await refreshAccessToken(appData.organizerRefreshToken);
      await deleteEventWithToken(appData.patientEmail, appData.calendarEventId, accessToken);
    }

	console.log("Loaded doctors list:", doctors);
	console.log("Trying to match doctorEmail:", doctorEmail);

	if (!Array.isArray(doctors) || doctors.length === 0) {
		throw new Error("Doctors list is missing or not loaded");
	}

    const doctorDoc = doctors.find((doc) => doc.email === doctorEmail);
    if (!doctorDoc) throw new Error("Doctor not found in state");

    const doctorRef = doc(db, "doctors", doctorDoc.id);

    // Delete the appointment from Firestore
    await deleteDoc(doc(db, "appointments", appointmentId));

    // Restore the cancelled timeslot
    await updateDoc(doctorRef, {
      timeslots: arrayUnion(timeslot),
    });

    sendCancelEmail({
      patientName: appData.patientName || 'Unknown Patient',
      doctorName: appData.doctorName || 'Unknown Doctor',
      patientEmail: emailToUse,
      timeslot: timeslot,
      cancelled_by: currentUser?.email || 'Unknown',
    });

    console.log("Sending cancel email to:", emailToUse);
    // Remove from UI
    setAppointments((prev) => prev.filter((appt) => appt.id !== appointmentId));

    toast.success("Appointment cancelled successfully.");
  } catch (error) {
    console.error("Cancellation failed:", error);
    toast.info("Something went wrong while canceling. Please try again.");
  }
};

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
		<>
		<ToastContainer position="bottom-right" autoClose={3000} />
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
							className="w-full text-left text-gray-800 font-semibold text-lg py-3 px-5 bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 transition"
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
													</motion.a><br></br>
													<motion.button
														onClick={(e) => {
														e.stopPropagation();
														handleCancelAppointment(app.id, app.doctorEmail, app.timeslot, app);
													 }}
														className="rounded-lg text-orange-800 font-semibold px-4 py-2 bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 transition"
														whileHover={{ scale: 1.05 }}
													>
														 Cancel
													</motion.button>
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
		</>
	);
};

export default DoctorAppointment;
