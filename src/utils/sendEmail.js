import emailjs from 'emailjs-com';

const SERVICE_ID = 'theramind_service';
const CANCELLATION_TEMPLATE = 'cancellation_template';
const RESCHEDULE_TEMPLATE = 'reschedule_email_template';
const USER_ID = 'TA0YUZ8PvIadVetlu';
const CANCEL_USER_ID = 'VsfE_hs5ETC-r3Qmc';

export const sendCancelEmail = async ({
  patientName,
  doctorName,
  patientEmail,
  timeslot,
  cancelled_by
}) => {
   if (!patientEmail) {
    console.log("Patient email: ", patientEmail);
    throw new Error("Patient email is required to send cancellation email.");
    
  }
  try {
    const templateParams = {
      patient_name: patientName,
      doctor_name: doctorName,
      email: patientEmail,
      timeslot: new Date(timeslot).toLocaleString(),
      cancelled_by: patientName || 'Unknown',
    };

    console.log("EmailJS cancellation payload:", templateParams);

    const response = await emailjs.send(
      SERVICE_ID,
      CANCELLATION_TEMPLATE,
      templateParams,
      CANCEL_USER_ID
    );

    console.log('Appointment confirmation email sent:',patientEmail, response.status, response.text);
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};

export const sendRescheduleEmail = async ({
  patientName,
  doctorName,
  patientEmail,
  doctorEmail,
  oldTime,
  newTime,
  meetLink,
  rescheduledBy,
}) => {
  const recipientEmail = (patientEmail?.trim() || doctorEmail?.trim()) ?? '';

  if (!recipientEmail) {
    console.error('❌ No valid recipient email found. Cancellation email not sent.');
    return;
  }
  try {
    const templateParams = {
      patient_name: patientName,
      doctor_name: doctorName,
      email: recipientEmail,
      old_time: new Date(oldTime).toLocaleString(),
      new_time: new Date(newTime).toLocaleString(),
      meet_link: meetLink,
      rescheduled_by: rescheduledBy,
    };

    console.log('Template Params (Cancel):', templateParams);
    const response = await emailjs.send(
      SERVICE_ID,
      RESCHEDULE_TEMPLATE,
      templateParams,
      USER_ID
    );

    console.log('Appointment reschedule email sent:', response.status, response.text);
  } catch (error) {
    console.error('Error sending appointment reschedule email:', error);
    throw error;
  }
};
