import { Stethoscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function PatientBookAppointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      const user = auth.currentUser;
      if (!user || !user.email) {
        console.error('User not signed in');
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'appointments'),
          where('patientEmail', '==', user.email)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [auth]);

  if (loading) { return <motion.div className="p-6 text-center">Loading your appointments...</motion.div>; }

  return (
    <motion.div className="mx-auto max-w-10xl px-1 py-1 space-y-8">
      {/* Booking Banner */}
      <motion.div>
        <motion.div className="p-[2px] bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-600 rounded-xl">
          <motion.div className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Icon + Text */}
            <motion.div className="flex items-start space-x-4">
              <motion.div className="p-3 bg-gradient-to-tr from-purple-400 to-indigo-500 rounded-full">
                <Stethoscope size={24} className="text-white" />
              </motion.div>
              <motion.div>
                <motion.h3 className="text-2xl font-semibold bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
                    Book Appointment</motion.h3>
                <motion.p className="mt-1 text-gray-600">
                  Book an appointment with our professionals for personalized care and support.
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Button */}
            <motion.button
              onClick={() => navigate("/appointment-booking")}
              className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white font-semibold px-5 py-3 rounded-lg shadow hover:from-purple-500 hover:to-indigo-600 transition duration-200 w-full sm:w-auto"
            >
              Book Appointment
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Appointments Section */}
      <motion.div>
        <motion.div className="bg-white rounded-xl shadow p-6 border border-indigo-500">
          <motion.h2 
          className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
            My Appointment</motion.h2>

          {appointments.length === 0 ? (
            <motion.p className="text-gray-600">No appointments found.</motion.p>
          ) : (
            <motion.ul className="space-y-4">
              {appointments.map((appt) => (
                <motion.li key={appt.id} className="border p-4 rounded-lg shadow-sm bg-purple-100 border-purple-500">
                  <motion.p><motion.strong>Doctor:</motion.strong> {appt.doctorName}</motion.p>
                  <motion.p><motion.strong>Date & Time:</motion.strong> {new Date(appt.timeslot).toLocaleString()}</motion.p>
                  <motion.p>
                    <motion.strong>Meet Link:</motion.strong>{" "}
                    <motion.a
                      href={appt.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {appt.meetLink}
                    </motion.a>
                  </motion.p>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </motion.div>
      </motion.div>

    </motion.div>
  );
}