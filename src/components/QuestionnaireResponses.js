import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig.js"; // Import auth to get logged-in user
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const PatientResponse = () => {
  const [latestResponse, setLatestResponse] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestData = async () => {
      if (!auth.currentUser) return;

      const userEmail = auth.currentUser.email;
      try {
        // Fetch latest response
        const responsesRef = collection(db, "patients", userEmail, "responses");
        const responsesQuery = query(responsesRef, orderBy("timestamp", "desc"), limit(1));
        const responseSnapshot = await getDocs(responsesQuery);
        const latestResponseData = responseSnapshot.empty ? null : responseSnapshot.docs[0].data();

        // Fetch latest assessment
        const assessmentsRef = collection(db, "patients", userEmail, "assessments");
        const assessmentsQuery = query(assessmentsRef, orderBy("timestamp", "desc"), limit(1));
        const assessmentSnapshot = await getDocs(assessmentsQuery);
        const latestAssessmentData = assessmentSnapshot.empty ? null : assessmentSnapshot.docs[0].data();

        setLatestResponse(latestResponseData);
        setLatestAssessment(latestAssessmentData);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Latest Assessment & Response</h2>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="p-4 border rounded-lg shadow-md">
          {/* Latest Assessment */}
          {latestAssessment ? (
            <div className="mb-4">
              <h3 className="text-md font-semibold">Latest Assessment</h3>
              <p><strong>Diagnosed Subtype:</strong> {latestAssessment.detectedConditions?.diagnosedSubtype || "None"}</p>
              <p><strong>No Condition Diagnosed:</strong> {latestAssessment.detectedConditions?.noConditionDiagnosed ? "Yes" : "No"}</p>
              <p><strong>Suicidal Thoughts:</strong> {latestAssessment.detectedConditions?.suicidalThoughts ? "Yes" : "No"}</p>
              <p><strong>Timestamp:</strong> {latestAssessment.timestamp ? new Date(latestAssessment.timestamp).toLocaleString() : "N/A"}</p>
            </div>
          ) : (
            <p>No assessment found.</p>
          )}

          {/* Latest Response */}
          {latestResponse ? (
            <div>
              <h3 className="text-md font-semibold">Latest Response</h3>
              <p><strong>Question:</strong> {latestResponse.questionText || "N/A"}</p>
              <p><strong>Your Answer:</strong> {latestResponse.response || "N/A"}</p>
              <p><strong>Timestamp:</strong> {latestResponse.timestamp ? new Date(latestResponse.timestamp).toLocaleString() : "N/A"}</p>
            </div>
          ) : (
            <p>No responses found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientResponse;
