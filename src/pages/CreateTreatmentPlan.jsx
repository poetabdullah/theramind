import React, { useState, useEffect } from "react";
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
import emailjs from "emailjs-com";

// Base URL for your API (adjust if needed)
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// EmailJS hard-coded configuration
const EMAILJS_USER_ID = "UPRSrucfSWrdfXl6E";
const EMAILJS_SERVICE_ID = "service_wj928rn";
const EMAILJS_TEMPLATE_CREATE = "template_qe6yy7a";
const EMAILJS_TEMPLATE_UPDATE = "template_sgkpbvk";

const CreateTreatmentPlan = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ———————————————————————————
  // 1) Grab initial patient email + planKey from location.state
  // ———————————————————————————
  const initialPatientEmail = location.state?.patientEmail || "";
  const planKey = location.state?.planKey ?? null;

  // ———————————————————————————
  // 2) Component state
  // ———————————————————————————
  const [selectedPatient, setSelectedPatient] = useState(initialPatientEmail);
  const [goals, setGoals] = useState([]);
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

  // Initialize EmailJS with hard-coded User ID
  useEffect(() => {
    emailjs.init(EMAILJS_USER_ID);
  }, []);

  // ———————————————————————————
  // 3) Auth listener → set user and doctor
  // ———————————————————————————
  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setDoctor({
          email: firebaseUser.email,
          name: firebaseUser.displayName || "Dr. Unknown",
        });
      } else {
        navigate("/login");
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // ———————————————————————————
  // 4) Fetch patient list from Firestore
  // ———————————————————————————
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const snapshot = await getDocs(collection(db, "patients"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPatients(list);
      } catch (err) {
        console.error("Error loading patients:", err);
      }
    };
    fetchPatients();
  }, []);

  // ———————————————————————————
  // 5) Fetch existing active plan whenever selectedPatient or doctor.email changes
  // ———————————————————————————
  useEffect(() => {
    if (!selectedPatient) {
      setPlanId(null);
      setVersionId(null);
      setGoals([]);
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
          )}/`
        );
        const active = Array.isArray(res.data)
          ? res.data.find((p) => p.is_terminated === false)
          : null;

        if (active) {
          if (active.doctor_email !== doctor.email) {
            console.warn("Doctor email mismatch, cannot edit");
            setFetchError("You do not have permission to edit this plan.");
            setIsEditing(false);
            return;
          }

          setPlanId(active.plan_id);
          setCreatedAt(active.created_at);

          // Load versions
          const vRes = await axios.get(
            `${API_BASE}/treatment/${encodeURIComponent(
              active.plan_id
            )}/versions/`
          );
          if (!Array.isArray(vRes.data) || vRes.data.length === 0) {
            console.warn("No versions found for plan", active.plan_id);
            setGoals([]);
            setIsEditing(false);
            return;
          }

          // Use last version
          const last = vRes.data[vRes.data.length - 1];
          setVersionId(last.version_id);

          // Normalize goal/action objects
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
          setLastUpdated(last.end_date);
          setIsEditing(true);
        } else {
          // No active plan → “create” mode
          setPlanId(null);
          setVersionId(null);
          setGoals([]);
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

  // ———————————————————————————
  // 6) If no existing plan AND planKey exists → prefill from a template
  // ———————————————————————————
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

  if (authLoading) return null; // wait until auth check completes

  // ———————————————————————————
  // 7) Find the “selectedPatientData” so we know their name and email
  // ———————————————————————————
  const selectedPatientData = patients.find((p) => p.email === selectedPatient);

  // ———————————————————————————
  // 8) Goal & Action handlers (unchanged)
  // ———————————————————————————
  const addGoal = () =>
    setGoals((prev) => [...prev, { id: uuidv4(), title: "", actions: [] }]);
  const deleteGoal = (id) =>
    setGoals((prev) => prev.filter((g) => g.id !== id));
  const updateGoalTitle = (id, title) =>
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, title } : g)));
  const addAction = (goalId) =>
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
  const updateAction = (goalId, actionId, field, value) =>
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
  const deleteAction = (goalId, actionId) =>
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, actions: g.actions.filter((a) => a.id !== actionId) }
          : g
      )
    );

  // ———————————————————————————
  // validateForm() (unchanged)
  // ———————————————————————————
  const validateForm = () => {
    let valid = true;
    const errs = {};
    if (!selectedPatient) {
      errs.patient = "Patient must be selected.";
      valid = false;
    }
    if (goals.length === 0) {
      errs.goals = "At least one goal is required.";
      valid = false;
    }
    goals.forEach((goal, i) => {
      if (goal.title.trim().split(" ").length < 5) {
        errs[`goal_${i}`] = "Goal must be at least 5 words.";
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
        if (action.description.trim().split(" ").length < 5) {
          errs[`action_${i}_${j}`] = "Action must be at least 5 words.";
          valid = false;
        }
      });
    });
    setErrors(errs);
    return valid;
  };

  const clearForm = () => {
    setGoals([]);
    setErrors({});
    setSelectedPatient("");
  };

  // ———————————————————————————
  // 9) handleSavePlan() → create vs update logic + EmailJS calls
  // ———————————————————————————
  // Fixed handleSavePlan function with proper EmailJS integration
  const handleSavePlan = async () => {
    console.log(">>> handleSavePlan() called");
    if (!validateForm()) {
      console.warn(">>> Validation failed, errors:", errors);
      return;
    }

    const now = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const goalsPayload = goals.map((goal) => ({
      title: goal.title,
      actions: goal.actions.map((a) => ({
        description: a.description,
        priority: a.priority,
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

    try {
      let response;
      let emailSuccess = false;

      if (isEditing && planId && versionId) {
        // ----------------------------
        // UPDATE existing plan
        // ----------------------------
        response = await axios.put(
          `${API_BASE}/treatment/${encodeURIComponent(
            planId
          )}/versions/${encodeURIComponent(versionId)}/`,
          baseData
        );
        console.log("Plan updated:", response.data);

        // Send UPDATE email to patient
        const updateTemplateParams = {
          to_email: selectedPatient,
          patient_name:
            selectedPatientData?.name ||
            selectedPatientData?.full_name ||
            "Patient",
          plan_name: `Treatment Plan #${planId}`,
          doctor_name: doctor.name,
          update_date: formattedDate,
          plan_link: `${window.location.origin}/patient-dashboard`, // Adjust this URL as needed
        };

        console.log("Sending UPDATE email with params:", updateTemplateParams);

        try {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_UPDATE,
            updateTemplateParams
          );
          console.log("✅ Update email sent successfully");
          emailSuccess = true;
        } catch (emailError) {
          console.error("❌ Failed to send update email:", emailError);
        }
      } else {
        // ----------------------------
        // CREATE new plan
        // ----------------------------
        response = await axios.post(`${API_BASE}/treatment/create/`, baseData);
        const { plan_id, version_id } = response.data;

        setPlanId(plan_id);
        setVersionId(version_id);
        setCreatedAt(baseData.created_at);
        setLastUpdated(baseData.end_date);
        setIsEditing(true);

        console.log("New plan created:", response.data);

        // Send CREATE email to patient
        const createTemplateParams = {
          to_email: selectedPatient,
          patient_name:
            selectedPatientData?.name ||
            selectedPatientData?.full_name ||
            "Patient",
          doctor_name: doctor.name,
          creation_date: formattedDate,
          plan_link: `${window.location.origin}/patient-dashboard`, // Adjust this URL as needed
        };

        console.log("Sending CREATE email with params:", createTemplateParams);

        try {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_CREATE,
            createTemplateParams
          );
          console.log("✅ Create email sent successfully");
          emailSuccess = true;
        } catch (emailError) {
          console.error("❌ Failed to send create email:", emailError);
        }
      }

      // Show appropriate success/error message
      if (emailSuccess) {
        alert("Treatment plan saved and email sent successfully!");
      } else {
        alert(
          "Treatment plan saved, but email failed to send. Please check your EmailJS configuration."
        );
      }
    } catch (error) {
      console.error("Error saving treatment plan:", error);
      alert(
        "Failed to save treatment plan: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const sendEmail = async (serviceId, templateId, templateParams) => {
    if (!serviceId || !templateId) {
      console.error("EmailJS configuration missing!");
      return;
    }

    console.log("Sending email with params:", {
      serviceId,
      templateId,
      templateParams,
    });

    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );
      console.log("Email sent successfully:", response);
      return response;
    } catch (error) {
      console.error("Email failed to send:", {
        status: error.status,
        text: error.text,
        details: error,
      });
      throw error;
    }
  };

  // ———————————————————————————
  // RENDER
  // ———————————————————————————
  return (
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

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            <p className="ml-3 text-gray-600">Processing...</p>
          </div>
        ) : (
          <>
            {errors.goals && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {errors.goals}
              </div>
            )}

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
              onSavePlan={handleSavePlan}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CreateTreatmentPlan;
