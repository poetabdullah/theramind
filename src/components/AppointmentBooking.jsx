import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "../firebaseConfig.js";
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
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  createGoogleMeetEvent,
  initGoogleApi,
  requestAccessToken,
  waitForGoogle,
} from "../utils/google_api";
import { sendAppointmentConfirmationEmail } from "./AppointmentConfirmationEmail";
import {
  deleteGoogleCalendarEvent,
  refreshAccessToken,
  deleteEventWithToken,
} from "../utils/google_api";
import { arrayUnion } from "firebase/firestore";
import { sendCancelEmail } from "../utils/sendEmail";
import { sendRescheduleEmail } from "../utils/sendEmail";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUserMd,
  FaChevronDown,
  FaChevronUp,
  FaStethoscope,
} from "react-icons/fa";

export async function cancelAppointmentAsDoctor(
  appointmentId,
  currentDoctorEmail
) {
  const appointmentRef = doc(db, "appointments", appointmentId);
  const snapshot = await getDoc(appointmentRef);

  if (!snapshot.exists()) throw new Error("Appointment not found");

  const data = snapshot.data();

  if (data.doctorEmail !== currentDoctorEmail) {
    throw new Error("You do not have permission to delete this appointment.");
  }

  const { organizerRefreshToken, calendarEventId, organizerEmail } = data;

  const newAccessToken = await refreshAccessToken(organizerRefreshToken);

  await deleteEventWithToken(organizerEmail, calendarEventId, newAccessToken);

  await deleteDoc(appointmentRef);

  return { success: true };
}

const AppointmentBooking = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTimeslot, setSelectedTimeslot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [reschedulingTimeslot, setReschedulingTimeslot] = useState("");
  const [showDetails, setShowDetails] = useState(false);

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
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsSignedIn(true);
        setPatientEmail(user.email);

        // Fetch patient name from Firestore
        const q = query(
          collection(db, "patients"),
          where("email", "==", user.email)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          setPatientName(snapshot.docs[0].data().name);
        } else {
          setPatientName(user.displayName || "");
        }
      } else {
        setIsSignedIn(false);
        setPatientName("");
        setPatientEmail("");
        setCurrentUser(null);
      }
    });

    initGoogleApi().catch(console.error);

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "doctors"));
        const doctorList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorList);
      } catch (err) {
        console.error("Error fetching doctors:", err);
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
          collection(db, "appointments"),
          where("patientEmail", "==", patientEmail)
        );
        const snapshot = await getDocs(q);
        const appts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAppointments(appts);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      }
      setLoadingAppointments(false);
    };
    fetchAppointments();
  }, [patientEmail]);

  const handleBooking = async () => {
    setError("");
    if (!selectedDoctor || !selectedTimeslot || !patientName || !patientEmail) {
      setError("Please fill all fields before booking.");
      return;
    }
    if (!isSignedIn || !currentUser) {
      setError("Please sign in first.");
      return;
    }

    try {
      const doctorRef = doc(db, "doctors", selectedDoctor.id);
      const updatedDoctorSnap = await getDoc(doctorRef);
      const updatedDoctor = updatedDoctorSnap.data();

      if (!updatedDoctor?.timeslots?.includes(selectedTimeslot)) {
        toast.warning("This timeslot is no longer available.");
        return;
      }

      const activeAppointment = query(
        collection(db, "appointments"),
        where("patientEmail", "==", patientEmail)
      );

      const existingAppointments = await getDocs(activeAppointment);
      if (!existingAppointments.empty) {
        toast.info(
          "You already have an appointment with a doctor. Cancel it before booking a new one."
        );
        return;
      }

      const q = query(
        collection(db, "appointments"),
        where("patientEmail", "==", patientEmail),
        where("timeslot", "==", selectedTimeslot)
      );
      const existingSnapshot = await getDocs(q);
      if (!existingSnapshot.empty) {
        toast.warning("You already have an appointment at this time.");
        return;
      }

      const start = new Date(selectedTimeslot);
      const end = new Date(start.getTime() + 30 * 60000);

      // ✅ Reuse access token from login
      const access_token = localStorage.getItem("google_calendar_access_token");
      if (!access_token) {
        toast.error(
          "Google Calendar access token not found. Please login again."
        );
        return;
      }

      const calendarEvent = await createGoogleMeetEvent(
        `Appointment with ${selectedDoctor.fullName}`,
        "TheraMind Appointment",
        start.toISOString(),
        end.toISOString(),
        patientEmail,
        selectedDoctor.email,
        access_token // ✅ pass the token directly
      );

      const meetLink =
        calendarEvent.hangoutLink ||
        calendarEvent.conferenceData?.entryPoints?.find(
          (p) => p.entryPointType === "video"
        )?.uri;

      const appointmentId = crypto.randomUUID();
      const appointmentRef = doc(collection(db, "appointments"), appointmentId);

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

      const updatedTimeslots = updatedDoctor.timeslots.filter(
        (t) => t !== selectedTimeslot
      );
      await updateDoc(doctorRef, { timeslots: updatedTimeslots });

      sendAppointmentConfirmationEmail({
        patientName,
        patientEmail,
        doctorName: selectedDoctor.fullName,
        timeslot: selectedTimeslot,
        meetLink,
      });

      setAppointments((prev) => [
        ...prev,
        { id: appointmentId, ...newAppointment },
      ]);

      toast.success("Appointment Booked Successfully!");
      setSelectedDoctor(null);
      setSelectedTimeslot("");
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error("Booking failed: " + (err?.message || JSON.stringify(err)));
    }
  };

  const handleCancelAppointment = async (
    appointmentId,
    doctorEmail,
    timeslot,
    appData
  ) => {
    try {
      const emailToUse = appData.patientEmail || patientEmail;
      console.log("Patient email: ", emailToUse);

      if (!emailToUse) {
        console.error("Missing patient email during cancellation.");
        throw new Error(
          "Cannot send cancellation email: patient email missing."
        );
      }

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
      if (!doctorDoc) throw new Error("Doctor not found in state");

      const doctorRef = doc(db, "doctors", doctorDoc.id);

      // Delete the appointment from Firestore
      await deleteDoc(doc(db, "appointments", appointmentId));

      // Restore the cancelled timeslot
      await updateDoc(doctorRef, {
        timeslots: arrayUnion(timeslot),
      });

      sendCancelEmail({
        patientName: appData.patientName || patientName,
        doctorName: appData.doctorName,
        patientEmail: emailToUse,
        timeslot: timeslot,
        cancelled_by: currentUser?.email || "Unknown",
      });

      console.log("Sending cancel email to:", emailToUse);
      // Remove from UI
      setAppointments((prev) =>
        prev.filter((appt) => appt.id !== appointmentId)
      );

      toast.success("Appointment cancelled successfully.");
    } catch (error) {
      console.error("Cancellation failed:", error);
      toast.info("Something went wrong while canceling. Please try again.");
      console.log("Patient email: ", patientEmail);
    }
  };

  const handleRescheduleAppointment = async (
    appointment,
    new_time,
    patientEmail,
    doctorEmail,
    appData
  ) => {
    console.log("Rescheduling to", new_time);

    const {
      patientName = appointment.patientName || "Patient",
      doctorName = appointment.doctorName || "Doctor",
      patientEmail: appPatientEmail = appointment.patientEmail,
      doctorEmail: appDoctorEmail = appointment.doctorEmail,
    } = appData || {};

    try {
      const newStart = new Date(new_time);
      const newEnd = new Date(newStart.getTime() + 30 * 60000);

      if (isNaN(newStart.getTime())) {
        toast.warning("Invalid date format. Please use a valid date.");
        return;
      }

      const doctorDoc = doctors.find(
        (doc) => doc.email === appointment.doctorEmail
      );
      if (!doctorDoc) throw new Error("Doctor not found.");
      const doctorRef = doc(db, "doctors", doctorDoc.id);

      if (!doctorDoc.timeslots.includes(new_time)) {
        toast.info("This timeslot is no longer available.");
        return;
      }

      let newAccessToken;
      try {
        newAccessToken = await requestAccessToken("");
      } catch {
        newAccessToken = await requestAccessToken("consent");
      }

      const calendarEventUpdate = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${appointment.patientEmail}/events/${appointment.calendarEventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${newAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start: { dateTime: newStart.toISOString() },
            end: { dateTime: newEnd.toISOString() },
          }),
        }
      );

      if (!calendarEventUpdate.ok)
        throw new Error("Failed to update Google Calendar event.");

      const appointmentRef = doc(db, "appointments", appointment.id);
      await updateDoc(appointmentRef, { timeslot: new_time });

      const existingTimeslots = Array.isArray(doctorDoc.timeslots)
        ? doctorDoc.timeslots
        : [];

      const updatedTimeslots = Array.from(
        new Set([
          //Rescheduled Timeslot Removed Because It Is Booked Now
          ...doctorDoc.timeslots.filter((slot) => slot !== new_time),
          //Adding Back The Old Timeslot
          appointment.timeslot,
        ])
      );

      console.log("existingTimeslots:", existingTimeslots);
      console.log("updatedTimeslots:", updatedTimeslots);

      await updateDoc(doctorRef, { timeslots: updatedTimeslots });

      console.log("📤 Sending reschedule email with:", {
        patientName,
        doctorName,
        patientEmail: appPatientEmail,
        doctorEmail: appDoctorEmail,
      });

      await sendRescheduleEmail({
        patientName,
        doctorName,
        patientEmail: appPatientEmail,
        doctorEmail: appDoctorEmail,
        newTime: new_time,
        meetLink: appointment.meetLink,
        rescheduledBy: currentUser?.email || "Unknown",
      });

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointment.id ? { ...appt, timeslot: new_time } : appt
        )
      );

      toast.success("Appointment rescheduled successfully!");
    } catch (error) {
      console.error("Rescheduling failed:", error);
      toast.error(
        "Failed to reschedule appointment: " +
          (error?.message || JSON.stringify(error))
      );
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="container mx-auto p-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1
            className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-700 to-indigo-800 text-transparent bg-clip-text"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Book an Appointment
          </motion.h1>

          {error && <motion.p className="text-red-500 mb-2">{error}</motion.p>}

          <motion.select
            className="border rounded p-2 w-full mb-2 shadow-sm"
            value={selectedDoctor?.email || ""}
            onChange={(e) => {
              const selected = doctors.find((d) => d.email === e.target.value);
              setSelectedDoctor(selected || null);
              setSelectedTimeslot("");
            }}
            whileFocus={{ scale: 1.02 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <motion.option value="">Select a Doctor</motion.option>
            {doctors.map((doc) => (
              <motion.option key={doc.id} value={doc.email}>
                {doc.fullName}
              </motion.option>
            ))}
          </motion.select>
          {/* Showing Doctor's Details */}
          {selectedDoctor && (
            <motion.div
              className="border rounded-2xl p-4 shadow-md bg-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.h2 className="text-2xl font-semibold text-purple-700 flex items-center justify-between">
                <motion.span className="flex items-center gap-2">
                  <FaUserMd /> {selectedDoctor.fullName}
                </motion.span>
                <motion.button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-purple-700"
                >
                  {showDetails ? <FaChevronUp /> : <FaChevronDown />}
                </motion.button>
              </motion.h2>

              <motion.p className="text-gray-700 flex items-center gap-2 mt-2">
                <FaStethoscope />{" "}
                <motion.strong className="font-medium">
                  Specialty:
                </motion.strong>{" "}
                {selectedDoctor.specialties?.join(", ") || "N/A"}
              </motion.p>

              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-3 space-y-3"
                >
                  {selectedDoctor.experiences?.length > 0 && (
                    <motion.div>
                      <motion.h3 className="text-purple-600 font-semibold mb-1">
                        Experience
                      </motion.h3>
                      <motion.ul className="text-sm list-disc ml-5">
                        {selectedDoctor.experiences.map((exp, idx) => (
                          <motion.li key={idx}>
                            <motion.strong>{exp.role}</motion.strong> at{" "}
                            {exp.org} ({exp.start} - {exp.end})
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}

                  {selectedDoctor.education?.length > 0 && (
                    <motion.div>
                      <motion.h3 className="text-purple-600 font-semibold mb-1">
                        Education
                      </motion.h3>
                      <motion.ul className="text-sm list-disc ml-5">
                        {selectedDoctor.education.map((edu, idx) => (
                          <motion.li key={idx}>
                            {edu.degree}, {edu.institute} ({edu.gradDate})
                          </motion.li>
                        ))}
                      </motion.ul>
                    </motion.div>
                  )}

                  {selectedDoctor.bio && (
                    <motion.p className="text-gray-600 italic border-l-4 border-purple-400 pl-2">
                      "{selectedDoctor.bio}"
                    </motion.p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {selectedDoctor && selectedDoctor.timeslots?.length > 0 && (
            <motion.select
              className="border rounded shadow-sm p-2 w-full mb-2"
              value={selectedTimeslot}
              title="Select a Timeslot"
              onChange={(e) => setSelectedTimeslot(e.target.value)}
              whileFocus={{ scale: 1.02 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <option value="">Select a Timeslot</option>
              {/* Filtering out past timeslots and sorting them */}
              {[...selectedDoctor.timeslots]
                .filter((slot) => new Date(slot) > new Date())
                .sort((a, b) => new Date(a) - new Date(b))
                .map((slot) => (
                  <option key={slot} value={slot}>
                    {new Date(slot).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </option>
                ))}
            </motion.select>
          )}

          <motion.input
            type="text"
            className="border rounded shadow-sm p-2 w-full mb-2"
            placeholder="Enter your name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            whileFocus={{ scale: 1.02 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
          />

          <motion.button
            onClick={handleBooking}
            className={`p-2 rounded w-full text-white text-semibold text-xl ${
              selectedDoctor &&
              selectedTimeslot &&
              patientName &&
              patientEmail &&
              isSignedIn
                ? "bg-purple-500 hover:bg-gradient-to-r from-purple-500 to-purple-600 transition"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={
              !selectedDoctor ||
              !selectedTimeslot ||
              !patientName ||
              !patientEmail ||
              !isSignedIn
            }
          >
            Book Appointment
          </motion.button>

          {loadingAppointments && (
            <motion.p>Loading your appointments...</motion.p>
          )}

          {appointments.length > 0 && (
            <motion.div
              className="mt-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.15 },
                },
              }}
            >
              <motion.h2
                className="text-3xl font-bold mb-4 border-b pb-2 bg-gradient-to-r from-purple-700 to-indigo-800 text-transparent bg-clip-text"
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
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div className="flex justify-between items-center mb-2">
                      <motion.p className="font-semibold text-lg text-purple-700">
                        {appt.doctorName}
                      </motion.p>

                      <div className="flex gap-2">
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
                      </div>
                    </motion.div>

                    {reschedulingId === appt.id && (
                      <motion.div
                        className="flex flex-col gap-2 mb-3"
                        whileFocus={{ scale: 1.02 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <select
                          value={reschedulingTimeslot}
                          onChange={(e) =>
                            setReschedulingTimeslot(e.target.value)
                          }
                          className="px-3 py-2 rounded border border-gray-300"
                        >
                          <option value="">Select new timeslot</option>
                          {doctors
                            ?.find((doc) => doc.email === appt.doctorEmail)
                            ?.timeslots.filter((slot) => slot !== appt.timeslot)
                            .sort((a, b) => new Date(a) - new Date(b))
                            .map((slot) => (
                              <option key={slot} value={slot}>
                                {new Date(slot).toLocaleString("en-US", {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-2">
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
                        </div>
                      </motion.div>
                    )}

                    <motion.p className="text-gray-700 mt-2">
                      <motion.strong>Time: </motion.strong>
                      {new Date(appt.timeslot).toLocaleString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </motion.p>

                    <motion.p
                      className="mt-1 text-purple-600 underline cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.a
                        href={appt.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => window.open(appt.meetLink, "_blank")}
                        title="Click to join meeting"
                      >
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
    </>
  );
};

export default AppointmentBooking;
