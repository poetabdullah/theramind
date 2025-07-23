import emailjs from 'emailjs-com';

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
    //Payload sent to EmailJS to format the email content
    const templateParams = {
      patient_name: patientName,
      doctor_name: doctorName,
      email: patientEmail,
      timeslot: new Date(timeslot).toLocaleString(),
      cancelled_by: patientName || 'Unknown',
    };

    console.log("EmailJS cancellation payload:", templateParams);

    const response = await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_CANCELLATION_TEMPLATE,
      templateParams,
      process.env.REACT_APP_EMAILJS_CANCEL_USER_ID
    );

    console.log('Appointment confirmation email sent:',patientEmail, response.status, response.text);
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};

export const sendRescheduleEmail = async ({
  to_email,
  to_role,
  patientName,
  doctorName,
  patientEmail,
  doctorEmail,
  oldTime,
  newTime,
  meetLink,
  rescheduledBy,
}) => {
  //Ensuring at least one email is provided; either patient or doctor
    const recipientEmail = patientEmail?.trim() || doctorEmail?.trim() || '';

  if (!recipientEmail) {
    console.error('❌ No valid recipient email found. Rescheduling email not sent.',
      patientEmail,
      doctorEmail,
  );
    return;
  }
  try {
    //To format the time in a readable format; toLocaleString() is used to convert ISO string to local date format
    const formatTime = (isoString) => {
    const date = new Date(isoString);
    return isNaN(date.getTime())
      ? "Unavailable"
      : date.toLocaleString("en-GB", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      };
      //Payload sent to EmailJS to format the email content
    const templateParams = {
      to_email,
      to_role,
      patient_name: patientName,
      doctor_name: doctorName,
      email: recipientEmail,
      new_time: formatTime(newTime),
      meet_link: meetLink,
      rescheduled_by: rescheduledBy,
    };

    console.log('Template Params (Reschedule):', templateParams);
    const response = await emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID,
      process.env.REACT_APP_EMAILJS_RESCHEDULE_TEMPLATE,
      templateParams,
      process.env.REACT_APP_EMAILJS_USER_ID
    );

    console.log('Appointment reschedule email sent:', response.status, response.text);
  } catch (error) {
    console.error('Error sending appointment reschedule email:', error);
    throw error;
  }
};
