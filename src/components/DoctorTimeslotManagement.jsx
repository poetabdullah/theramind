import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';

const DoctorTimeslotManagement = ({ doctorEmail }) => {
	const [doctorData, setDoctorData] = useState(null);
	const [newTimeslot, setNewTimeslot] = useState('');

	useEffect(() => {
		//Fetching Doctor's Information From Firestore Database
		db.collection('doctors')
			.where('email', '==', doctorEmail)
			.get()
			.then(snapshot => {
				if (!snapshot.empty) {
					const doc = snapshot.docs[0];
					setDoctorData({ email: doc.email, ...doc.data() });
				}
				//Create New Doctor Record If Not Present
				else {
					const newDoc = {
						id: uuidv4(),
						email: doctorEmail,
						name: 'Doctor',
						timeslots: [],
					};
					db.collection('doctors').doc(newDoc.email).set(newDoc);
					setDoctorData(newDoc);
				}
			});
	}, [doctorEmail]);

	const addTimeslot = async () => {
		if (!newTimeslot) return;
		const updatedTimeslots = [...doctorData.timeslots, newTimeslot];

		await db.collection('doctors').doc(doctorData.email).update({
			timeslots: updatedTimeslots,
		});

		setDoctorData(prev => ({ ...prev, timeslots: updatedTimeslots }));
		setNewTimeslot('');
	};

	const removeTimeslot = async slot => {
		const updatedTimeslots = doctorData.timeslots.filter(ts => ts !== slot);

		await db.collection('doctors').doc(doctorData.email).update({
			timeslots: updatedTimeslots,
		});

		setDoctorData(prev => ({ ...prev, timeslots: updatedTimeslots }));
	};

	return (
		<motion.div>
			<motion.h2>Manage Timeslots for {doctorData?.name}</motion.h2>
			<motion.input
				type="datetime-local"
				value={newTimeslot}
				onChange={e => setNewTimeslot(e.target.value)}
				placeholder="Add new timeslot"
			/>
			<motion.button onClick={addTimeslot}>Add Timeslot</motion.button>
			<motion.ul>
				{doctorData?.timeslots.map((slot, index) => (
					<motion.li key={index}>
						{slot}{' '}
						<motion.button onClick={() => removeTimeslot(slot)}>
							Remove
						</motion.button>
					</motion.li>
				))}
			</motion.ul>
		</motion.div>
	);
};

export default DoctorTimeslotManagement;
