import emailjs from "@emailjs/browser";

export async function sendCreateOrUpdateEmail({
    isUpdate,
    selectedPatient,
    patientName,
    doctorName,
    doctorEmail,
    planId
}) {
    const userId = process.env.REACT_APP_EMAILJS_USER_ID_CREATE;
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID_CREATE;
    const templateId = isUpdate
        ? process.env.REACT_APP_EMAILJS_TEMPLATE_UPDATE
        : process.env.REACT_APP_EMAILJS_TEMPLATE_CREATE;

    emailjs.init(userId);

    const formattedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });

    const baseParams = {
        patient_name: patientName,
        doctor_name: doctorName,
        plan_link: `${window.location.origin}/patient-dashboard`
    };

    const paramsForPatient = isUpdate
        ? {
            ...baseParams,
            to_email: selectedPatient,
            plan_name: `Treatment Plan #${planId}`,
            update_date: formattedDate
        }
        : {
            ...baseParams,
            to_email: selectedPatient,
            creation_date: formattedDate
        };

    const paramsForDoctor = {
        ...baseParams,
        to_email: doctorEmail,
        patient_email: selectedPatient,
        creation_date: formattedDate
    };

    console.log("📧 Sending patient email with params:", paramsForPatient, "template:", templateId);
    const resPatient = await emailjs.send(serviceId, templateId, paramsForPatient, userId);

    let resDoctor = null;
    if (!isUpdate && doctorEmail) {
        console.log("📧 Sending doctor email with params:", paramsForDoctor, "template:", templateId);
        resDoctor = await emailjs.send(serviceId, templateId, paramsForDoctor, userId);
    }

    console.log("✅ EmailJS response (patient):", resPatient);
    if (resDoctor) console.log("✅ EmailJS response (doctor):", resDoctor);

    return { resPatient, resDoctor };
}