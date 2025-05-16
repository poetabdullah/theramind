import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const CreateTreatmentPlan = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [goals, setGoals] = useState([]);
  const [doctor, setDoctor] = useState({ email: "", name: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const doctorRef = doc(db, "doctors", user.email);
      const doctorSnap = await getDoc(doctorRef);

      if (!doctorSnap.exists()) {
        navigate("/unauthorized");
        return;
      }

      const doctorData = doctorSnap.data();
      setDoctor({ email: user.email, name: doctorData.name || "Doctor" });

      const patientsSnapshot = await getDocs(collection(db, "patients"));
      const patientList = patientsSnapshot.docs.map((doc) => doc.data());
      setPatients(patientList);
    });

    return () => unsubscribe();
  }, [navigate]);

  const validateGoal = (goal) => {
    const words = goal.title.trim().split(/\s+/);
    return words.length >= 5;
  };

  const validateAction = (action) => {
    const words = action.description.trim().split(/\s+/);
    return words.length >= 5;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!selectedPatient) {
      newErrors.patient = "Please select a patient";
      isValid = false;
    }

    if (goals.length === 0) {
      newErrors.goals = "Please add at least one goal";
      isValid = false;
    }

    goals.forEach((goal, goalIndex) => {
      if (!validateGoal(goal)) {
        newErrors[`goal_${goalIndex}`] = "Goal must contain at least 5 words";
        isValid = false;
      }

      if (goal.actions.length > 10) {
        newErrors[`goal_actions_max_${goalIndex}`] =
          "Goal can have maximum 10 actions";
        isValid = false;
      }

      if (goal.actions.length < 1) {
        newErrors[`goal_actions_min_${goalIndex}`] =
          "Goal must have at least 1 action";
        isValid = false;
      }

      goal.actions.forEach((action, actionIndex) => {
        if (!validateAction(action)) {
          newErrors[`action_${goalIndex}_${actionIndex}`] =
            "Action must contain at least 5 words";
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const addGoal = () => {
    setGoals((prev) => [
      ...prev,
      {
        id: uuidv4(),
        title: "",
        actions: [],
      },
    ]);
  };

  const deleteGoal = (goalId) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const updateGoalTitle = (goalId, newTitle) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, title: newTitle } : g))
    );
  };

  const addAction = (goalId) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              actions: [
                ...g.actions,
                {
                  id: uuidv4(),
                  description: "",
                  priority: 1,
                  assigned_to: "patient",
                  is_completed: false,
                },
              ],
            }
          : g
      )
    );
  };

  const updateAction = (goalId, actionId, field, value) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              actions: g.actions.map((a) =>
                a.id === actionId ? { ...a, [field]: value } : a
              ),
            }
          : g
      )
    );
  };

  const deleteAction = (goalId, actionId) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              actions: g.actions.filter((a) => a.id !== actionId),
            }
          : g
      )
    );
  };

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
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      status: "active",
    };

    // Set a loading state
    setErrors((prev) => ({
      ...prev,
      submission: "Submitting treatment plan...",
    }));

    try {
      // First attempt the API approach
      try {
        const res = await axios.post("/api/treatment/create/", payload);
        alert("Treatment Plan Created Successfully!");
        // Clear goals and selected patient after successful submission
        setGoals([]);
        setSelectedPatient("");
        setErrors({});
        return;
      } catch (apiError) {
        console.error("API Error:", apiError);
        // If API fails, try direct Firestore approach
        throw new Error("API method failed, trying Firestore directly");
      }
    } catch (error) {
      try {
        // Direct Firestore approach as backup
        const treatmentPlansRef = collection(db, "treatment_plans");
        await addDoc(treatmentPlansRef, payload);

        alert(
          "Treatment Plan Created Successfully using direct database write!"
        );
        // Clear goals and selected patient after successful submission
        setGoals([]);
        setSelectedPatient("");
        setErrors({});
      } catch (firestoreError) {
        console.error("Firestore Error:", firestoreError);
        setErrors((prev) => ({
          ...prev,
          submission:
            "Failed to create treatment plan. Please check your connection and try again.",
        }));
        alert("Failed to create treatment plan. Details logged to console.");
      }
    }
  };

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

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-6 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">Create Treatment Plan</h1>
          <p className="mt-2 opacity-90">
            Design a personalized care plan for your patient
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-medium mb-2">
              Please correct the following issues:
            </h3>
            <ul className="list-disc pl-5 text-red-700">
              {Object.entries(errors).map(([key, error], index) =>
                key !== "submission" ? <li key={index}>{error}</li> : null
              )}
            </ul>
            {errors.submission && (
              <div
                className={`mt-2 p-2 rounded ${
                  errors.submission.includes("Submitting")
                    ? "bg-blue-50 text-blue-700"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {errors.submission}
              </div>
            )}
          </div>
        )}

        {/* Patient selection */}
        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">
            Select Patient
          </label>
          <div className="relative">
            <select
              className={`w-full p-3 bg-white border ${
                errors.patient ? "border-red-500" : "border-gray-300"
              } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="" disabled>
                Select a Patient
              </option>
              {patients.map((p) => (
                <option key={p.email} value={p.email}>
                  {p.name} ({p.email})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          {errors.patient && (
            <p className="mt-1 text-sm text-red-600">{errors.patient}</p>
          )}
        </div>

        {errors.goals && (
          <p className="mb-4 text-sm text-red-600">{errors.goals}</p>
        )}

        {/* Goals List */}
        {goals.map((goal, goalIndex) => (
          <div
            key={goal.id}
            className="mb-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Goal Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal {goalIndex + 1}
                  </label>
                  <div className="relative">
                    <textarea
                      className={`w-full p-3 pr-12 bg-white border ${
                        errors[`goal_${goalIndex}`]
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="Enter goal description (minimum 5 words)"
                      rows="2"
                      value={goal.title}
                      onChange={(e) => updateGoalTitle(goal.id, e.target.value)}
                    />
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="absolute right-2 top-2 text-gray-400 hover:text-red-500 focus:outline-none"
                      title="Delete Goal"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {errors[`goal_${goalIndex}`] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[`goal_${goalIndex}`]}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Count Warning */}
              {(errors[`goal_actions_min_${goalIndex}`] ||
                errors[`goal_actions_max_${goalIndex}`]) && (
                <p className="mt-2 text-sm text-red-600">
                  {errors[`goal_actions_min_${goalIndex}`] ||
                    errors[`goal_actions_max_${goalIndex}`]}
                </p>
              )}
            </div>

            {/* Actions List */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Actions for this goal:
              </h3>

              {goal.actions.length === 0 ? (
                <p className="text-sm text-gray-500 italic mb-4">
                  No actions added yet. Add at least one action.
                </p>
              ) : (
                <div className="space-y-3 mb-4">
                  {goal.actions.map((action, actionIndex) => (
                    <div
                      key={action.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-grow">
                          <textarea
                            className={`w-full p-3 bg-white border ${
                              errors[`action_${goalIndex}_${actionIndex}`]
                                ? "border-red-500"
                                : "border-gray-200"
                            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                            placeholder="Enter action description (minimum 5 words)"
                            rows="2"
                            value={action.description}
                            onChange={(e) =>
                              updateAction(
                                goal.id,
                                action.id,
                                "description",
                                e.target.value
                              )
                            }
                          />
                          {errors[`action_${goalIndex}_${actionIndex}`] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors[`action_${goalIndex}_${actionIndex}`]}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 md:gap-4">
                          {/* Priority Dropdown */}
                          <div>
                            <select
                              className={`block w-full px-3 py-2 border ${
                                priorityColors[action.priority]
                              } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                              value={action.priority}
                              onChange={(e) =>
                                updateAction(
                                  goal.id,
                                  action.id,
                                  "priority",
                                  parseInt(e.target.value)
                                )
                              }
                            >
                              <option value={1}>Low</option>
                              <option value={2}>Medium</option>
                              <option value={3}>High</option>
                            </select>
                          </div>

                          {/* Assigned To Dropdown */}
                          <div>
                            <select
                              className="block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              value={action.assigned_to}
                              onChange={(e) =>
                                updateAction(
                                  goal.id,
                                  action.id,
                                  "assigned_to",
                                  e.target.value
                                )
                              }
                            >
                              <option value="patient">Patient</option>
                              <option value="doctor">Doctor</option>
                            </select>
                          </div>

                          {/* Delete Action Button */}
                          <button
                            onClick={() => deleteAction(goal.id, action.id)}
                            className="text-gray-400 hover:text-red-500 focus:outline-none"
                            title="Delete Action"
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Action Button */}
              <button
                onClick={() => addAction(goal.id)}
                disabled={goal.actions.length >= 10}
                className={`flex items-center text-sm font-medium px-4 py-2 rounded-md ${
                  goal.actions.length >= 10
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600"
                }`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Action {goal.actions.length >= 10 && "(Max 10)"}
              </button>
            </div>
          </div>
        ))}

        {/* Add Goal Button */}
        <button
          onClick={addGoal}
          className="flex items-center mb-8 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-6 py-3 rounded-lg shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Goal
        </button>

        {/* Summary & Submit */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-medium text-gray-800 mb-4">
            Treatment Plan Summary
          </h2>

          <div className="mb-4">
            <p className="text-gray-600">
              <span className="font-medium">Patient:</span>{" "}
              {selectedPatient
                ? patients.find((p) => p.email === selectedPatient)?.name ||
                  "Not selected"
                : "Not selected"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Goals:</span> {goals.length}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Actions:</span>{" "}
              {goals.reduce((total, goal) => total + goal.actions.length, 0)}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white px-6 py-3 rounded-lg shadow-md font-medium text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all"
          >
            Submit Treatment Plan
          </button>
        </div>
      </main>

      {/* Preview Section - How this will appear to patients */}
      <section className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xl font-medium text-gray-800 mb-6">
            Treatment Plan Preview
          </h2>

          {goals.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h3 className="text-lg font-medium">
                  Treatment Goals and Actions
                </h3>
              </div>

              <div className="p-6">
                {goals.map((goal, index) => (
                  <div key={goal.id} className="mb-8 last:mb-0">
                    <div className="flex items-start mb-3">
                      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="font-medium">{index + 1}</span>
                      </div>
                      <h4 className="text-lg font-medium ml-3 text-gray-800">
                        {goal.title || "Untitled Goal"}
                      </h4>
                    </div>

                    {goal.actions.length > 0 ? (
                      <div className="ml-11 space-y-3">
                        {goal.actions.map((action, actionIndex) => (
                          <div
                            key={action.id}
                            className={`p-3 rounded-lg border flex items-center ${
                              priorityColors[action.priority]
                            }`}
                          >
                            <div className="flex-grow">
                              <p className="text-gray-800">
                                {action.description || "Untitled Action"}
                              </p>
                              <div className="flex items-center mt-1 text-xs">
                                <span className="font-medium mr-2">
                                  {priorityLabels[action.priority]}
                                </span>
                                <span className="mx-2">•</span>
                                <span>
                                  Assigned to:{" "}
                                  {action.assigned_to === "patient"
                                    ? "You"
                                    : "Your Provider"}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4 h-6 w-6 rounded-md border border-current flex items-center justify-center flex-shrink-0">
                              {action.is_completed && (
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="ml-11 text-sm text-gray-500 italic">
                        No actions defined for this goal
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-gray-500">
                Add goals and actions to see a preview of the treatment plan
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-gray-50 border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
        <p>
          © {new Date().getFullYear()} Mental Health Treatment Platform. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default CreateTreatmentPlan;
