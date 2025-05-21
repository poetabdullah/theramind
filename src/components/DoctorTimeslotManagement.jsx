import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import { motion, AnimatePresence } from 'framer-motion';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
		return [...(slots || [])]
			.filter(Boolean)
			.sort((a, b) => new Date(a) - new Date(b))
			.reduce((groups, slot) => {
				const dateKey = formatDate(slot);
				if (!groups[dateKey]) groups[dateKey] = [];
				groups[dateKey].push(slot);
				return groups;
			}, {});
	};

	const handleAddTimeslot = async () => {
		const baseDate = combineDateAndTime(selectedDate, selectedTime);
		if (!baseDate) return alert('Please select both date and time.');

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
			alert(`Added ${repeatedSlots.length} timeslot(s) successfully!`);
		} catch (error) {
			console.error('Failed to add timeslot:', error);
			alert('Failed to add timeslot.');
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
			alert('Failed to remove timeslot.');
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
		<motion.div className="max-w-4xl mx-auto px-4 py-8">
			{/* Form UI */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-white rounded-2xl shadow-md p-6 mb-6"
			>
				<h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
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
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-blue-600 hover:bg-blue-700'
					} text-white font-semibold py-2 px-4 rounded-lg transition duration-200`}
				>
					Add Timeslot
				</motion.button>
			</motion.div>

			{/* Grouped slots with collapsible sections */}
			{Object.entries(groupedSlots).length > 0 ? (
				<div className="space-y-4">
					{Object.entries(groupedSlots).map(([date, slots]) => (
						<div key={date} className="border rounded-lg shadow">
							<button
								onClick={() => toggleDateSection(date)}
								className="w-full text-left text-blue-700 font-semibold text-lg py-2 px-4 bg-blue-100 rounded-t-lg hover:bg-blue-200 transition"
							>
								{date} {openDates[date] ? '▲' : '▼'}
							</button>
							<AnimatePresence initial={false}>
								{openDates[date] && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.3 }}
										className="overflow-hidden bg-white rounded-b-lg"
									>
										<div className="p-3 space-y-2">
											{slots.map((slot, idx) => (
												<div
													key={idx}
													className="bg-gray-100 px-4 py-2 rounded flex justify-between items-center"
												>
													<span className="text-gray-800">
														{new Date(slot).toLocaleTimeString(undefined, {
															hour: 'numeric',
															minute: 'numeric',
															hour12: true,
														})}
													</span>
													<button
														onClick={() => handleRemoveTimeslot(slot)}
														className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
													>
														Remove
													</button>
												</div>
											))}
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					))}
				</div>
			) : (
				<p className="text-gray-500 text-center">No timeslots available yet.</p>
			)}
		</motion.div>
	);
};

export default DoctorTimeslotManagement;
