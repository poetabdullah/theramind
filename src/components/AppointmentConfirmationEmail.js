import emailjs from 'emailjs-com';

export const sendAppointmentConfirmationEmail = ({
  patientName,
  doctorName,
  timeslot,
  meetLink,
  patientEmail,
}) => {
  try {
    emailjs.send(
      'theramind_service',
      'confirmation_template',
      {
        patient_name: patientName,
        doctor_name: doctorName,
        timeslot: new Date(timeslot).toLocaleString(),
        meet_link: meetLink,
        email: patientEmail,
      },
      'TA0YUZ8PvIadVetlu'
    ).then(
      response => {
        console.log('Email sent successfully:', response.status, response.text);
      },
      error => {
        console.error('Failed to send email:', error);
      }
    );
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};
