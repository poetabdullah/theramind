import emailjs from 'emailjs-com';

//Objects with destructured parameters for sending emails
export const sendAppointmentConfirmationEmail = async ({
  patientName,
  doctorName,
  timeslot,
  meetLink,
  patientEmail,
}) => {
  try {
    //Email payload sent to EmailJS to format the email content
    const templateParams = {
      patient_name: patientName,
      doctor_name: doctorName,
      timeslot: new Date(timeslot).toLocaleString(),
      meet_link: meetLink,
      email: patientEmail,
    };

    const response = await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_CONFIRMATION_TEMPLATE,
      templateParams,
      process.env.REACT_APP_EMAILJS_USER_ID
    );

    console.log('Appointment confirmation email sent:', response.status, response.text);
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};
