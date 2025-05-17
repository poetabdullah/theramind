import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import PatientSelector from "../components/PatientSelector";
import GoalEditor from "../components/GoalEditor";
import TreatmentPlanSummary from "../components/TreatmentPlanSummary";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const CreateTreatmentPlan = () => {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [goals, setGoals] = useState([]);
  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate("/login");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const doctor = user
    ? { email: user.email, name: user.displayName || "Doctor" }
    : {};

  if (authLoading) return null;

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

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!selectedPatient) {
      newErrors.patient = "Patient must be selected.";
      isValid = false;
    }

    goals.forEach((goal, goalIndex) => {
      if (!goal.title || goal.title.trim().split(" ").length < 5) {
        newErrors[`goal_${goalIndex}`] = "Goal must be at least 5 words.";
        isValid = false;
      }

      if (goal.actions.length < 1) {
        newErrors[`goal_actions_min_${goalIndex}`] = "Add at least one action.";
        isValid = false;
      } else if (goal.actions.length > 10) {
        newErrors[`goal_actions_max_${goalIndex}`] =
          "Maximum 10 actions allowed.";
        isValid = false;
      }

      goal.actions.forEach((action, actionIndex) => {
        if (
          !action.description ||
          action.description.trim().split(" ").length < 5
        ) {
          newErrors[`action_${goalIndex}_${actionIndex}`] =
            "Action must be at least 5 words.";
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const clearForm = () => {
    setSelectedPatient("");
    setGoals([]);
    setErrors({});
  };

  return (
    <div className="bg-white min-h-screen py-12 px-4 md:px-10 lg:px-20">
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-extrabold text-orange-600 mb-10 text-center">
          Create a New Treatment Plan
        </h1>

        <PatientSelector
          selectedPatient={selectedPatient}
          setSelectedPatient={setSelectedPatient}
          error={errors.patient}
        />

        {goals.map((goal, index) => (
          <GoalEditor
            key={goal.id}
            goal={goal}
            goalIndex={index}
            updateGoalTitle={updateGoalTitle}
            deleteGoal={deleteGoal}
            addAction={addAction}
            updateAction={updateAction}
            deleteAction={deleteAction}
            errors={errors}
          />
        ))}

        <div className="mb-10">
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
        />
      </div>
    </div>
  );
};

export default CreateTreatmentPlan;
