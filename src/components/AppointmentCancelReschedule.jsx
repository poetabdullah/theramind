import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig.js";
import {
  doc,
  getDocs,
  query,
  where,
  collection,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { sendCancelEmail, sendRescheduleEmail } from "../utils/sendEmail.js";

const AppointmentCancelReschedule = ({ userEmail, userRole }) => {
  const [appointments, setAppointments] = useState([]);
  const [newTimes, setNewTimes] = useState({});

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where(userRole === "doctor" ? "doctorEmail" : "patientEmail", "==", userEmail)
        );
        const snapshot = await getDocs(q);
        const futureAppointments = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((app) => new Date(app.timeslot) > new Date());
        setAppointments(futureAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [userEmail, userRole]);

  const cancelAppointment = async (appointmentId, doctorEmail, timeslot, appData) => {
    try {
      await deleteDoc(doc(db, "appointments", appointmentId));

      const doctorRef = doc(db, "doctors", doctorEmail);
      await updateDoc(doctorRef, {
        timeslots: arrayUnion(timeslot),
      });

      // Send email notification
      await sendCancelEmail({
        patient_name: appData.patientName,
        doctor_name: appData.doctorName,
        doctor_email: appData.doctorEmail,
        patient_email: appData.patientEmail,
        time: timeslot,
        cancelled_by: userRole,
      });

      alert("Appointment cancelled successfully.");
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Something went wrong while canceling. Please try again.");
    }
  };

  const handleReschedule = async (appointmentId, doctorEmail, oldTimeslot, appData) => {
    const newTimeslot = newTimes[appointmentId];
    if (!newTimeslot) return alert("Please select a new time.");

    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, { timeslot: newTimeslot });

      const doctorRef = doc(db, "doctors", doctorEmail);
      await updateDoc(doctorRef, {
        timeslots: arrayRemove(oldTimeslot),
      });
      await updateDoc(doctorRef, {
        timeslots: arrayUnion(newTimeslot),
      });

      // Send email notification
      await sendRescheduleEmail({
        patient_name: appData.patientName,
        doctor_name: appData.doctorName,
        doctor_email: appData.doctorEmail,
        patient_email: appData.patientEmail,
        old_time: oldTimeslot,
        new_time: newTimeslot,
        meet_link: appData.meetLink,
        rescheduled_by: userRole,
      });

      alert("Appointment rescheduled successfully!");
    } catch (error) {
      console.error("Rescheduling failed:", error);
      alert("Something went wrong while rescheduling. Please try again.");
    }
  };

  return (
    <motion.div className="p-4">
      <motion.h2 className="text-xl font-bold mb-4">Your Appointments</motion.h2>
      <motion.ul className="space-y-6">
        {appointments.map((app) => (
          <motion.li key={app.id} className="border p-4 rounded shadow">
            <p><b>Doctor:</b> {app.doctorName}</p>
            <p><b>Patient:</b> {app.patientName}</p>
            <p><b>Time:</b> {app.timeslot}</p>
            <p>
              <b>Meet Link:</b>{" "}
              <a href={app.meetLink} className="text-blue-500 underline">{app.meetLink}</a>
            </p>

            <input
              type="datetime-local"
              className="mt-2 p-1 border rounded"
              value={newTimes[app.id] || ""}
              onChange={(e) =>
                setNewTimes((prev) => ({
                  ...prev,
                  [app.id]: e.target.value,
                }))
              }
            />

            <div className="flex gap-2 mt-2">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={() =>
                  handleReschedule(app.id, app.doctorEmail, app.timeslot, app)
                }
              >
                Reschedule
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() =>
                  cancelAppointment(app.id, app.doctorEmail, app.timeslot, app)
                }
              >
                Cancel
              </button>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
};

export default AppointmentCancelReschedule;
