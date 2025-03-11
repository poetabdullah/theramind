import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig.js";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const QuestionnaireResponses = ({ patientEmail }) => {
  const [latestResponse, setLatestResponse] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestData = async () => {
      const userEmail = patientEmail || (auth.currentUser ? auth.currentUser.email : null);

      if (!userEmail) {
        console.error("No user email found");
        setLoading(false);
        return;
      }

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
  }, [patientEmail]);

  return (
    <div className="bg-white p-4 border rounded-lg shadow-md w-full">
      <h2 className="text-xl font-bold mb-4 text-purple-700">Your Latest Assessment & Response</h2>
      {loading ? (
        <p className="text-gray-500">Loading data...</p>
      ) : (
        <div className="p-4 border rounded-lg bg-purple-50">
          {/* Latest Assessment */}
          {latestAssessment ? (
            <div className="mb-4">
              <h3 className="text-md font-semibold text-purple-700">Latest Assessment</h3>
              <p><strong>Diagnosed Subtype:</strong> {latestAssessment.detectedConditions?.diagnosedSubtype || "None"}</p>
              <p><strong>No Condition Diagnosed:</strong> {latestAssessment.detectedConditions?.noConditionDiagnosed ? "Yes" : "No"}</p>
              <p><strong>Suicidal Thoughts:</strong> {latestAssessment.detectedConditions?.suicidalThoughts ? "Yes" : "No"}</p>
              <p><strong>Timestamp:</strong> {latestAssessment.timestamp ? new Date(latestAssessment.timestamp.toDate()).toLocaleString() : "N/A"}</p>
            </div>
          ) : (
            <p className="text-gray-500">No assessment found.</p>
          )}

          {/* Latest Response */}
          {latestResponse ? (
            <div>
              <h3 className="text-md font-semibold text-purple-700">Latest Response</h3>
              <p><strong>Question:</strong> {latestResponse.questionText || "N/A"}</p>
              <p><strong>Your Answer:</strong> {latestResponse.response || "N/A"}</p>
              <p><strong>Timestamp:</strong> {latestResponse.timestamp ? new Date(latestResponse.timestamp.toDate()).toLocaleString() : "N/A"}</p>
            </div>
          ) : (
            <p className="text-gray-500">No responses found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionnaireResponses;
