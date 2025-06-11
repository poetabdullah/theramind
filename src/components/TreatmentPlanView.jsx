// src/components/TreatmentPlanView.js

import React, { useState, useEffect, useMemo } from "react";
import { CheckSquare, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

export default function TreatmentPlanView({
  planId,
  versions = [],
  versionIndex = 0,
  role,
  fetchVersion,
  fetchTreatmentPlan,
  onToggleComplete,
  onTerminate, // parent-supplied callback to mark status in DB
  patient, // { name, email }
  doctor, // { name, email }
}) {
  const navigate = useNavigate();

  const USER_ID_VIEW = process.env.REACT_APP_EMAILJS_USER_ID_VIEW;
  const SERVICEID = process.env.REACT_APP_EMAILJS_SERVICEID;
  const TEMPLATE_TERMINATED = process.env.REACT_APP_EMAILJS_TEMPLATE_TERMINATED;

  const [currentIdx, setCurrentIdx] = useState(versionIndex);
  const [data, setData] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allVersionsData, setAllVersionsData] = useState({});
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID_VIEW);
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // 1) Validate required props
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const newErrors = {};
    if (!fetchTreatmentPlan || typeof fetchTreatmentPlan !== "function") {
      newErrors.fetchTreatmentPlan = "fetchTreatmentPlan must be a function";
    }
    if (!onToggleComplete || typeof onToggleComplete !== "function") {
      newErrors.onToggleComplete = "onToggleComplete must be a function";
    }
    if (!fetchVersion || typeof fetchVersion !== "function") {
      newErrors.fetchVersion = "fetchVersion must be a function";
    }
    if (!onTerminate || typeof onTerminate !== "function") {
      newErrors.onTerminate = "onTerminate must be a function";
    }
    if (!patient || !patient.name || !patient.email) {
      newErrors.patient = "patient prop must have { name, email }";
    }
    if (!doctor || !doctor.name || !doctor.email) {
      newErrors.doctor = "doctor prop must have { name, email }";
    }
    setErrors(newErrors);
  }, [
    fetchTreatmentPlan,
    onToggleComplete,
    fetchVersion,
    onTerminate,
    patient,
    doctor,
    planId,
  ]);

  // ─────────────────────────────────────────────────────────────────
  // 2) Load plan metadata (doctor_name, etc.)
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadPlan() {
      if (!planId || !fetchTreatmentPlan) return;
      try {
        console.log("Loading plan metadata for:", planId);
        const planData = await fetchTreatmentPlan(planId);
        console.log("Got plan data:", planData);
        setTreatmentPlan(planData);
      } catch (e) {
        console.error("Error fetching treatment plan:", e);
        setTreatmentPlan({ doctor_name: "Error", error: e.message });
      }
    }
    loadPlan();
  }, [planId, fetchTreatmentPlan]);

  // ─────────────────────────────────────────────────────────────────
  // 3) Load current version
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadVersion() {
      setLoading(true);
      const vid = versions[currentIdx]?.version_id;
      if (!vid) {
        setData(null);
        setLoading(false);
        return;
      }
      try {
        console.log("Loading version", vid, "for plan", planId);
        if (!fetchVersion) throw new Error("fetchVersion is not a function");
        const resp = await fetchVersion(planId, vid);
        console.log("Got version data:", resp);
        const versionData = { ...resp, version_id: vid };
        setData(versionData);
        setAllVersionsData((prev) => ({
          ...prev,
          [vid]: versionData,
        }));
      } catch (e) {
        console.error("Error loading version data:", e);
        setData({ error: e.message });
      } finally {
        setLoading(false);
      }
    }
    loadVersion();
  }, [currentIdx, versions, planId, fetchVersion]);

  // ─────────────────────────────────────────────────────────────────
  // 4) Load all versions for overall progress
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      if (!fetchVersion) return;
      if (!versions.length) return;
      const allData = {};
      for (const version of versions) {
        try {
          console.log("Loading (all) version", version.version_id);
          const resp = await fetchVersion(planId, version.version_id);
          allData[version.version_id] = {
            ...resp,
            version_id: version.version_id,
          };
        } catch (e) {
          console.error(`Error loading version ${version.version_id}:`, e);
        }
      }
      setAllVersionsData(allData);
    }
    loadAll();
  }, [versions, planId, fetchVersion]);

  const prev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const next = () => setCurrentIdx((i) => Math.min(versions.length - 1, i + 1));

  // ─────────────────────────────────────────────────────────────────
  // 5) Toggle “complete” on individual actions
  // ─────────────────────────────────────────────────────────────────
  const handleToggle = async ({ goalId, actionId, newStatus }) => {
    try {
      console.log("handleToggle:", { goalId, actionId, newStatus });
      if (!onToggleComplete) return;
      await onToggleComplete({ goalId, actionId, newStatus });
      setData((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          goals: prev.goals.map((g) => ({
            ...g,
            actions: g.actions.map((a) =>
              a.id === actionId ? { ...a, is_completed: newStatus } : a
            ),
          })),
        };
        setAllVersionsData((all) => ({
          ...all,
          [prev.version_id]: updated,
        }));
        return updated;
      });
    } catch (e) {
      console.error("Error toggling completion:", e);
      alert("Error updating task: " + e.message);
    }
  };

  const calculateVersionProgress = (versionData) => {
    if (!versionData?.goals) return 0;
    const weightMap = { low: 1, medium: 2, high: 3 };
    let totalWeight = 0;
    let completedWeight = 0;
    versionData.goals.forEach((g) =>
      g.actions?.forEach((a) => {
        const raw = a.priority;
        const key = typeof raw === "string" ? raw.toLowerCase() : raw;
        const w = weightMap[key] || (typeof raw === "number" ? raw : 1);
        totalWeight += w;
        if (a.is_completed) completedWeight += w;
      })
    );
    return totalWeight > 0
      ? parseFloat(((completedWeight / totalWeight) * 100).toFixed(2))
      : 0;
  };

  const versionProgress = useMemo(() => calculateVersionProgress(data), [data]);

  const overallProgress = useMemo(() => {
    if (!versions.length || !Object.keys(allVersionsData).length) return 0;
    const arr = versions
      .map((v) => {
        const vd = allVersionsData[v.version_id];
        return calculateVersionProgress(vd);
      })
      .filter((p) => !isNaN(p));
    if (!arr.length) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return parseFloat((sum / arr.length).toFixed(2));
  }, [versions, allVersionsData]);

  // ─────────────────────────────────────────────────────────────────
  // 6) Confirmation “Yes → terminate” handler
  // ─────────────────────────────────────────────────────────────────
  const handleConfirmTerminate = async () => {
    // ❹ Log the EmailJS vars so you can confirm they’re not undefined
    console.log(
      "EmailJS ServiceID:",
      process.env.REACT_APP_EMAILJS_SERVICEID,
      "TemplateID:",
      process.env.REACT_APP_EMAILJS_TEMPLATE_TERMINATED
    );

    try {
      console.log("handleConfirmTerminate: calling onTerminate(", planId, ")");
      await onTerminate(planId);
      console.log("✅ onTerminate succeeded — will now send emails");

      const commonParams = {
        plan_name: treatmentPlan?.plan_name || "Your Treatment Plan",
        doctor_name: doctor.name,
        termination_date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        plan_link: `${window.location.origin}/treatment-history/${patient.email}`,
      };

      console.log("Sending EmailJS to patient:", {
        ...commonParams,
        patient_name: patient.name,
        to_email: patient.email,
      });
      await emailjs.send(
        SERVICEID,
        TEMPLATE_TERMINATED,
        {
          patient_name: patient.name,
          patient_email: patient.email,
          doctor_name: doctor.name,
          doctor_email: doctor.email,
          plan_name: treatmentPlan?.plan_name,
          termination_date: formattedDate,
          plan_link: `${window.location.origin}/treatment-history/${patient.email}`,
        },
        USER_ID_VIEW
      );

      console.log("✅ Email to patient sent");

      console.log("Sending EmailJS to doctor:", {
        ...commonParams,
        patient_name: doctor.name, // name insertion
        doctor_email: doctor.email, // MUST match {{doctor_email}} in the template’s “To”
      });

      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICEID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_TERMINATED,
        {
          ...commonParams,
          patient_name: doctor.name, // or “doctor_name” – whatever variable your HTML uses
          doctor_email: doctor.email, // ← this lines up with {{doctor_email}} in the template’s To
        }
      );
      console.log("✅ Email to doctor sent");

      alert("Treatment plan is terminated");
      navigate("/doctor-dashboard");
    } catch (err) {
      console.error("Error terminating plan or sending emails:", err);
      alert("Could not terminate plan. Please try again.");
      setShowConfirm(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // 7) If critical props are missing, show an error block
  // ─────────────────────────────────────────────────────────────────
  if (Object.keys(errors).length) {
    return (
      <div className="my-8 p-6 bg-red-50 rounded-2xl shadow border border-red-200">
        <h3 className="text-red-800 font-semibold mb-2">Configuration Error</h3>
        <p className="text-red-700 mb-3">
          This component is missing required props (or patient/doctor):
        </p>
        <ul className="text-red-600 text-sm space-y-1 mb-4">
          {Object.values(errors).map((errMsg, idx) => (
            <li key={idx}>• {errMsg}</li>
          ))}
        </ul>
        <div className="bg-red-100 p-3 rounded text-sm text-red-800">
          <strong>Solution:</strong> Pass valid functions and patient/doctor
          objects.
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // 8) Show loading state
  // ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="my-8 p-6 bg-white rounded-2xl shadow border border-purple-100 text-center text-purple-600">
        Loading treatment plan...
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // 9) If no data or error
  // ─────────────────────────────────────────────────────────────────
  if (!data || data.error) {
    return (
      <div className="my-8 p-6 bg-yellow-50 rounded-2xl shadow border border-yellow-200 text-center">
        <div className="text-yellow-800 font-medium">
          No treatment plan available
        </div>
        {data?.error && (
          <div className="text-yellow-600 text-sm mt-2">
            Error: {data.error}
          </div>
        )}
      </div>
    );
  }

  const isCurrent = currentIdx === versions.length - 1;

  return (
    <div className="mb-8 relative">
      {/* 10) Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Are you sure you want to terminate this plan?
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
              >
                No
              </button>
              <button
                onClick={handleConfirmTerminate}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                Yes, Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11) Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent">
          Treatment Plan
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 font-medium">
            Version {currentIdx + 1} of {versions.length}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={prev}
              disabled={currentIdx === 0}
              className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={next}
              disabled={currentIdx === versions.length - 1}
              className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 12) Main Card */}
      <div className="bg-white shadow-lg rounded-2xl border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Created By:{" "}
                {treatmentPlan?.doctor_name || "Doctor name not available"}
              </h3>
              {treatmentPlan?.error && (
                <div className="text-red-500 text-xs mt-1">
                  {treatmentPlan.error}
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                <span>
                  Created:{" "}
                  {data.start_date
                    ? new Date(data.start_date).toLocaleDateString()
                    : "N/A"}
                </span>
                <span>
                  Updated:{" "}
                  {data.end_date
                    ? new Date(data.end_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">
                Current Version Progress
              </div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {versionProgress}%
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {data.goals?.map((goal) => (
            <div key={goal.id} className="border p-5 rounded-xl bg-gray-50">
              <h4 className="text-xl font-semibold mb-4 flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mr-3" />
                {goal.title}
              </h4>
              <div className="space-y-3">
                {goal.actions?.map((act) => {
                  const done = act.is_completed;
                  const showCheckbox =
                    isCurrent &&
                    ((role === "patient" && act.assigned_to === "patient") ||
                      (role === "doctor" && act.assigned_to === "doctor"));

                  return (
                    <div
                      key={act.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        done
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <div className="flex-1">
                        <p
                          className={`${
                            done
                              ? "line-through text-gray-500"
                              : "text-gray-800"
                          } mb-1`}
                        >
                          {act.description}
                        </p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span>Priority: {act.priority}</span>
                          <span>•</span>
                          <span>Assigned to: {act.assigned_to}</span>
                        </div>
                      </div>
                      {showCheckbox && (
                        <button
                          onClick={() =>
                            handleToggle({
                              goalId: goal.id,
                              actionId: act.id,
                              newStatus: !done,
                            })
                          }
                          className="ml-4 p-2 rounded-full transition-all hover:bg-gray-100"
                        >
                          {done ? (
                            <CheckSquare size={24} className="text-green-600" />
                          ) : (
                            <Square
                              size={24}
                              className="text-gray-400 hover:text-purple-600"
                            />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 13) Overall Progress */}
          <div className="border-t pt-6 space-y-4 border-gray-200">
            <div className="flex justify-between mb-2">
              <span className="text-lg font-semibold text-gray-800">
                Overall Progress
              </span>
              <span className="text-lg font-bold text-purple-600">
                {overallProgress}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* 14) Terminate button (doctor only) */}
          {role === "doctor" && isCurrent && !data.is_terminated && (
            <div className="border-t pt-6 border-gray-200">
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3 text-white rounded-lg font-bold shadow hover:shadow-lg transition"
              >
                Terminate Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
