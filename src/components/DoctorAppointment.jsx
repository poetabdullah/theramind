import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig.js";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendCancelEmail } from "../utils/sendEmail";
import { arrayUnion } from "firebase/firestore";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { refreshAccessToken, deleteEventWithToken } from "../utils/google_api";
import { sendRescheduleEmail } from "../utils/sendEmail";

const DoctorAppointment = ({ doctorEmail, currentUser, doctors = [] }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [openDates, setOpenDates] = useState({});
  const [reschedulingId, setReschedulingId] = useState(null);
  const [reschedulingTimeslot, setReschedulingTimeslot] = useState("");

  const TOAST_ID = "doctor-appointment-toast";

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        await getDocs(collection(db, "doctors"));
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsRef = collection(db, "appointments");
        const q = query(
          appointmentsRef,
          where("doctorEmail", "==", doctorEmail)
        );
        const snapshot = await getDocs(q);
        const sortedAppointments = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => new Date(a.timeslot) - new Date(b.timeslot));
        setAppointments(sortedAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    if (doctorEmail) {fetchAppointments();}
  }, [doctorEmail]);

  const handleCancelAppointment = async (
    appointmentId,
    doctorEmail,
    timeslot,
    appData
  ) => {
    try {
      const emailToUse = appData.patientEmail;
      if (!emailToUse)
        {throw new Error(
          "Cannot send cancellation email: patient email missing."
        );}
        //Cancel Google Calendar event if it exists via access token
      if (appData.calendarEventId && appData.organizerRefreshToken) {
        const accessToken = await refreshAccessToken(
          appData.organizerRefreshToken
        );
        await deleteEventWithToken(
          appData.patientEmail,
          appData.calendarEventId,
          accessToken
        );
      }

      const doctorDoc = doctors.find((doc) => doc.email === doctorEmail);
      if (!doctorDoc || !doctorDoc.id)
       { throw new Error("Doctor not found or missing ID"); }

      const doctorRef = doc(db, "doctors", doctorDoc.id);
      //Adding the deleted timeslot back to doctor's available timeslots
      await deleteDoc(doc(db, "appointments", appointmentId));
      await updateDoc(doctorRef, {
        timeslots: arrayUnion(timeslot),
      });

      await sendCancelEmail({
        patientName: appData.patientName || "Unknown Patient",
        doctorName: appData.doctorName || "Unknown Doctor",
        patientEmail: emailToUse,
        timeslot: timeslot,
        cancelled_by: currentUser?.email || "Unknown",
      });

      setAppointments((prev) =>
        prev.filter((appt) => appt.id !== appointmentId)
      );
      toast.dismiss(TOAST_ID);
      toast.success("Appointment cancelled successfully.", {
        toastId: TOAST_ID,
      });
    } catch (error) {
      console.error("Cancellation failed:", error);
      toast.dismiss(TOAST_ID);
      toast.error("Something went wrong while canceling. Please try again.", {
        toastId: TOAST_ID,
      });
    }
  };

  const handleRescheduleAppointment = async (appointment, new_time) => {
    const {
      patientName = appointment.patientName || "Patient",
      doctorName = appointment.doctorName || "Doctor",
      patientEmail = appointment.patientEmail,
      doctorEmail = appointment.doctorEmail,
    } = appointment;

    try {
      const newStart = new Date(new_time);
      if (isNaN(newStart.getTime())) {
        toast.warning("Invalid date format. Please use a valid date.", {
          toastId: TOAST_ID,
        });
        return;
      }

      const doctorDoc = doctors.find((doc) => doc.email === doctorEmail);
      if (!doctorDoc || !doctorDoc.id)
       { throw new Error("Doctor not found or missing ID");}

      const doctorRef = doc(db, "doctors", doctorDoc.id);

      if (!doctorDoc.timeslots.includes(new_time)) {
        toast.info("This timeslot is no longer available.", {
          toastId: TOAST_ID,
        });
        return;
      }

      const appointmentRef = doc(db, "appointments", appointment.id);
      await updateDoc(appointmentRef, { timeslot: new_time });

      const updatedTimeslots = Array.from(
        new Set([
          ...doctorDoc.timeslots.filter((slot) => slot !== new_time),
          appointment.timeslot,
        ])
      );
      await updateDoc(doctorRef, { timeslots: updatedTimeslots });

      const emailData = {
        patientName,
        doctorName,
        patientEmail,
        doctorEmail,
        newTime: new_time,
        oldTime: appointment.timeslot,
        meetLink: appointment.meetLink,
        rescheduledBy: currentUser?.email || "Unknown",
      };

      await sendRescheduleEmail({
        ...emailData,
        to_email: appointment.patientEmail,
        to_role: "patient",
      });

      await sendRescheduleEmail({
        ...emailData,
        to_email: appointment.doctorEmail,
        to_role: "doctor",
      });

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointment.id ? { ...appt, timeslot: new_time } : appt
        )
      );

      toast.dismiss(TOAST_ID);
      toast.success("Appointment rescheduled successfully!", {
        toastId: TOAST_ID,
      });
    } catch (error) {
      console.error("Rescheduling failed:", error);
      toast.dismiss(TOAST_ID);
      toast.error(
        "Failed to reschedule appointment: " +
          (error?.message || "Unknown error"),
        {
          toastId: TOAST_ID,
        }
      );
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) {return "—";}
    const date = new Date(isoString);
    return isNaN(date)
      ? "Invalid date"
      : date.toLocaleString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
  };

  const formatDate = (isoString) =>
    new Date(isoString).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const toggleDateSection = (date) => {
    setOpenDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  //To show the appointments for the selected date
  const filteredAppointments = selectedDate
    ? appointments.filter((app) => {
      //Split the timeslot to get the date part
        const appDate = new Date(app.timeslot).toISOString().split("T")[0];
        return appDate === selectedDate;
      })
    : appointments;

    //Reduce appointments into grouped format by date
  const groupedAppointments = filteredAppointments.reduce((acc, app) => {
    //Format the date (readable format) to use as key
    const dateKey = formatDate(app.timeslot);
    if (!acc[dateKey]) {acc[dateKey] = [];}
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
            <motion.label
              htmlFor="dateFilter"
              className="block text-gray-700 font-medium mb-1"
            >
              Filter by Date
            </motion.label>
            <motion.input
              type="date"
              id="dateFilter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </motion.div>

          {Object.keys(groupedAppointments).length === 0 ? (
            <motion.p className="text-center text-gray-500 mt-6">
              No appointments found on this date.
            </motion.p>
          ) : (
            Object.entries(groupedAppointments).map(([date, group]) => (
              <motion.div
                key={date}
                className="border rounded-2xl shadow-lg mb-4 overflow-hidden"
              >
                <motion.button
                  onClick={() => toggleDateSection(date)}
                  className="w-full text-left text-gray-800 font-semibold text-lg py-3 px-5 bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400 transition"
                >
                  {date} {openDates[date] ? "▲" : "▼"}
                </motion.button>

                <AnimatePresence initial={false}>
                  {openDates[date] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white"
                    >
                      <motion.div className="p-4 space-y-4">
                        {group.map((appt) => (
                          <motion.div
                            key={appt.id}
                            className="bg-gray-100 p-4 rounded-xl shadow-sm space-y-1"
                          >
                            <motion.p>
                              <motion.span className="font-semibold">
                                Patient Name:
                              </motion.span>{" "}
                              {appt.patientName}
                            </motion.p>
                            <motion.p>
                              <motion.span className="font-semibold">
                                Patient Email:
                              </motion.span>{" "}
                              {appt.patientEmail}
                            </motion.p>
                            <motion.p>
                              <motion.span className="font-semibold">
                                Date & Time:
                              </motion.span>{" "}
                              {formatDateTime(appt.timeslot)}
                            </motion.p>
                            <motion.p>
                              <motion.span className="font-semibold">
                                Meet Link:
                              </motion.span>{" "}
                              <motion.a
                                href={appt.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 no-underline hover:text-orange-700"
                              >
                                Join the meeting
                              </motion.a>
                            </motion.p>

                            {/* Reschedule + Cancel Buttons */}
                            <motion.div className="flex gap-2 mt-2">
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReschedulingId(appt.id);
                                }}
                                className="rounded-lg text-orange-800 font-semibold px-4 py-2 bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 transition"
                                whileHover={{ scale: 1.05 }}
                              >
                                Reschedule
                              </motion.button>

                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelAppointment(
                                    appt.id,
                                    appt.doctorEmail,
                                    appt.timeslot,
                                    appt
                                  );
                                }}
                                className="rounded-lg text-orange-800 font-semibold px-4 py-2 bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 transition"
                                whileHover={{ scale: 1.05 }}
                              >
                                Cancel
                              </motion.button>
                            </motion.div>

                            {/* Reschedule Dropdown */}
                            {reschedulingId === appt.id && (
                              <motion.div
                                className="flex flex-col gap-2 mt-3"
                                whileFocus={{ scale: 1.02 }}
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 200 }}
                              >
                                <motion.select
                                  value={reschedulingTimeslot}
                                  onChange={(e) =>
                                    setReschedulingTimeslot(e.target.value)
                                  }
                                  className="px-3 py-2 rounded border border-gray-300"
                                >
                                  <motion.option value="">Select new timeslot</motion.option>
                                  {doctors
                                    ?.find(
                                      (doc) => doc.email === appt.doctorEmail
                                    )
                                    ?.timeslots.filter(
                                      (slot) => slot !== appt.timeslot
                                    )
                                    .sort((a, b) => new Date(a) - new Date(b))
                                    .map((slot) => (
                                      <motion.option key={slot} value={slot}>
                                        {new Date(slot).toLocaleString(
                                          "en-US",
                                          {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                          }
                                        )}
                                      </motion.option>
                                    ))}
                                </motion.select>

                                <motion.div className="flex justify-end gap-2">
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRescheduleAppointment(
                                        appt,
                                        reschedulingTimeslot
                                      );
                                    }}
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded hover:from-purple-600 hover:to-indigo-700 transition"
                                  >
                                    Confirm
                                  </motion.button>

                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReschedulingId(null);
                                      setReschedulingTimeslot("");
                                    }}
                                    className="rounded-lg text-orange-800 font-semibold px-4 py-2 bg-gradient-to-r from-orange-300 to-orange-400 hover:from-orange-400 hover:to-orange-500 transition"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    Cancel
                                  </motion.button>
                                </motion.div>
                              </motion.div>
                            )}
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
