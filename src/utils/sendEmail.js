import emailjs from 'emailjs-com';

const SERVICE_ID = 'theramind_service';
const USER_ID = 'TA0YUZ8PvIadVetlu';

export const sendCancelEmail = async ({
  patient_name,
  doctor_name,
  doctor_email,
  patient_email,
  time,
  cancelled_by,
}) => {
  try {
    await emailjs.send(SERVICE_ID, 'cancel_email_template', {
      patient_name,
      doctor_name,
      doctor_email,
      patient_email,
      time: new Date(time).toLocaleString(),
      cancelled_by,
    }, USER_ID);
  } catch (error) {
    console.error('Error sending cancel email:', error);
  }
};

export const sendRescheduleEmail = async ({
  patient_name,
  doctor_name,
  doctor_email,
  patient_email,
  old_time,
  new_time,
  meet_link,
  rescheduled_by,
}) => {
  try {
    await emailjs.send(SERVICE_ID, 'reschedule_email_template', {
      patient_name,
      doctor_name,
      doctor_email,
      patient_email,
      old_time: new Date(old_time).toLocaleString(),
      new_time: new Date(new_time).toLocaleString(),
      meet_link,
      rescheduled_by,
    }, USER_ID);
  } catch (error) {
    console.error('Error sending reschedule email:', error);
  }
};
