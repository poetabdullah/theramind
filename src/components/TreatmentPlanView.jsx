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
  const SERVICEID = process.env.REACT_APP_EMAILJS_SERVICEID1;
  const TEMPLATE_TERMINATED = process.env.REACT_APP_EMAILJS_TEMPLATE_TERMINATED;

  const [currentIdx, setCurrentIdx] = useState(versionIndex);
  const [data, setData] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allVersionsData, setAllVersionsData] = useState({});
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [terminationResult, setTerminationResult] = useState(null); // null | 'success' | 'error'
  const [terminationError, setTerminationError] = useState(null);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID_VIEW);
  }, []);

  // 1) Validate required props
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

  // 2) Load plan metadata
  useEffect(() => {
    async function loadPlan() {
      if (!planId || !fetchTreatmentPlan) return;
      try {
        const planData = await fetchTreatmentPlan(planId);
        setTreatmentPlan(planData);
      } catch (e) {
        console.error("Error fetching treatment plan:", e);
        setTreatmentPlan({ doctor_name: "Error", error: e.message });
      }
    }
    loadPlan();
  }, [planId, fetchTreatmentPlan]);

  // 3) Load current version
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
        const resp = await fetchVersion(planId, vid);
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

  // 4) Load all versions for overall progress
  useEffect(() => {
    async function loadAll() {
      if (!fetchVersion) return;
      if (!versions.length) return;
      const allData = {};
      for (const version of versions) {
        try {
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

  // 5) Toggle "complete" on individual actions
  const handleToggle = async ({ goalId, actionId, newStatus }) => {
    try {
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

  // 6) Confirmation "Yes → terminate" handler
  const handleConfirmTerminate = async () => {
    try {
      await onTerminate(planId);
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
          plan_link: commonParams.plan_link,
        },
        USER_ID_VIEW
      );
      await emailjs.send(
        SERVICEID,
        TEMPLATE_TERMINATED,
        {
          patient_name: doctor.name,
          doctor_email: doctor.email,
          ...commonParams,
        },
        USER_ID_VIEW
      );
      setTerminationResult("success");
    } catch (err) {
      console.error("Error terminating plan or sending emails:", err);
      setTerminationError(err.message || "Error occurred");
      setTerminationResult("error");
    }
  };

  // 7) If critical props missing
  if (Object.keys(errors).length) {
    return (
      <div className="mx-2 my-4 sm:my-8 p-4 sm:p-6 bg-red-50 rounded-2xl shadow border border-red-200">
        <h3 className="text-red-800 font-semibold mb-2 text-sm sm:text-base">
          Configuration Error
        </h3>
        <p className="text-red-700 mb-3 text-xs sm:text-sm">
          This component is missing required props (or patient/doctor):
        </p>
        <ul className="text-red-600 text-xs space-y-1 mb-4">
          {Object.values(errors).map((errMsg, idx) => (
            <li key={idx} className="break-words">
              • {errMsg}
            </li>
          ))}
        </ul>
        <div className="bg-red-100 p-3 rounded text-xs text-red-800">
          <strong>Solution:</strong> Pass valid functions and patient/doctor
          objects.
        </div>
      </div>
    );
  }

  // 8) Show loading
  if (loading) {
    return (
      <div className="mx-2 my-4 sm:my-8 p-4 sm:p-6 bg-white rounded-2xl shadow border border-purple-100 text-center text-purple-600">
        <div className="text-sm sm:text-base">Loading treatment plan...</div>
      </div>
    );
  }

  // 9) If no data
  if (!data || data.error) {
    return (
      <div className="mx-2 my-4 sm:my-8 p-4 sm:p-6 bg-yellow-50 rounded-2xl shadow border border-yellow-200 text-center">
        <div className="text-yellow-800 font-medium text-sm sm:text-base">
          No treatment plan available
        </div>
        {data?.error && (
          <div className="text-yellow-600 text-xs sm:text-sm mt-2 break-words">
            Error: {data.error}
          </div>
        )}
      </div>
    );
  }

  const isCurrent = currentIdx === versions.length - 1;

  return (
    <div className="px-2 sm:px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent">
          Treatment Plan
        </h2>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
          <span className="text-xs sm:text-sm text-gray-600 font-medium">
            Version {currentIdx + 1} of {versions.length}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={prev}
              disabled={currentIdx === 0}
              className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
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
                className="w-3 h-3 sm:w-4 sm:h-4"
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

      {/* Main Card */}
      <div className="bg-white shadow-lg rounded-2xl border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-6 border-b border-purple-100">
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 break-words">
                Created By:{" "}
                {treatmentPlan?.doctor_name || "Doctor name not available"}
              </h3>
              {treatmentPlan?.error && (
                <div className="text-red-500 text-xs mt-1 break-words">
                  {treatmentPlan.error}
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                <span className="break-words">
                  Created:{" "}
                  {data.start_date
                    ? new Date(data.start_date).toLocaleDateString()
                    : "N/A"}
                </span>
                <span className="break-words">
                  Updated:{" "}
                  {data.end_date
                    ? new Date(data.end_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">
                Current Version Progress
              </div>
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {versionProgress}%
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {data.goals?.map((goal) => (
            <div
              key={goal.id}
              className="border p-3 sm:p-5 rounded-xl bg-gray-50"
            >
              <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-start">
                <span className="w-2 h-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mr-3 mt-2 flex-shrink-0" />
                <span className="break-words">{goal.title}</span>
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
                      className={`flex flex-col gap-3 p-3 sm:p-4 rounded-lg border transition-all ${
                        done
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200 hover:border-purple-200"
                      } ${
                        showCheckbox
                          ? "sm:flex-row sm:items-center sm:justify-between"
                          : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className={`${
                            done
                              ? "line-through text-gray-500"
                              : "text-gray-800"
                          } mb-2 break-words text-sm sm:text-base`}
                        >
                          {act.description}
                        </p>
                        <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 text-xs sm:text-sm text-gray-500">
                          <span>Priority: {act.priority}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Assigned to: {act.assigned_to}</span>
                        </div>
                      </div>
                      {showCheckbox && (
                        <div className="flex justify-end sm:justify-center">
                          <button
                            onClick={() =>
                              handleToggle({
                                goalId: goal.id,
                                actionId: act.id,
                                newStatus: !done,
                              })
                            }
                            className="p-2 rounded-full transition-all hover:bg-gray-100"
                          >
                            {done ? (
                              <CheckSquare
                                size={20}
                                className="text-green-600 sm:w-6 sm:h-6"
                              />
                            ) : (
                              <Square
                                size={20}
                                className="text-gray-400 hover:text-purple-600 sm:w-6 sm:h-6"
                              />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Overall Progress */}
          <div className="border-t pt-4 sm:pt-6 space-y-3 sm:space-y-4 border-gray-200">
            <div className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0 mb-2">
              <span className="text-base sm:text-lg font-semibold text-gray-800">
                Overall Progress
              </span>
              <span className="text-base sm:text-lg font-bold text-purple-600">
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

          {/* Terminate button (doctor only) with inline confirmation above button */}
          {role === "doctor" && isCurrent && !data.is_terminated && (
            <div className="border-t pt-4 sm:pt-6 border-gray-200">
              {showConfirm && (
                <div className="mb-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                  {terminationResult === null && (
                    <>
                      <p className="text-gray-800 mb-3 text-sm sm:text-base">
                        Are you sure you want to terminate this plan?
                      </p>
                      <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-3">
                        <button
                          onClick={() => {
                            setShowConfirm(false);
                            setTerminationResult(null);
                            setTerminationError(null);
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition text-sm sm:text-base"
                        >
                          No
                        </button>
                        <button
                          onClick={handleConfirmTerminate}
                          className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm sm:text-base"
                        >
                          Yes, Terminate
                        </button>
                      </div>
                    </>
                  )}
                  {terminationResult === "success" && (
                    <>
                      <p className="text-green-700 mb-3 text-sm sm:text-base">
                        Treatment plan terminated successfully.
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setShowConfirm(false);
                            setTerminationResult(null);
                            navigate("/doctor-dashboard");
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition text-sm sm:text-base"
                        >
                          OK
                        </button>
                      </div>
                    </>
                  )}
                  {terminationResult === "error" && (
                    <>
                      <p className="text-red-700 mb-2 text-sm sm:text-base">
                        Error terminating plan
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 break-words">
                        {terminationError}
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            setShowConfirm(false);
                            setTerminationResult(null);
                            setTerminationError(null);
                          }}
                          className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition text-sm sm:text-base"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {!showConfirm && (
                <button
                  onClick={() => {
                    setShowConfirm(true);
                    setTerminationResult(null);
                    setTerminationError(null);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-3 text-white rounded-lg font-bold shadow hover:shadow-lg transition text-sm sm:text-base"
                >
                  Terminate Plan
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
