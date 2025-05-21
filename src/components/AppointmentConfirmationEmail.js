import emailjs from 'emailjs-com';

export const sendAppointmentConfirmationEmail = ({
  patient_name,
  doctor_name,
  time,
  meet_link,
  email,
}) => {
  try {
    emailjs.send(
      'theramind_service',             
      'confirmation_template',           
      {
        patient_name,
        doctor_name,
        time,
        meet_link,
        email,                         
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
