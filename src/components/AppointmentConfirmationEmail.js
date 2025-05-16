import emailjs from 'emailjs-com';

export const sendAppointmentConfirmationEmail = (params) => {
  try {
    emailjs.send(
      'theramind_service',
      'appointment_template',
      params,
      'TA0YUZ8PvIadVetlu'
    ).then((response) => {
      console.log('Email sent successfully:', response.status, response.text);
    }, (error) => {
      console.error('Failed to send email:', error);
    });
    // Log success message
    console.log('Appointment confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};

export const sendCancelEmail = ({ patient_name, doctor_name, doctor_email, time }) => {
  emailjs.send(
    'theramind_service',
    'theramind_cancel_template',
    { patient_name, doctor_name, doctor_email, time },
    'TA0YUZ8PvIadVetlu'
  ).then((response) => {
    console.log('Email sent successfully:', response.status, response.text);
  }, (error) => {
    console.error('Failed to send email:', error);
  });
};

export const sendRescheduleEmail = ({ patient_name, doctor_name, doctor_email, time }) => {
  emailjs.send(
    'theramind_service',
    'theramind_reschedule_template',
    { patient_name, doctor_name, doctor_email, time },
    'TA0YUZ8PvIadVetlu'
  ).then((response) => {
    console.log('Email sent successfully:', response.status, response.text);
  }, (error) => {
    console.error('Failed to send email:', error);
  });
};