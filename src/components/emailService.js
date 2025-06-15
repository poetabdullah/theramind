import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import { db } from "../firebaseConfig";
import { getDoc, doc, updateDoc } from "firebase/firestore";

// ✅ Initialize EmailJS once (don't check with `if`)
emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);  // <-- use correct var

export async function sendAccountStatusEmail(email, name, status, reason = "") {
  try {
    const templateParams = {
      to_email: email,
      recipient_name: name || (['approved', 'rejected'].includes(status) ? 'Doctor' : 'Patient'),
      status: status || "unknown",
      action_date: new Date().toLocaleDateString(),
    };

    const templateId = ['approved', 'rejected', 'blocked'].includes(status)
      ? process.env.REACT_APP_EMAILJS_TEMPLATE_DOCTOR
      : process.env.REACT_APP_EMAILJS_TEMPLATE_PATIENT;

    await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID_STATUS,
      templateId,
      templateParams
    );

    toast.success(`Notification sent to ${email}`);
  } catch (error) {
    toast.error(`Failed to send email: ${error.message}`);
    console.error('Email error:', error);
    throw error;
  }
}

export async function handleBlockPatient(email, action) {
  try {
    const patientRef = doc(db, "patients", email);
    const status = action === 'block' ? 'blocked' : 'active';
    
    await updateDoc(patientRef, {
      status: status,
      lastModified: new Date()
    });

    const patientDoc = await getDoc(patientRef);
    await sendAccountStatusEmail(
      email,
      patientDoc.data().name,
      status
    );

  } catch (error) {
    toast.error(`Action failed: ${error.message}`);
    console.error('Blocking error:', error);
  }
}
