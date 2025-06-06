import emailjs from 'emailjs-com';

const SERVICE_ID = 'theramind_service';
const CONFIRMATION_TEMPLATE = 'confirmation_template';
const USER_ID = 'TA0YUZ8PvIadVetlu';

export const sendAppointmentConfirmationEmail = async ({
  patientName,
  doctorName,
  timeslot,
  meetLink,
  patientEmail,
}) => {
  try {
    const templateParams = {
      patient_name: patientName,
      doctor_name: doctorName,
      timeslot: new Date(timeslot).toLocaleString(),
      meet_link: meetLink,
      email: patientEmail,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      CONFIRMATION_TEMPLATE,
      templateParams,
      USER_ID
    );

    console.log('Appointment confirmation email sent:', response.status, response.text);
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};
