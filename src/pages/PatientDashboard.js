import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import ListViewCard from "../components/ListViewCard";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import QuestionnaireResponses from "../components/QuestionnaireResponses";
import TreatmentPlanView from "../components/TreatmentPlanView";
import TerminatedTreatmentPlans from "../components/TerminatedTreatmentPlans";
import axios from "axios";
import PatientBookAppointment from "../components/PatientBookAppointment";
import { motion } from "framer-motion";

// Global variable for easier access to the backend:
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Patient Dashboard is the area patient is directed to on login
const PatientDashboard = () => {
  const [user, setUser] = useState(null);
  const [patientStories, setPatientStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Checks if the user is editing the data
  const [patientData, setPatientData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // Checks which area of the edit is the patient on based on the steps

  // Treatment Plan states
  const [planVersions, setPlanVersions] = useState([]);
  const [planId, setPlanId] = useState(null);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [planMeta, setPlanMeta] = useState(null);

  const navigate = useNavigate();
  // Form state
  const [detailFormData, setDetailFormData] = useState({
    birthHistory: "",
    location: "",
  });

  const [healthFormData, setHealthFormData] = useState({
    mentalHealthConditions: [],
    familyHistory: "",
    significantTrauma: "",
    childhoodChallenges: "",
  });

  const [detailErrors, setDetailErrors] = useState({});
  const [healthErrors, setHealthErrors] = useState({});

  const fetchPatientData = useCallback(async (email) => {
    try {
      const q = query(collection(db, "patients"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        setPatientData({ id: querySnapshot.docs[0].id, ...docData });
        fetchPatientStories(email);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
    }
  }, []);

  // fetch active treatment plans for this patient
  useEffect(() => {
    if (!patientData?.email) return;

    (async () => {
      try {
        // 1) load all plans for patient
        const res = await axios.get(
          `${API_BASE}/treatment/user/patient/${encodeURIComponent(patientData.email)}/`
        );
        const active = res.data.find((p) => p.is_terminated === false);
        if (active) {
          setPlanId(active.plan_id);

          // 2) fetch versions
          const vRes = await axios.get(
            `${API_BASE}/treatment/${active.plan_id}/versions/`
          );
          setPlanVersions(vRes.data);
          setActiveVersionIndex(vRes.data.length - 1);

          // 3) fetch plan metadata (so we know the doctor info)
          const metaRes = await axios.get(
            `${API_BASE}/treatment/${encodeURIComponent(active.plan_id)}/`
          );
          setPlanMeta(metaRes.data);
        } else {
          setPlanId(null);
          setPlanVersions([]);
          setPlanMeta(null);
        }
      } catch (err) {
        console.error("Error loading treatment plans:", err);
      }
    })();
  }, [patientData]);

  // helper to fetch a single version’s details
  const fetchVersion = useCallback(
    async (planId, versionId) => {
      const resp = await axios.get(
        `${API_BASE}/treatment/${planId}/version/${versionId}/`
      );
      return resp.data;
    },
    []
  );

  // handler to toggle an action complete/incomplete
  const handleMarkComplete = useCallback(
    async ({ goalId, actionId, newStatus }) => {
      const versionId = planVersions[activeVersionIndex]?.version_id;
      if (!planId || !versionId) return;
      try {
        await axios.post(
          `${API_BASE}/treatment/${planId}/version/${versionId}/complete/`,
          {
            goal_id: goalId,
            action_id: actionId,
            role: "patient",
            is_completed: newStatus,
          }
        );
        // force TreatmentPlanView to re-fetch by resetting the same index
        setActiveVersionIndex((i) => i);
      } catch (err) {
        console.error("Error marking complete:", err);
      }
    },
    [planId, planVersions, activeVersionIndex]
  );

  // handler to terminate
  const handleTerminate = useCallback(async () => {
    if (!planId) return;
    try {
      await axios.post(`${API_BASE}/treatment/${planId}/terminate/`);
      setPlanVersions((vers) =>
        vers.map((v, idx) =>
          v.version_id === planVersions[activeVersionIndex]?.version_id
            ? { ...v, is_terminated: true }
            : v
        )
      );
    } catch (err) {
      console.error("Error terminating plan:", err);
    }
  }, [planId, planVersions, activeVersionIndex]);

  // helper to fetch the plan metadata (doctor_name, dates, etc.)
  const fetchTreatmentPlan = useCallback(
    async (planId) => {
      const res = await axios.get(
        `${API_BASE}/treatment/${encodeURIComponent(planId)}/`
      );
      return res.data;
    },
    []
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
        fetchPatientData(authUser.email);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate, fetchPatientData]);

  const fetchPatientStories = async (email) => {
    try {
      const q = query(
        collection(db, "patient_stories"),
        where("author_email", "==", email)
      );
      const querySnapshot = await getDocs(q);
      const stories = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPatientStories(stories);
    } catch (err) {
      console.error("Error fetching patient stories:", err);
      setError("Failed to load patient stories.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetailFormData({ ...detailFormData, [name]: value });
    setDetailErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

  const handleHealthChange = (e) => {
    const { name, value } = e.target;
    if (e.target.type === "checkbox") {
      setHealthFormData((prevData) => {
        const updatedConditions = prevData.mentalHealthConditions.includes(
          value
        )
          ? prevData.mentalHealthConditions.filter((item) => item !== value)
          : [...prevData.mentalHealthConditions, value];
        return { ...prevData, mentalHealthConditions: updatedConditions };
      });
    } else {
      setHealthFormData({ ...healthFormData, [name]: value });
    }
    setHealthErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

  const validateDetailForm = () => {
    const { location } = detailFormData;
    const validationErrors = {};

    if (!location || location.length < 5) {
      validationErrors.location =
        "Location must be at least 5 characters long.";
    }

    if (patientData?.gender === "Female" && !detailFormData.birthHistory) {
      validationErrors.birthHistory =
        "Please specify if you have given birth in the past year.";
    }

    setDetailErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const validateHealthForm = () => {
    const newError = {};
    if (healthFormData.mentalHealthConditions.length === 0) {
      newError.mentalHealthConditions =
        "Please select at least one mental health condition.";
    }
    if (!healthFormData.familyHistory) {
      newError.familyHistory = "Please select an option for family history.";
    }
    if (!healthFormData.significantTrauma) {
      newError.significantTrauma =
        "Please select an option for significant trauma.";
    }
    if (!healthFormData.childhoodChallenges) {
      newError.childhoodChallenges =
        "Please select an option for childhood challenges.";
    }

    setHealthErrors(newError);
    return Object.keys(newError).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (validateDetailForm()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateHealthForm()) {
      try {
        const patientRef = doc(db, "patients", patientData.id);
        const updatedData = {
          ...detailFormData,
          ...healthFormData,
        };
        await updateDoc(patientRef, updatedData);
        setIsEditing(false);
        fetchPatientData(user.email);
      } catch (error) {
        console.error("Error updating patient data:", error);
      }
    }
  };

  const handleBirthHistoryChange = (option) => {
    setDetailFormData({ ...detailFormData, birthHistory: option });
    setDetailErrors((prevErrors) => ({ ...prevErrors, birthHistory: null }));
  };

  const renderDetailForm = () => {
    return (
      <form onSubmit={handleContinue} className="space-y-6">
        {/* Location Input */}
        <div className="mb-5">
          <label className="block font-medium mb-1 text-purple-700">
            Location
          </label>
          <input
            name="location"
            type="text"
            placeholder="Enter your location"
            value={detailFormData.location}
            onChange={handleDetailChange}
            className={`block w-full p-3 border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${detailErrors.location ? "border-red-500" : "border-gray-300"
              }`}
          />
          {detailErrors.location && (
            <p className="text-red-500 text-sm mt-2">{detailErrors.location}</p>
          )}
        </div>

        {/* Birth History (Only if gender is Female) */}
        {patientData && patientData.gender === "Female" && (
          <div className="mb-5">
            <label className="block font-medium text-purple-700">
              Have you given birth in the past year?
            </label>
            <div className="flex gap-4 mt-2">
              {["Yes", "No"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleBirthHistoryChange(option)}
                  className={`px-4 py-2 rounded-2xl transition focus:outline-none ${detailFormData.birthHistory === option
                    ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {detailErrors.birthHistory && (
              <p className="text-red-500 text-sm mt-2">
                {detailErrors.birthHistory}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow"
          >
            Continue
          </button>
        </div>
      </form>
    );
  };

  const renderHealthForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mental Health Conditions */}
        <div className="bg-white p-6 mb-6 rounded-2xl shadow border border-purple-100">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">
            Mental Health Conditions
          </h3>
          {["OCD", "Depression", "Trauma", "Anxiety", "Stress"].map(
            (condition) => (
              <label key={condition} className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  name="mentalHealthConditions"
                  value={condition}
                  checked={healthFormData.mentalHealthConditions.includes(
                    condition
                  )}
                  onChange={handleHealthChange}
                  className="form-checkbox text-orange-500 h-5 w-5"
                />
                <span className="text-gray-700">{condition}</span>
              </label>
            )
          )}
          {healthErrors.mentalHealthConditions && (
            <p className="text-red-500 text-sm mt-2">
              {healthErrors.mentalHealthConditions}
            </p>
          )}
        </div>

        {/* Family History */}
        <div className="bg-white p-6 mb-6 rounded-2xl shadow border border-purple-100">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">
            Family Mental Health History
          </h3>
          {["Yes", "No", "Unsure"].map((option) => (
            <label key={option} className="flex items-center space-x-3 mb-3">
              <input
                type="radio"
                name="familyHistory"
                value={option}
                checked={healthFormData.familyHistory === option}
                onChange={handleHealthChange}
                className="form-radio text-orange-500 h-5 w-5"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
          {healthErrors.familyHistory && (
            <p className="text-red-500 text-sm mt-2">
              {healthErrors.familyHistory}
            </p>
          )}
        </div>

        {/* Significant Trauma */}
        <div className="bg-white p-6 mb-6 rounded-2xl shadow border border-purple-100">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">
            Significant Trauma
          </h3>
          {["Yes", "No", "Prefer not to say"].map((option) => (
            <label key={option} className="flex items-center space-x-3 mb-3">
              <input
                type="radio"
                name="significantTrauma"
                value={option}
                checked={healthFormData.significantTrauma === option}
                onChange={handleHealthChange}
                className="form-radio text-orange-500 h-5 w-5"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
          {healthErrors.significantTrauma && (
            <p className="text-red-500 text-sm mt-2">
              {healthErrors.significantTrauma}
            </p>
          )}
        </div>

        {/* Childhood Challenges */}
        <div className="bg-white p-6 mb-6 rounded-2xl shadow border border-purple-100">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">
            Childhood Challenges
          </h3>
          {[
            "Abuse",
            "Neglect",
            "Bullying",
            "Family conflict",
            "Unsure",
            "None",
          ].map((option) => (
            <label key={option} className="flex items-center space-x-3 mb-3">
              <input
                type="radio"
                name="childhoodChallenges"
                value={option}
                checked={healthFormData.childhoodChallenges === option}
                onChange={handleHealthChange}
                className="form-radio text-orange-500 h-5 w-5"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
          {healthErrors.childhoodChallenges && (
            <p className="text-red-500 text-sm mt-2">
              {healthErrors.childhoodChallenges}
            </p>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Back
          </button>
          <button
            type="submit"
            className="py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-violet-200 to-indigo-300 flex flex-col">
      <div className="flex-grow p-6">
        <div className="rounded-2xl p-6 bg-transparent">
          {/* Profile Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent">
                Hi, {patientData?.fullName || user?.displayName || "there"}
              </h1>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-indigo-700 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing && (
              <div className="bg-white shadow-lg rounded-2xl p-6 border border-purple-100">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent mb-6">
                  {currentStep === 1
                    ? "Personal Details"
                    : "Health Information"}
                </h2>
                {currentStep === 1 ? renderDetailForm() : renderHealthForm()}
              </div>
            )}
          </div>

          {/* Patient Info */}
          <div className="bg-white shadow-lg rounded-2xl p-4 border border-purple-100 mb-8 overflow-x-auto">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent mb-4">
              Patient Information
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-700">Email:</span>
                <span className="text-gray-700">
                  {patientData?.email || "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-700">Location:</span>
                <span className="text-gray-700">
                  {patientData?.location || "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-700">Gender:</span>
                <span className="text-gray-700">
                  {patientData?.gender || "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-700">DOB:</span>
                <span className="text-gray-700">
                  {patientData?.dob || "N/A"}
                </span>
              </div>
              {patientData?.gender === "Female" && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-purple-700">
                    Birth History:
                  </span>
                  <span className="text-gray-700">
                    {patientData?.birthHistory || "N/A"}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-700">
                  Family History:
                </span>
                <span className="text-gray-700">
                  {patientData?.familyHistory || "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-700">
                  Significant Trauma:
                </span>
                <span className="text-gray-700">
                  {patientData?.significantTrauma || "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-700">
                  Childhood Challenges:
                </span>
                <span className="text-gray-700">
                  {patientData?.childhoodChallenges || "N/A"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-purple-700">
                  Mental Health:
                </span>
                <span className="text-gray-700">
                  {patientData?.mentalHealthConditions &&
                    patientData.mentalHealthConditions.length > 0
                    ? patientData.mentalHealthConditions.join(", ")
                    : "None specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Integrating QuestionnaireResponse Component */}
          <motion.div className="mb-8">
            <motion.div className="flex justify-between items-center mb-6">
              <motion.h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent">
                Questionnaire Assessment Response Summary
              </motion.h2>
              <motion.button
                onClick={() => navigate("/start-screen")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-indigo-700 transition"
              >
                Take Questionnaire
              </motion.button>
            </motion.div>

            {/* Pass the email from the user state */}
            {user && <QuestionnaireResponses patientEmail={user.email} />}
          </motion.div>

          {/* Book Appointment Section */}
          <motion.div
            className="mb-8 p-6 bg-white rounded-2xl shadow border border-gray-200">
              {user && <PatientBookAppointment patientEmail={user.email} />}
            </motion.div>

          {/* === Treatment Plan Section === */}
          {planId && planMeta ? (
            <TreatmentPlanView
              planId={planId}
              versions={planVersions}
              versionIndex={activeVersionIndex}
              role="patient"
              patient={{
                name: patientData.fullName || user.displayName,
                email: patientData.email,
              }}
              doctor={{
                name: planMeta.doctor_name,
                email: planMeta.doctor_email,
              }}
              fetchVersion={fetchVersion}
              fetchTreatmentPlan={fetchTreatmentPlan}
              onToggleComplete={handleMarkComplete}
              onTerminate={handleTerminate}
            />
          ) : (
            <div className="my-8 p-6 bg-white rounded-2xl shadow border border-gray-200 text-center text-gray-600">
              No active treatment plan. Please wait for your doctor to create one.
            </div>
          )}

          {/* === Previous Terminated Plans Section === */}
          {patientData?.email && (
            <div className="mt-12">
              {/* === Previous Terminated Plans Section === */}
              <div className="mt-12 mb-12">
                <TerminatedTreatmentPlans patientEmail={patientData.email} fetchTreatmentPlan={fetchTreatmentPlan} fetchVersion={fetchVersion} />
              </div>
            </div>
          )}

          {/* Patient Stories Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent">
                Your Patient Stories
              </h2>
              <button
                onClick={() => navigate("/write-education")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-indigo-700 transition"
              >
                Write a Story
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-gray-500">
                Loading your stories...
              </div>
            ) : error ? (
              <div className="py-8 text-center text-red-500">{error}</div>
            ) : patientStories.length === 0 ? (
              <div className="py-8 text-center text-gray-500 bg-white rounded-2xl border border-purple-100 shadow">
                You have not shared any patient stories yet.
              </div>
            ) : (
              <div className="space-y-4">
                {patientStories.map((story) => (
                  <ListViewCard
                    key={story.id}
                    id={story.id}
                    title={story.title}
                    content={story.content || "No content available"}
                    author={story.author_name}
                    date={
                      story.date_time && story.date_time.seconds
                        ? new Date(
                          story.date_time.seconds * 1000
                        ).toLocaleDateString()
                        : "No date available"
                    }
                    tags={story.selectedTags || []}
                    link={`/stories/${story.id}`}
                    type="story"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default PatientDashboard;
