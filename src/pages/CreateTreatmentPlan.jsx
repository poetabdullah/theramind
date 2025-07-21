import React, { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import PatientSelector from "../components/PatientSelector";
import GoalEditor from "../components/GoalEditor";
import TreatmentPlanSummary from "../components/TreatmentPlanSummary";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import TreatmentTemplates from "../components/TreatmentTemplates";
import emailjs from "@emailjs/browser";
import { sendCreateOrUpdateEmail } from "../components/emailUtils";
import Footer from "../components/Footer";

// Base URL for your API (adjust if needed)
const API_BASE =
  process.env.REACT_APP_BACKEND_URL || "https://api.theramind.site/api";

// EmailJS configuration
const EMAILJS_USER_ID_CREATE = process.env.REACT_APP_EMAILJS_USER_ID_CREATE;
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID_CREATE;
const EMAILJS_TEMPLATE_CREATE = process.env.REACT_APP_EMAILJS_TEMPLATE_CREATE;
const EMAILJS_TEMPLATE_UPDATE = process.env.REACT_APP_EMAILJS_TEMPLATE_UPDATE;

const CreateTreatmentPlan = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const initialPatientEmail = location.state?.patientEmail || "";
  const planKey = location.state?.planKey ?? null;

  const [selectedPatient, setSelectedPatient] = useState(initialPatientEmail);
  const [goals, setGoals] = useState([]);
  const [originalGoals, setOriginalGoals] = useState([]); // Store original goals for comparison
  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);

  const [planId, setPlanId] = useState(null);
  const [versionId, setVersionId] = useState(null);
  const [createdAt, setCreatedAt] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState({ email: "", name: "" });
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize EmailJS when component mounts
  useEffect(() => {
    if (EMAILJS_USER_ID_CREATE) {
      emailjs.init(EMAILJS_USER_ID_CREATE);
      console.log("EmailJS init with user ID:", EMAILJS_USER_ID_CREATE);
    } else {
      console.error("EmailJS user ID for create is undefined");
    }
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setDoctor({
          email: firebaseUser.email,
          name: firebaseUser.displayName || "Dr. Unknown",
        });
        console.log("👤 User authenticated:", firebaseUser.email);
      } else {
        navigate("/login");
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch patients - memoized for performance
  const fetchPatients = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(db, "patients"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPatients(list);
      console.log("👥 Loaded patients:", list.length);
    } catch (err) {
      console.error("Error loading patients:", err);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Helper function to count words in goals
  const countWordsInGoals = useCallback((goalsList) => {
    return goalsList.reduce((total, goal) => {
      const goalWords = goal.title
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
      const actionWords = goal.actions.reduce((actionTotal, action) => {
        return (
          actionTotal +
          action.description
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length
        );
      }, 0);
      return total + goalWords + actionWords;
    }, 0);
  }, []);

  // Check if edit has significant changes (5+ word difference)
  const hasSignificantChanges = useMemo(() => {
    if (!isEditing || originalGoals.length === 0) return true;

    const originalWordCount = countWordsInGoals(originalGoals);
    const currentWordCount = countWordsInGoals(goals);
    const difference = Math.abs(currentWordCount - originalWordCount);

    console.log("Word count comparison:", {
      originalWordCount,
      currentWordCount,
      difference,
    });
    return difference >= 5;
  }, [goals, originalGoals, isEditing, countWordsInGoals]);

  // Fetch existing plan
  useEffect(() => {
    if (!selectedPatient) {
      setPlanId(null);
      setVersionId(null);
      setGoals([]);
      setOriginalGoals([]);
      setCreatedAt(null);
      setLastUpdated(null);
      setIsEditing(false);
      setFetchError(null);
      return;
    }
    if (!doctor.email) {
      return;
    }

    const fetchActivePlan = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const res = await axios.get(
          `${API_BASE}/treatment/user/patient/${encodeURIComponent(
            selectedPatient
          )}/`,
          {
            timeout: 10000, // 10 second timeout for security
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const active = Array.isArray(res.data)
          ? res.data.find((p) => p.is_terminated === false)
          : null;

        if (active) {
          // Security check - verify doctor permission
          if (active.doctor_email !== doctor.email) {
            console.warn("Doctor email mismatch, cannot edit");
            setFetchError("You do not have permission to edit this plan.");
            setIsEditing(false);
            return;
          }

          setPlanId(active.plan_id);
          setCreatedAt(active.created_at);

          const vRes = await axios.get(
            `${API_BASE}/treatment/${encodeURIComponent(
              active.plan_id
            )}/versions/`,
            {
              timeout: 10000,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!Array.isArray(vRes.data) || vRes.data.length === 0) {
            console.warn("No versions found for plan", active.plan_id);
            setGoals([]);
            setOriginalGoals([]);
            setIsEditing(false);
            return;
          }

          const last = vRes.data[vRes.data.length - 1];
          setVersionId(last.version_id);

          const fetchedGoals = last.goals.map((goal) => ({
            ...goal,
            id: goal.id || uuidv4(),
            actions: (goal.actions || []).map((action) => ({
              ...action,
              id: action.id || uuidv4(),
              priority: action.priority || 1,
              assigned_to: action.assigned_to || "patient",
              is_completed: action.is_completed || false,
            })),
          }));

          setGoals(fetchedGoals);
          setOriginalGoals(JSON.parse(JSON.stringify(fetchedGoals))); // Deep copy for comparison
          setLastUpdated(last.end_date);
          setIsEditing(true);
        } else {
          setPlanId(null);
          setVersionId(null);
          setGoals([]);
          setOriginalGoals([]);
          setCreatedAt(null);
          setLastUpdated(null);
          setIsEditing(false);
        }
      } catch (err) {
        console.error("Error fetching plan:", err);
        if (err.response?.status === 404) {
          setFetchError(null);
          setIsEditing(false);
          setGoals([]);
          setOriginalGoals([]);
          setPlanId(null);
          setVersionId(null);
        } else {
          setFetchError(
            "Unable to fetch treatment plan. Please try again later."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivePlan();
  }, [selectedPatient, doctor.email]);

  // Template prefill
  useEffect(() => {
    if (
      !authLoading &&
      doctor.email &&
      selectedPatient &&
      planKey &&
      !isEditing &&
      goals.length === 0
    ) {
      const template = TreatmentTemplates[planKey];
      if (!template) return;

      const prefilledGoals = template.goals.map((goalTemplate) => ({
        id: uuidv4(),
        title: goalTemplate.title,
        actions: goalTemplate.actions.map((act) => ({
          id: uuidv4(),
          description: act.description,
          priority: act.priority,
          assigned_to: act.assigned_to,
          is_completed: false,
        })),
      }));

      setGoals(prefilledGoals);
      setOriginalGoals([]);
      const now = new Date().toISOString();
      setCreatedAt(now);
      setLastUpdated(now);
      setPlanId(null);
      setVersionId(null);
      setIsEditing(false);
    }
  }, [
    authLoading,
    doctor.email,
    selectedPatient,
    planKey,
    isEditing,
    goals.length,
  ]);

  // Goal handlers - memoized for performance
  const addGoal = useCallback(
    () =>
      setGoals((prev) => [...prev, { id: uuidv4(), title: "", actions: [] }]),
    []
  );

  const deleteGoal = useCallback(
    (id) => setGoals((prev) => prev.filter((g) => g.id !== id)),
    []
  );

  const updateGoalTitle = useCallback(
    (id, title) =>
      setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, title } : g))),
    []
  );

  const addAction = useCallback(
    (goalId) =>
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
      ),
    []
  );

  const updateAction = useCallback(
    (goalId, actionId, field, value) =>
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
      ),
    []
  );

  const deleteAction = useCallback(
    (goalId, actionId) =>
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? { ...g, actions: g.actions.filter((a) => a.id !== actionId) }
            : g
        )
      ),
    []
  );

  // Validation with security checks
  const validateForm = useCallback(() => {
    let valid = true;
    const errs = {};

    // Input sanitization check
    if (!selectedPatient || typeof selectedPatient !== "string") {
      errs.patient = "Patient must be selected.";
      valid = false;
    }

    if (goals.length === 0) {
      errs.goals = "At least one goal is required.";
      valid = false;
    }

    if (goals.length > 20) {
      // Reasonable limit for security
      errs.goals = "Maximum 20 goals allowed.";
      valid = false;
    }

    // Check for significant changes requirement
    if (isEditing && !hasSignificantChanges) {
      errs.changes =
        "Please make at least 5 words worth of changes to update the treatment plan.";
      valid = false;
    }

    goals.forEach((goal, i) => {
      // Sanitize and validate goal title
      const sanitizedTitle = goal.title.trim();
      if (
        sanitizedTitle.split(/\s+/).filter((word) => word.length > 0).length < 5
      ) {
        errs[`goal_${i}`] = "Goal must be at least 5 words.";
        valid = false;
      }

      if (sanitizedTitle.length > 500) {
        // Character limit for security
        errs[`goal_${i}_length`] = "Goal must be less than 500 characters.";
        valid = false;
      }

      if (goal.actions.length < 1) {
        errs[`goal_actions_min_${i}`] = "Add at least one action.";
        valid = false;
      } else if (goal.actions.length > 10) {
        errs[`goal_actions_max_${i}`] = "Maximum 10 actions allowed.";
        valid = false;
      }

      goal.actions.forEach((action, j) => {
        const sanitizedDesc = action.description.trim();
        if (
          sanitizedDesc.split(/\s+/).filter((word) => word.length > 0).length <
          5
        ) {
          errs[`action_${i}_${j}`] = "Action must be at least 5 words.";
          valid = false;
        }

        if (sanitizedDesc.length > 1000) {
          // Character limit for security
          errs[`action_${i}_${j}_length`] =
            "Action must be less than 1000 characters.";
          valid = false;
        }
      });
    });

    setErrors(errs);
    return valid;
  }, [selectedPatient, goals, isEditing, hasSignificantChanges]);

  const clearForm = useCallback(() => {
    setGoals([]);
    setOriginalGoals([]);
    setErrors({});
    setSelectedPatient("");
  }, []);

  if (authLoading) return null;

  const selectedPatientData = patients.find((p) => p.email === selectedPatient);

  // Enhanced email sending function with better error handling
  const sendEmailWithRetry = async (
    templateParams,
    templateId,
    isUpdate = false
  ) => {
    console.log(
      `📧 Attempting to send ${isUpdate ? "UPDATE" : "CREATE"} email...`
    );

    // Guard env
    if (!EMAILJS_SERVICE_ID || !EMAILJS_USER_ID_CREATE) {
      console.error("EmailJS service ID or user ID is missing");
      throw new Error("EmailJS configuration missing");
    }

    // Validate required fields with security checks
    if (
      !templateParams.to_email ||
      !templateParams.patient_name ||
      !templateParams.doctor_name
    ) {
      console.error("❌ Missing required email parameters:", templateParams);
      throw new Error("Missing required email parameters");
    }

    // Validate email format for security
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(templateParams.to_email)) {
      console.error("❌ Invalid email format:", templateParams.to_email);
      throw new Error("Invalid email format");
    }

    // Sanitize template parameters
    const sanitizedParams = {
      ...templateParams,
      patient_name: templateParams.patient_name.replace(/[<>]/g, ""), // Basic XSS protection
      doctor_name: templateParams.doctor_name.replace(/[<>]/g, ""),
    };

    try {
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        templateId,
        sanitizedParams,
        EMAILJS_USER_ID_CREATE
      );
      console.log("✅ Email sent successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      if (error.status === 400) {
        throw new Error("Email configuration error. Check EmailJS settings.");
      } else if (error.status === 401) {
        throw new Error("EmailJS authentication failed. Check credentials.");
      } else if (error.status === 403) {
        throw new Error("EmailJS access denied. Check permissions.");
      } else if (error.status === 429) {
        throw new Error("EmailJS rate limit exceeded. Try later.");
      } else {
        throw new Error(`Email failed to send: ${error.message || "Unknown"}`);
      }
    }
  };

  // Main save function
  const handleSavePlan = async () => {
    console.log("💾 Starting save process...");

    if (!validateForm()) {
      console.warn("❌ Form validation failed");
      return;
    }

    // Validate patient data
    if (!selectedPatientData) {
      console.error("❌ No patient data found");
      alert("Patient data not found. Please select a valid patient.");
      return;
    }

    const now = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Sanitize goals payload
    const goalsPayload = goals.map((goal) => ({
      title: goal.title.trim(),
      actions: goal.actions.map((a) => ({
        description: a.description.trim(),
        priority: Math.max(1, Math.min(5, parseInt(a.priority) || 1)), // Ensure valid priority range
        assigned_to: a.assigned_to,
      })),
    }));

    const baseData = {
      doctor_email: doctor.email,
      doctor_name: doctor.name,
      patient_email: selectedPatient,
      goals: goalsPayload,
      created_at: createdAt || now,
      end_date: now,
    };

    console.log("📝 Saving plan data:", baseData);

    try {
      let response;
      let emailSuccess = false;
      let emailError = null;

      // Save the plan first
      if (isEditing && planId && versionId) {
        console.log("🔄 Updating existing plan...");
        response = await axios.put(
          `${API_BASE}/treatment/${encodeURIComponent(
            planId
          )}/versions/${encodeURIComponent(versionId)}/`,
          baseData,
          {
            timeout: 15000,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("✅ Plan updated successfully");
      } else {
        console.log("🆕 Creating new plan...");
        response = await axios.post(`${API_BASE}/treatment/create/`, baseData, {
          timeout: 15000,
          headers: {
            "Content-Type": "application/json",
          },
        });
        const { plan_id, version_id } = response.data;

        setPlanId(plan_id);
        setVersionId(version_id);
        setCreatedAt(baseData.created_at);
        setLastUpdated(baseData.end_date);
        setIsEditing(true);
        console.log("✅ New plan created successfully");
      }

      // Prepare email parameters
      const patientName =
        selectedPatientData.name ||
        selectedPatientData.full_name ||
        selectedPatientData.firstName ||
        "Patient";

      console.log("👤 Patient name for email:", patientName);

      // Try to send email
      try {
        const baseEmailParams = {
          to_email: selectedPatient,
          patient_name: patientName,
          doctor_name: doctor.name,
        };

        if (isEditing && planId && versionId) {
          const updateParams = {
            ...baseEmailParams,
            plan_name: `Treatment Plan #${planId}`,
            update_date: formattedDate,
            plan_link: `${window.location.origin}/patient-dashboard`,
          };

          console.log("📧 Sending UPDATE email with params:", updateParams);
          await sendEmailWithRetry(updateParams, EMAILJS_TEMPLATE_UPDATE, true);
        } else {
          const createParams = {
            ...baseEmailParams,
            creation_date: formattedDate,
            plan_link: `${window.location.origin}/patient-dashboard`,
          };

          console.log("📧 Sending CREATE email with params:", createParams);
          await sendEmailWithRetry(
            createParams,
            EMAILJS_TEMPLATE_CREATE,
            false
          );
        }

        emailSuccess = true;
        console.log("✅ Email sent successfully!");
      } catch (error) {
        console.error("📧 Email sending failed:", error);
        emailError = error.message;
      }

      // Show success message
      const successMessage = emailSuccess
        ? `Treatment plan ${
            isEditing ? "updated" : "created"
          } successfully! Email notification sent to patient.`
        : `Treatment plan ${isEditing ? "updated" : "created"} successfully! ${
            emailError
              ? `Email failed: ${emailError}`
              : "Email notification could not be sent."
          }`;

      alert(successMessage);

      // Navigate to treatment-recommendation page
      console.log("🔄 Navigating to treatment-recommendation page...");
      navigate("/treatment-recommendation", {
        state: {
          patientEmail: selectedPatient,
          planId: planId,
          success: true,
          isUpdate: isEditing,
        },
      });
    } catch (error) {
      console.error("❌ Error saving plan:", error);
      let errorMessage = "Failed to save treatment plan. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        navigate("/login");
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timed out. Please check your connection and try again.";
      }

      alert(errorMessage);
    }
  };

  // Render component
  return (
    <div>
      <div className="bg-white min-h-screen py-12 px-4 md:px-10 lg:px-20">
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-xl p-10">
          <h1 className="text-4xl font-extrabold text-orange-600 mb-4 text-center">
            {isEditing ? "Edit Treatment Plan" : "Create a New Treatment Plan"}
          </h1>

          {isEditing && createdAt && lastUpdated && (
            <div className="text-sm text-gray-600 text-center mb-6">
              <p>Created: {new Date(createdAt).toLocaleDateString()}</p>
              <p>Last Updated: {new Date(lastUpdated).toLocaleDateString()}</p>
              <p className="mt-2 text-orange-600 font-medium">
                You are editing an existing treatment plan. Any changes will
                update this plan.
              </p>
              {!hasSignificantChanges && (
                <p className="mt-2 text-red-600 font-medium">
                  Please make at least 5 words worth of changes to save the
                  update.
                </p>
              )}
            </div>
          )}

          {/* Display-only PatientSelector */}
          {selectedPatientData ? (
            <PatientSelector selectedPatientData={selectedPatientData} />
          ) : (
            <div className="mb-6 text-center text-red-500">
              No patient selected. Please go back and choose a patient.
            </div>
          )}

          {fetchError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {fetchError}
            </div>
          )}

          {/* Show validation errors */}
          {(errors.goals || errors.changes) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errors.goals && <div>{errors.goals}</div>}
              {errors.changes && <div className="mt-2">{errors.changes}</div>}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
              <p className="ml-3 text-gray-600">Processing...</p>
            </div>
          ) : (
            <>
              {goals.length > 0 && (
                <div className="mt-6 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {isEditing ? "Current Goals" : "Goals"}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {isEditing
                      ? "These are the current goals for this treatment plan. You can edit them or add new ones."
                      : "Define meaningful goals for this treatment plan."}
                  </p>
                </div>
              )}

              {goals.map((goal, idx) => (
                <GoalEditor
                  key={goal.id}
                  goal={goal}
                  goalIndex={idx}
                  updateGoalTitle={updateGoalTitle}
                  deleteGoal={deleteGoal}
                  addAction={addAction}
                  updateAction={updateAction}
                  deleteAction={deleteAction}
                  errors={errors}
                  isEditing={isEditing}
                />
              ))}

              <div className="mb-10 mt-6">
                <button
                  onClick={addGoal}
                  className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-md font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all"
                >
                  ➕ Add New Goal
                </button>
              </div>

              <TreatmentPlanSummary
                selectedPatient={selectedPatient}
                goals={goals}
                patients={patients}
                doctor={doctor}
                validateForm={validateForm}
                clearForm={clearForm}
                isEditing={isEditing}
                planId={planId}
                versionId={versionId}
                createdAt={createdAt}
                lastUpdated={lastUpdated}
                onSave={handleSavePlan}
                hasSignificantChanges={hasSignificantChanges}
                onAfterSaveEmail={({
                  isUpdate,
                  selectedPatient,
                  patientName,
                  doctorName,
                  planId,
                }) =>
                  sendCreateOrUpdateEmail({
                    isUpdate,
                    selectedPatient,
                    patientName,
                    doctorName,
                    planId,
                  })
                }
              />
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateTreatmentPlan;
