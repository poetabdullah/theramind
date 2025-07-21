import React, { useState } from "react";
import axios from "axios";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion, AnimatePresence } from "framer-motion";

// Defining the API_BASE as a global variable
const API_BASE =
  process.env.REACT_APP_BACKEND_URL || "https://api.theramind.site/api";

const priorityLabels = {
  1: "Low Priority",
  2: "Medium Priority",
  3: "High Priority",
};

const priorityColors = {
  1: "bg-blue-50 border-blue-200 text-blue-700",
  2: "bg-yellow-50 border-yellow-200 text-yellow-700",
  3: "bg-red-50 border-red-200 text-red-700",
};

const TreatmentPlanSummary = ({
  selectedPatient,
  goals,
  patients,
  doctor,
  validateForm,
  clearForm,
  isEditing,
  planId,
  versionId,
  createdAt,
  lastUpdated,
  onAfterSaveEmail,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const patient = patients.find((p) => p.email === selectedPatient);
    if (!patient) return;
    const payload = {
      doctor_email: doctor.email,
      doctor_name: doctor.name,
      patient_email: patient.email,
      patient_name: patient.name,
      goals,
    };
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);
    try {
      const res = await axios.post(`${API_BASE}/treatment/create/`, payload);
      setSubmissionSuccess(
        isEditing
          ? "Treatment Plan Updated Successfully!"
          : "Treatment Plan Created Successfully!"
      );
      // fire parent email callback:
      if (typeof onAfterSaveEmail === "function") {
        try {
          await onAfterSaveEmail({
            isUpdate: isEditing,
            selectedPatient: patient.email,
            patientName: patient.name,
            doctorName: doctor.name,
            planId: res.data.plan_id || planId, // if create returns plan_id
          });
        } catch (emailErr) {
          console.error("Email send failed after save:", emailErr);
          // optionally inform user:
          setSubmissionError("Saved but email failed: " + emailErr.message);
        }
      }
      clearForm();
    } catch (apiError) {
      console.error("API Error:", apiError);
      // existing fallback ...
      try {
        const ref = collection(db, "treatment_plans");
        const docRef = await addDoc(ref, {
          ...payload,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          status: "active",
        });
        setSubmissionSuccess(
          isEditing
            ? "Treatment Plan Updated (Firestore Fallback)!"
            : "Treatment Plan Created (Firestore Fallback)!"
        );
        // after fallback save, still attempt email:
        if (typeof onAfterSaveEmail === "function") {
          try {
            await onAfterSaveEmail({
              isUpdate: isEditing,
              selectedPatient: patient.email,
              patientName: patient.name,
              doctorName: doctor.name,
              planId: planId || docRef.id,
            });
          } catch (emailErr) {
            console.error("Email send failed after fallback save:", emailErr);
            setSubmissionError("Saved but email failed: " + emailErr.message);
          }
        }
        clearForm();
      } catch (firestoreError) {
        console.error("Firestore Error:", firestoreError);
        setSubmissionError(
          "Failed to submit treatment plan. Please check connection and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalActions = goals.reduce(
    (total, goal) => total + goal.actions.length,
    0
  );
  const completedActions = goals.reduce(
    (total, goal) => total + goal.actions.filter((a) => a.is_completed).length,
    0
  );
  const progressPercent = totalActions
    ? Math.round((completedActions / totalActions) * 100)
    : 0;

  return (
    <div className="space-y-10">
      <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-6">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          {isEditing ? "Edit Summary" : "Treatment Plan Summary"}
        </h2>

        {isEditing && (
          <div className="mb-4 text-sm text-gray-600">
            <p>Plan ID: {planId}</p>
            <p>Version ID: {versionId}</p>
            <p>Created: {new Date(createdAt).toLocaleDateString()}</p>
            <p>Last Updated: {new Date(lastUpdated).toLocaleDateString()}</p>
          </div>
        )}

        <AnimatePresence>
          {submissionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg border border-green-200 bg-green-50 text-green-700 font-medium mb-4"
            >
              {submissionSuccess}
            </motion.div>
          )}
          {submissionError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 font-medium mb-4"
            >
              {submissionError}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-700 mb-6">
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="font-semibold">
              {selectedPatient
                ? patients.find((p) => p.email === selectedPatient)?.name ||
                  "Not selected"
                : "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Goals</p>
            <p className="font-semibold">{goals.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Actions</p>
            <p className="font-semibold">{totalActions}</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-orange-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progressPercent}% actions completed
        </p>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto mt-6 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white px-6 py-3 rounded-lg shadow-lg font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting
            ? isEditing
              ? "Updating..."
              : "Submitting..."
            : isEditing
            ? "Update Treatment Plan"
            : "Submit Treatment Plan"}
        </button>
      </div>

      <section className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <h2 className="text-2xl font-semibold text-gray-800">
            Preview of Treatment Plan
          </h2>
        </div>

        <div className="p-6">
          {goals.length > 0 ? (
            <div className="space-y-8">
              {goals.map((goal, index) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white text-orange-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                        <span className="font-bold">{index + 1}</span>
                      </div>
                      <h4 className="text-lg font-medium text-white">
                        {goal.title || "Untitled Goal"}
                      </h4>
                    </div>
                  </div>

                  <div className="p-5">
                    {goal.actions.length > 0 ? (
                      <div className="space-y-3">
                        {goal.actions.map((action) => (
                          <motion.div
                            key={action.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className={`p-4 rounded-xl border flex items-start justify-between ${
                              priorityColors[action.priority]
                            }`}
                          >
                            <div className="flex flex-col">
                              <p className="font-medium text-gray-800">
                                {action.description || "Untitled Action"}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                <span className="font-medium">
                                  {priorityLabels[action.priority]}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>
                                  Assigned to:{" "}
                                  <span className="font-medium">
                                    {action.assigned_to === "patient"
                                      ? "Patient"
                                      : "Doctor"}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {action.is_completed ? (
                              <div className="ml-4 h-6 w-6 rounded-full flex items-center justify-center bg-green-500 text-white">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="ml-4 h-6 w-6 rounded-full border-2 border-gray-300"></div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                        No actions defined for this goal.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">
                Add goals and actions to see a preview of the treatment plan.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TreatmentPlanSummary;
