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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppointmentCancelReschedule = ({ userEmail, userRole }) => {
  //Fetching Appointments from Firestore
  const [appointments, setAppointments] = useState([]);
  const [newTimes, setNewTimes] = useState({});

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          //Ternary operator to filter appointments based on user role; doctor or patient
          where(userRole === "doctor" ? "doctorEmail" : "patientEmail", "==", userEmail)
        );
        const snapshot = await getDocs(q);
        //Only Showing Future Appointments
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
      //Adding the deleted timeslot back to doctor's available timeslots
      await updateDoc(doctorRef, {
        timeslots: arrayUnion(timeslot),
      });

      //To send email notification
      await sendCancelEmail({
        patientName: appData.patientName,
        doctorName: appData.doctorName,
        patientEmail: appData.patientEmail,
        timeslot,
      });

      toast.success("Appointment cancelled successfully.");
    } catch (error) {
      console.error("Cancellation failed:", error);
      toast.error("Something went wrong while canceling. Please try again.");
    }
  };

  const handleReschedule = async (appointmentId, doctorEmail, oldTimeslot, appData) => {
    const newTimeslot = newTimes[appointmentId];
    if (!newTimeslot) { return toast.warning("Please select a new time."); }

    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, { timeslot: newTimeslot });
      //Removing the old timeslot & adding the new timeslot to doctor's available timeslots
      const doctorRef = doc(db, "doctors", doctorEmail);
      await updateDoc(doctorRef, {
        timeslots: arrayRemove(oldTimeslot),
      });
      await updateDoc(doctorRef, {
        timeslots: arrayUnion(newTimeslot),
      });

      // Send email notification
     await sendRescheduleEmail({
      to_email: userRole === "doctor" ? appData.patientEmail : appData.doctorEmail,
      to_role: userRole === "doctor" ? "patient" : "doctor",
      patientName: appData.patientName,
      doctorName: appData.doctorName,
      doctorEmail: appData.doctorEmail,
      patientEmail: appData.patientEmail,
      oldTime: oldTimeslot,
      newTime: newTimeslot,
      meetLink: appData.meetLink,
      rescheduledBy: userRole,
    });

      toast.success("Appointment rescheduled successfully!");
    } catch (error) {
      console.error("Rescheduling failed:", error);
      toast.error("Something went wrong while rescheduling. Please try again.");
    }
  };

  return (
    <>
    <ToastContainer position="bottom-right" autoClose={3000} />
    <motion.div className="p-4">
      <motion.h2 className="text-xl font-bold mb-4">Your Appointments</motion.h2>
      <motion.ul className="space-y-6">
        {appointments.map((app) => (
          <motion.li key={app.id} className="border p-4 rounded shadow">
            <motion.p><motion.b>Doctor:</motion.b> {app.doctorName}</motion.p>
            <motion.p><motion.b>Patient:</motion.b> {app.patientName}</motion.p>
            <motion.p><motion.b>Time:</motion.b> {app.timeslot}</motion.p>
            <motion.p>
              <motion.b>Meet Link:</motion.b>{" "}
              <motion.a href={app.meetLink} className="text-blue-500 underline">{app.meetLink}</motion.a>
            </motion.p>

            <motion.input
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
      </>
  );
};

export default AppointmentCancelReschedule;
