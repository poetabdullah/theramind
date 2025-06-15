import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import { db } from "../firebaseConfig";
import {getDoc, doc, updateDoc} from "firebase/firestore";

// Initialize EmailJS once
const EMAILJS_USER_ID = process.env.REACT_APP_EMAILJS_USER_ID;
emailjs.init(EMAILJS_USER_ID);

export async function sendAccountStatusEmail(email, name, status) {
  try {
    // ONLY these 3 variables that exist in template
    const templateParams = {
      to_email: email,  // Required for delivery (even if not in content)
      recipient_name: name || 'User',
      status: status
    };
    // 2. Send email
    await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_USER_ID
    );

    // 3. Show success
    toast.success(`Email sent to ${email}`);
    console.log('Email sent successfully');

  } catch (error) {
    toast.error(`Failed to send email: ${error.message}`);
    console.error('Email error:', error);
    throw error;
  }
}


// Simplified blocking function
export async function handleBlockPatient(email, action) {
  try {
    // 1. Update Firebase
    const patientRef = doc(db, "patients", email);
    await updateDoc(patientRef, {
      status: action === 'block' ? 'blocked' : 'active',
      lastModified: new Date()
    });

    // 2. Get patient name
    const patientDoc = await getDoc(patientRef);
    const { name } = patientDoc.data();

    // 3. Send email
    await sendAccountStatusEmail(
      email,
      name,
      action === 'block' ? 'blocked' : 'unblocked'
    );

  } catch (error) {
    toast.error(`Action failed: ${error.message}`);
    console.error('Blocking error:', error);
  }
}
