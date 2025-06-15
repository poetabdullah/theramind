import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DoctorTimeslotManagement = ({ doctorEmail }) => {
	const [doctorData, setDoctorData] = useState(null);
	const [selectedDate, setSelectedDate] = useState(null);
	const [selectedTime, setSelectedTime] = useState(null);
	const [repeatWeeks, setRepeatWeeks] = useState(1);
	const [openDates, setOpenDates] = useState({});

	const combineDateAndTime = (date, time) => {
		if (!date || !time) return null;
		const combined = new Date(date);
		combined.setHours(time.getHours());
		combined.setMinutes(time.getMinutes());
		return combined.toISOString();
	};

	const formatDate = dateStr =>
		new Date(dateStr).toLocaleDateString(undefined, {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

	const todayKey = formatDate(new Date().toISOString());

	useEffect(() => {
		const fetchDoctorData = async () => {
			try {
				const docRef = doc(db, 'doctors', doctorEmail);
				const docSnap = await getDoc(docRef);

				if (docSnap.exists()) {
					const data = docSnap.data();
					const cleanTimeslots = data?.timeslots?.filter(Boolean) || [];
					setDoctorData({
						email: doctorEmail,
						...data,
						timeslots: cleanTimeslots,
					});
				} else {
					const newDoctor = {
						email: doctorEmail,
						name: 'Doctor',
						timeslots: [],
					};
					await setDoc(docRef, newDoctor);
					setDoctorData(newDoctor);
				}
			} catch (error) {
				console.error('Error fetching doctor data:', error);
			}
		};

		if (doctorEmail) {
			fetchDoctorData();
		}
	}, [doctorEmail]);

	useEffect(() => {
		if (!doctorData) return;
		const todayKey = formatDate(new Date().toISOString());
		const grouped = groupSlotsByDate(doctorData.timeslots || []);
		if (grouped[todayKey]) {
			setOpenDates(prev => ({ ...prev, [todayKey]: true }));
		}
	}, [doctorData]);

	const groupSlotsByDate = slots => {
		return slots.reduce((groups, slot) => {
		const slotDate = new Date(slot);
		const now = new Date();
		if (slotDate <= now) return groups;
				const dateKey = formatDate(slot);
				if (!groups[dateKey]) groups[dateKey] = [];
				groups[dateKey].push(slot);
				//Sorting the timeslots for each date
				groups[dateKey].sort((a, b) => new Date(a) - new Date(b));
				return groups;
			}, {});
	};

	const handleAddTimeslot = async () => {
		const baseDate = combineDateAndTime(selectedDate, selectedTime);
		if (!baseDate) return toast.error('Please select both date and time.');

		if (new Date(baseDate) <= new Date()){
			return toast.info ('You cannot add a timeslot in the past!');
		}

		const repeatedSlots = [];
		const base = new Date(baseDate);

		for (let i = 0; i < repeatWeeks; i++) {
			const newSlot = new Date(base);
			newSlot.setDate(base.getDate() + i * 7);
			repeatedSlots.push(newSlot.toISOString());
		}

		const updatedTimeslots = [
			...(doctorData?.timeslots || []),
			...repeatedSlots.filter(ts => !doctorData?.timeslots?.includes(ts)),
		];

		try {
			await updateDoc(doc(db, 'doctors', doctorEmail), {
				timeslots: updatedTimeslots,
			});
			setDoctorData(prev => ({ ...prev, timeslots: updatedTimeslots }));
			setSelectedDate(null);
			setSelectedTime(null);
			toast.success(`Added ${repeatedSlots.length} timeslot(s) successfully!`);
		} catch (error) {
			console.error('Failed to add timeslot:', error);
			toast.error('Failed to add timeslot.');
		}
	};

	const handleRemoveTimeslot = async slot => {
		const filtered = doctorData.timeslots.filter(ts => ts !== slot);
		try {
			await updateDoc(doc(db, 'doctors', doctorEmail), {
				timeslots: filtered,
			});
			setDoctorData(prev => ({ ...prev, timeslots: filtered }));
		} catch (error) {
			console.error('Failed to remove timeslot:', error);
			toast.error('Failed to remove timeslot.');
		}
	};

	const toggleDateSection = date => {
		setOpenDates(prev => ({ ...prev, [date]: !prev[date] }));
	};

	if (!doctorData) {
		return (
			<p className="text-center text-gray-500 mt-3">Loading doctor data...</p>
		);
	}

	const groupedSlots = groupSlotsByDate(doctorData.timeslots);

	return (
		<>
		<ToastContainer position="bottom-right" autoClose={3000} />
		<motion.div className="mx-auto py-8">
			{/* Form Card */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-white rounded-2xl shadow-md p-6 mb-6"
			>
				<h2 className="text-2xl font-bold mb-6 text-gray-700">
					Timeslot Management
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
					<div>
						<label className="block font-medium mb-1 text-gray-700">
							Select Date
						</label>
						<ReactDatePicker
							selected={selectedDate}
							onChange={setSelectedDate}
							dateFormat="dd/MM/yyyy"
							minDate={new Date()}
							placeholderText="Choose a date"
							className="border border-gray-300 rounded-lg px-3 py-2 w-full"
						/>
					</div>
					<div>
						<label className="block font-medium mb-1 text-gray-700">
							Select Time
						</label>
						<ReactDatePicker
							selected={selectedTime}
							onChange={setSelectedTime}
							showTimeSelect
							showTimeSelectOnly
							timeIntervals={30}
							timeCaption="Time"
							dateFormat="h:mm aa"
							placeholderText="Choose a time"
							className="border border-gray-300 rounded-lg px-3 py-2 w-full"
						/>
					</div>
					<div>
						<label className="block font-medium mb-1 text-gray-700">
							Repeat for (weeks)
						</label>
						<input
							type="number"
							min={1}
							max={52}
							value={repeatWeeks}
							onChange={e => setRepeatWeeks(Number(e.target.value))}
							className="border border-gray-300 rounded-lg px-3 py-2 w-full"
							placeholder="e.g., 4"
						/>
					</div>
				</div>

				<motion.button
					onClick={handleAddTimeslot}
					disabled={
						!selectedDate || !selectedTime || repeatWeeks < 1 || !doctorData
					}
					className={`w-full mt-4 ${
						!selectedDate || !selectedTime || repeatWeeks < 1 || !doctorData
							? 'bg-orange-400 cursor-not-allowed'
							: 'bg-orange-600 hover:from-orange-500 to-orange-600'
					} text-white font-semibold py-2 px-4 rounded-lg duration-200 bg-gradient-to-r from-orange-400 to-orange-500 transition-all`}
				>
					Add Timeslot
				</motion.button>
			</motion.div>

			{/* Collapsible Sections For Grouped Slots For A Particular Date */}
			{Object.entries(groupedSlots).length > 0 ? (
				<motion.div className="space-y-4">
					{Object.entries(groupedSlots).sort((a, b) => new Date(a[1][0]) - new Date(b[1][0])).map(([date, slots]) => (
						<motion.div key={date} className="border rounded-lg shadow">
							<motion.button
								onClick={() => toggleDateSection(date)}
								className="w-full text-left text-gray-700 font-semibold text-lg py-2 px-4 rounded-t-lg bg-white hover:from-orange-300 hover:via-orange-400 hover:to-orange-500 transition-all"
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
										className="overflow-hidden bg-white rounded-b-lg"
									>
										<motion.div className="p-3 space-y-2">
											{slots.map((slot, idx) => (
												<motion.div
													key={idx}
													className="bg-gradient-to-r from-orange-200 to-orange-300 px-4 py-2 rounded flex justify-between items-center"
												>
													<motion.span className="text-gray-800">
														{new Date(slot).toLocaleTimeString(undefined, {
															hour: 'numeric',
															minute: 'numeric',
															hour12: true,
														})}
													</motion.span>
													<motion.button
														onClick={() => handleRemoveTimeslot(slot)}
														className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
													>
														Remove
													</motion.button>
												</motion.div>
											))}
										</motion.div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					))}
				</motion.div>
			) : (
				<p className="text-gray-500 text-center">No timeslots available yet.</p>
			)}
		</motion.div>
		</>
	);
};

export default DoctorTimeslotManagement;
