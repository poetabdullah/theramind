import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebaseConfig.js';
import {
  collection,
  getDocs,
  setDoc,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { createGoogleMeetEvent, initGoogleApi, requestAccessToken, waitForGoogle } from '../utils/google_api';
import { sendAppointmentConfirmationEmail } from './AppointmentConfirmationEmail';
import { deleteGoogleCalendarEvent } from '../utils/google_api';

const AppointmentBooking = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTimeslot, setSelectedTimeslot] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await waitForGoogle();
        await initGoogleApi();
      } catch (err) {
        console.error("Failed to init Google API:", err);
      }
    })();
  }, []);

  useEffect(() => {
    initGoogleApi().catch(console.error);
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsSignedIn(true);
        setPatientEmail(user.email);

        // Fetch patient name from Firestore
        const q = query(collection(db, 'patients'), where('email', '==', user.email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setPatientName(snapshot.docs[0].data().name);
        } else {
          setPatientName(user.displayName || '');
        }
      } else {
        setIsSignedIn(false);
        setPatientName('');
        setPatientEmail('');
        setCurrentUser(null);
      }
    });

    initGoogleApi().catch(console.error);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'doctors'));
        const doctorList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorList);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!patientEmail) return;
    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const q = query(
          collection(db, 'appointments'),
          where('patientEmail', '==', patientEmail)
        );
        const snapshot = await getDocs(q);
        const appts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAppointments(appts);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      }
      setLoadingAppointments(false);
    };
    fetchAppointments();
  }, [patientEmail]);

  const handleBooking = async () => {
    setError('');
    if (!selectedDoctor || !selectedTimeslot || !patientName || !patientEmail) {
      setError('Please fill all fields before booking.');
      return;
    }
    if (!isSignedIn || !currentUser) {
      setError('Please sign in first.');
      return;
    }

    try {
      const doctorRef = doc(db, 'doctors', selectedDoctor.id);
      const updatedDoctorSnap = await getDoc(doctorRef);
      const updatedDoctor = updatedDoctorSnap.data();

      if (!updatedDoctor?.timeslots?.includes(selectedTimeslot)) {
        alert('This timeslot is no longer available.');
        return;
      }

      // Check for duplicate appointment at this timeslot for this patient
      const q = query(
        collection(db, 'appointments'),
        where('patientEmail', '==', patientEmail),
        where('timeslot', '==', selectedTimeslot)
      );
      const existingSnapshot = await getDocs(q);
      if (!existingSnapshot.empty) {
        alert('You already have an appointment at this time.');
        return;
      }

      const start = new Date(selectedTimeslot);
      const end = new Date(start.getTime() + 30 * 60000);

      const access_token = await requestAccessToken('consent');
      if (!access_token) {
        throw new Error('Failed to get access token for Google Calendar');
      }

      const calendarEvent = await createGoogleMeetEvent(
        `Appointment with ${selectedDoctor.fullName}`,
        'TheraMind Appointment',
        start.toISOString(),
        end.toISOString(),
        patientEmail,
        currentUser,
        access_token
      );

      const meetLink =
        calendarEvent.hangoutLink ||
        calendarEvent.conferenceData?.entryPoints?.find((p) => p.entryPointType === 'video')
          ?.uri;

      const appointmentId = crypto.randomUUID();
      const appointmentRef = doc(collection(db, 'appointments'), appointmentId);

      const newAppointment = {
        appointmentId,
        doctorEmail: selectedDoctor.email,
        doctorName: selectedDoctor.fullName,
        patientName,
        patientEmail,
        timeslot: selectedTimeslot,
        meetLink,
        calendarEventId: calendarEvent.id,
        createdAt: new Date().toISOString(),
      };

      await setDoc(appointmentRef, newAppointment);

      // Remove booked timeslot from doctor
      const updatedTimeslots = updatedDoctor.timeslots.filter((t) => t !== selectedTimeslot);
      await updateDoc(doctorRef, { timeslots: updatedTimeslots });

      sendAppointmentConfirmationEmail({
        patientName,
        patientEmail,
        doctorName: selectedDoctor.fullName,
        timeslot: selectedTimeslot,
        meetLink,
      });

      setAppointments((prev) => [...prev, { id: appointmentId, ...newAppointment }]);

      alert('Appointment Booked Successfully!');
      setSelectedDoctor(null);
      setSelectedTimeslot('');
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Booking failed: ' + (err?.message || JSON.stringify(err)));
    }
  };

  const handleCancelAppointment = async (appointment) => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?');
    if (!confirmCancel) return;

    try {
      // Delete Google Calendar event
      await deleteGoogleCalendarEvent(appointment.calendarEventId);

      // Delete Firestore appointment doc
      await deleteDoc(doc(db, 'appointments', appointment.id));

      // Fetch the doctor using doctorEmail from the appointment
      const doctorQuery = query(collection(db, 'doctors'), where('email', '==', appointment.doctorEmail));
      const doctorSnapshot = await getDocs(doctorQuery);

      if (!doctorSnapshot.empty) {
        const doctorDoc = doctorSnapshot.docs[0];
        const doctorRef = doc(db, 'doctors', doctorDoc.id);
        const doctorData = doctorDoc.data();
        const updatedTimeslots = [...(doctorData.timeslots || []), appointment.timeslot];

        // Remove duplicates & sort timeslots chronologically
        const uniqueSortedTimeslots = Array.from(new Set(updatedTimeslots)).sort(
          (a, b) => new Date(a) - new Date(b)
        );

        await updateDoc(doctorRef, { timeslots: uniqueSortedTimeslots });
      }

      // Update UI
      setAppointments((prev) => prev.filter((appt) => appt.id !== appointment.id));

      alert('Appointment cancelled successfully.');
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment.');
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
        <motion.h1 className="text-2xl font-bold mb-4">Book an Appointment</motion.h1>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <motion.select
          className="border p-2 w-full mb-2"
          value={selectedDoctor?.email || ''}
          onChange={(e) => {
            const selected = doctors.find((d) => d.email === e.target.value);
            setSelectedDoctor(selected || null);
            setSelectedTimeslot('');
          }}
        >
          <motion.option value="">Select a Doctor</motion.option>
          {doctors.map((doc) => (
            <motion.option key={doc.id} value={doc.email}>
              {doc.fullName}
            </motion.option>
          ))}
        </motion.select>

        {selectedDoctor && selectedDoctor.timeslots?.length > 0 && (
          <motion.select
            className="border p-2 w-full mb-2"
            value={selectedTimeslot}
            title="Select a Timeslot"
            onChange={(e) => setSelectedTimeslot(e.target.value)}
          >
            <motion.option value="">Select a Timeslot</motion.option>
            {selectedDoctor.timeslots
              .filter((slot) => new Date(slot) > new Date())
              .sort((a, b) => new Date(a) - new Date(b))
              .map((slot) => (
                <motion.option key={slot} value={slot}>
                  {new Date(slot).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </motion.option>
              ))}
          </motion.select>
        )}

        <motion.input
          type="text"
          className="border p-2 w-full mb-2"
          placeholder="Enter your name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />

        <motion.button
          onClick={handleBooking}
          className={`p-2 rounded w-full text-white ${
            selectedDoctor && selectedTimeslot && patientName && patientEmail && isSignedIn
              ? 'bg-purple-500 hover:bg-purple-600'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={
            !selectedDoctor || !selectedTimeslot || !patientName || !patientEmail || !isSignedIn
          }
        >
          Book Appointment
        </motion.button>

        {loadingAppointments && <motion.p>Loading your appointments...</motion.p>}

        {appointments.length > 0 && (
  <motion.div 
    className="mt-6"
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } },
    }}
  >
    <motion.h2
      className="text-2xl font-semibold mb-4 border-b pb-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
    >
      Your Appointments
    </motion.h2>

    <motion.ul className="space-y-4">
      {appointments.map((appt) => (
        <motion.li
          key={appt.id}
          className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg hover:bg-purple-50 transition-shadow duration-300"
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => window.open(appt.meetLink, '_blank')}
          title="Click to join meeting"
        >
          <motion.div className="flex justify-between items-center mb-2">
            <motion.p className="font-semibold text-lg text-purple-700">{appt.doctorName}</motion.p>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleCancelAppointment(appt);
              }}
              className="text-left rounded-lg text-orange-800 font-semibold text-lg py-2 px-4 bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 transition"
			  whileHover={{ scale: 1.05 }}
            >
              Cancel
            </motion.button>
          </motion.div>

          <motion.p className="text-gray-700">
            <motion.strong>Time: </motion.strong>
            {new Date(appt.timeslot).toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </motion.p>

          <motion.p className="mt-1 text-purple-600 underline cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <motion.a href={appt.meetLink} target="_blank" rel="noopener noreferrer">
              Join Meeting
            </motion.a>
          </motion.p>
        </motion.li>
      ))}
    </motion.ul>
  </motion.div>
)}
      </motion.div>
    </motion.div>
  );
};

export default AppointmentBooking;
