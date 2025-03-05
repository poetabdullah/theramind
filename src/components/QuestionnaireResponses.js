import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const PatientResponse = () => {
  const [patientsData, setPatientsData] = useState([]);

  // Function to fetch all patients
  const fetchAllPatients = async () => {
    try {
      const patientsRef = collection(db, "patients");
      const patientsSnapshot = await getDocs(patientsRef);
      return patientsSnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error("Error fetching patients:", error);
      return [];
    }
  };

  // Function to fetch responses for a specific patient
  const fetchResponses = async (patientEmail) => {
    try {
      const responsesRef = collection(db, "patients", patientEmail, "responses");
      const responsesQuery = query(responsesRef, orderBy("timestamp"));
      const responsesSnapshot = await getDocs(responsesQuery);

      return responsesSnapshot.docs.map(doc => ({
        questionText: doc.data().questionText || "",
        response: doc.data().response || "",
        timestamp: doc.data().timestamp
      }));
    } catch (error) {
      console.error(`Error fetching responses for ${patientEmail}:`, error);
      return [];
    }
  };

  // Function to fetch assessments for a specific patient
  const fetchAssessments = async (patientEmail) => {
    try {
      const assessmentsRef = collection(db, "patients", patientEmail, "assessments");
      const assessmentsQuery = query(assessmentsRef, orderBy("timestamp"));
      const assessmentsSnapshot = await getDocs(assessmentsQuery);

      return assessmentsSnapshot.docs.map(doc => ({
        allResponses: doc.data().allResponses || {},
        detectedConditions: {
          diagnosedSubtype: doc.data().detectedConditions?.diagnosedSubtype || "",
          noConditionDiagnosed: doc.data().detectedConditions?.noConditionDiagnosed || false,
          suicidalThoughts: doc.data().detectedConditions?.suicidalThoughts || false
        },
        timestamp: doc.data().timestamp
      }));
    } catch (error) {
      console.error(`Error fetching assessments for ${patientEmail}:`, error);
      return [];
    }
  };

  // Fetch all responses and assessments for all patients
  const fetchAllPatientData = async () => {
    try {
      const patientEmails = await fetchAllPatients();
      const patientData = await Promise.all(
        patientEmails.map(async (email) => {
          const [responses, assessments] = await Promise.all([
            fetchResponses(email),
            fetchAssessments(email)
          ]);
          return { email, responses, assessments };
        })
      );
      setPatientsData(patientData);
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  };

  useEffect(() => {
    fetchAllPatientData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Patient Assessments & Responses</h2>
      {patientsData.length === 0 ? (
        <p>Loading patient data...</p>
      ) : (
        patientsData.map((patient, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold">Patient: {patient.email}</h3>

            {/* Latest Assessment */}
            {patient.assessments.length > 0 ? (
              <div className="mt-4">
                <h4 className="text-md font-semibold">Latest Assessment</h4>
                <p><strong>Diagnosed Subtype:</strong> {patient.assessments[0].detectedConditions.diagnosedSubtype || "None"}</p>
                <p><strong>No Condition Diagnosed:</strong> {patient.assessments[0].detectedConditions.noConditionDiagnosed ? "Yes" : "No"}</p>
                <p><strong>Suicidal Thoughts:</strong> {patient.assessments[0].detectedConditions.suicidalThoughts ? "Yes" : "No"}</p>
                <p><strong>Timestamp:</strong> {new Date(patient.assessments[0].timestamp).toLocaleString()}</p>
              </div>
            ) : (
              <p>No assessments found.</p>
            )}

            {/* Responses */}
            <h4 className="text-md font-semibold mt-4">Responses</h4>
            {patient.responses.length > 0 ? (
              <ul className="space-y-2">
                {patient.responses.map((item, idx) => (
                  <li key={idx} className="p-3 border rounded-lg shadow-md">
                    <p className="font-semibold">{item.questionText}</p>
                    <p className="text-gray-700">{item.response}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No responses found.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PatientResponse;
