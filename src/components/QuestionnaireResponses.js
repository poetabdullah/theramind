import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig.js";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const QuestionnaireResponses = ({ patientEmail }) => {
  const [latestResponses, setLatestResponses] = useState([]);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [formattedDate, setFormattedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResponses, setShowResponses] = useState(false);

  useEffect(() => {
    const fetchLatestData = async () => {
      const userEmail =
        patientEmail || (auth.currentUser ? auth.currentUser.email : null);
      if (!userEmail) {
        console.error("No user email found");
        setLoading(false);
        return;
      }

      try {
        const assessmentsRef = collection(
          db,
          "patients",
          userEmail,
          "assessments"
        );
        const assessmentsQuery = query(
          assessmentsRef,
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const assessmentSnapshot = await getDocs(assessmentsQuery);

        let latestAssessmentData = null;
        let latestTimestamp = null;

        if (!assessmentSnapshot.empty) {
          latestAssessmentData = assessmentSnapshot.docs[0].data();
          latestTimestamp = latestAssessmentData.timestamp?.toDate();
        }

        if (latestTimestamp) {
          const formatted = latestTimestamp.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          setFormattedDate(formatted);
        }
        setLatestAssessment(latestAssessmentData);

        if (latestTimestamp) {
          const responsesRef = collection(
            db,
            "patients",
            userEmail,
            "responses"
          );
          const tenMinutesBefore = new Date(
            latestTimestamp.getTime() - 10 * 60000
          );
          const responsesQuery = query(
            responsesRef,
            where("timestamp", ">=", tenMinutesBefore),
            where("timestamp", "<=", latestTimestamp)
          );
          const responseSnapshot = await getDocs(responsesQuery);

          if (!responseSnapshot.empty) {
            setLatestResponses(responseSnapshot.docs.map((doc) => doc.data()));
          }
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestData();
  }, [patientEmail]);

  return (
    <div className="bg-white p-4 border rounded-2xl shadow-md w-full">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent">
        Latest Assessment & Responses
      </h2>
      {loading ? (
        <p className="text-gray-500">Loading data...</p>
      ) : (
        <div className="p-4 border rounded-2xl bg-purple-50">
          {latestAssessment ? (
            <div className="mb-4">
              <h3 className="text-md font-semibold text-purple-700">
                Latest Assessment
              </h3>
              {formattedDate && (
                <p>
                  <strong>Date:</strong> {formattedDate}
                </p>
              )}
              <p>
                <strong>Diagnosed Subtype:</strong>{" "}
                {latestAssessment?.diagnosedSubtype || "None"}
              </p>
              <p>
                <strong>No Condition Diagnosed:</strong>{" "}
                {latestAssessment?.noConditionDiagnosed ? "Yes" : "No"}
              </p>
              <p>
                <strong>Suicidal Thoughts:</strong>{" "}
                {latestAssessment?.suicidalThoughts ? "Yes" : "No"}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No assessment found.</p>
          )}

          {latestResponses.length > 0 && (
            <div>
              <button
                onClick={() => setShowResponses(!showResponses)}
                className="flex items-center gap-2 text-md font-semibold text-purple-700 hover:underline"
              >
                Response Summary{" "}
                {showResponses ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {showResponses && (
                <ul className="list-disc pl-5 mt-2 bg-white p-3 border rounded-xl shadow-sm">
                  {latestResponses.map((response, index) => (
                    <li key={index} className="mb-2 ms-3">
                      <strong>Question:</strong>{" "}
                      {response.questionText || "N/A"}
                      <br />
                      <strong>Response:</strong> {response.response || "N/A"}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionnaireResponses;
