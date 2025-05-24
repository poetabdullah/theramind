import React, { useState, useEffect, useMemo } from "react";
import { CheckSquare, Square } from "lucide-react";

export default function TreatmentPlanView({
  planId,
  versions = [],
  versionIndex = 0,
  role,
  fetchVersion,
  fetchTreatmentPlan,
  onToggleComplete,
  onTerminate,
}) {
  const [currentIdx, setCurrentIdx] = useState(versionIndex);
  const [data, setData] = useState(null);
  const [treatmentPlan, setTreatmentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allVersionsData, setAllVersionsData] = useState({});
  const [errors, setErrors] = useState({});

  // Validate required props and log detailed information
  useEffect(() => {
    const newErrors = {};

    console.log("TreatmentPlanView Props Validation:");
    console.log(
      "- fetchTreatmentPlan:",
      typeof fetchTreatmentPlan,
      fetchTreatmentPlan
    );
    console.log(
      "- onToggleComplete:",
      typeof onToggleComplete,
      onToggleComplete
    );
    console.log("- fetchVersion:", typeof fetchVersion, fetchVersion);
    console.log("- planId:", planId);

    if (!fetchTreatmentPlan || typeof fetchTreatmentPlan !== "function") {
      newErrors.fetchTreatmentPlan = "fetchTreatmentPlan must be a function";
      console.error("fetchTreatmentPlan is missing or not a function");
    }
    if (!onToggleComplete || typeof onToggleComplete !== "function") {
      newErrors.onToggleComplete = "onToggleComplete must be a function";
      console.error("onToggleComplete is missing or not a function");
    }
    if (!fetchVersion || typeof fetchVersion !== "function") {
      newErrors.fetchVersion = "fetchVersion must be a function";
      console.error("fetchVersion is missing or not a function");
    }

    setErrors(newErrors);
  }, [fetchTreatmentPlan, onToggleComplete, fetchVersion, planId]);

  // Load treatment plan details (including doctor_name)
  useEffect(() => {
    async function loadTreatmentPlan() {
      if (!planId) {
        console.warn("No planId provided");
        return;
      }

      try {
        if (!fetchTreatmentPlan || typeof fetchTreatmentPlan !== "function") {
          console.error(
            "Cannot load treatment plan: fetchTreatmentPlan is not a function"
          );
          setTreatmentPlan({
            doctor_name: "Error: Missing function",
            error: "fetchTreatmentPlan not provided",
          });
          return;
        }

        console.log("Loading treatment plan for planId:", planId);
        const planData = await fetchTreatmentPlan(planId);
        console.log("Treatment plan loaded:", planData);
        setTreatmentPlan(planData);
      } catch (e) {
        console.error("Error fetching treatment plan:", e);
        setTreatmentPlan({
          doctor_name: "Error loading doctor",
          error: e.message,
        });
      }
    }

    loadTreatmentPlan();
  }, [planId, fetchTreatmentPlan]);

  // Load current version data
  useEffect(() => {
    async function load() {
      setLoading(true);
      const vid = versions[currentIdx]?.version_id;

      if (!vid) {
        console.log("No version ID found for index:", currentIdx);
        setData(null);
        setLoading(false);
        return;
      }

      try {
        if (!fetchVersion || typeof fetchVersion !== "function") {
          throw new Error("fetchVersion is not a function");
        }

        console.log(
          "Loading version data for planId:",
          planId,
          "versionId:",
          vid
        );
        const resp = await fetchVersion(planId, vid);
        const versionData = { ...resp, version_id: vid };
        setData(versionData);

        // Store this version's data for overall progress calculation
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

    load();
  }, [currentIdx, versions, planId, fetchVersion]);

  // Load all versions data for overall progress calculation
  useEffect(() => {
    async function loadAllVersions() {
      if (!fetchVersion || typeof fetchVersion !== "function") {
        console.error(
          "Cannot load all versions: fetchVersion is not a function"
        );
        return;
      }

      if (versions.length === 0) {
        console.log("No versions to load");
        return;
      }

      console.log("Loading all versions data for", versions.length, "versions");
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

    loadAllVersions();
  }, [versions, planId, fetchVersion]);

  const prev = () => setCurrentIdx((i) => Math.max(0, i - 1));
  const next = () => setCurrentIdx((i) => Math.min(versions.length - 1, i + 1));

  const handleToggle = async ({ goalId, actionId, newStatus }) => {
    try {
      if (!onToggleComplete || typeof onToggleComplete !== "function") {
        console.error("Cannot toggle: onToggleComplete is not a function");
        alert("Error: Toggle function not available");
        return;
      }

      console.log("Toggling action:", { goalId, actionId, newStatus });
      await onToggleComplete({ goalId, actionId, newStatus });

      setData((prev) => {
        if (!prev) return prev;
        const updatedData = {
          ...prev,
          goals: prev.goals.map((g) => ({
            ...g,
            actions: g.actions.map((a) =>
              a.id === actionId ? { ...a, is_completed: newStatus } : a
            ),
          })),
        };

        // Update the stored version data for overall progress calculation
        setAllVersionsData((prevAll) => ({
          ...prevAll,
          [prev.version_id]: updatedData,
        }));

        return updatedData;
      });
    } catch (e) {
      console.error("Error toggling completion:", e);
      alert("Error updating task: " + e.message);
    }
  };

  // Calculate progress for a specific version (weighted by priority)
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

  // Calculate current version progress
  const versionProgress = useMemo(() => {
    return calculateVersionProgress(data);
  }, [data]);

  // Calculate overall progress: average of all version progresses
  const overallProgress = useMemo(() => {
    if (!versions.length || Object.keys(allVersionsData).length === 0) return 0;

    const progresses = versions
      .map((version) => {
        const versionData = allVersionsData[version.version_id];
        return calculateVersionProgress(versionData);
      })
      .filter((progress) => !isNaN(progress));

    if (progresses.length === 0) return 0;

    const sum = progresses.reduce((a, b) => a + b, 0);
    return parseFloat((sum / progresses.length).toFixed(2));
  }, [versions, allVersionsData]);

  // Show errors if critical functions are missing
  if (Object.keys(errors).length > 0) {
    return (
      <div className="my-8 p-6 bg-red-50 rounded-2xl shadow border border-red-200">
        <h3 className="text-red-800 font-semibold mb-2">Configuration Error</h3>
        <p className="text-red-700 mb-3">
          The TreatmentPlanView component is missing required function props:
        </p>
        <ul className="text-red-600 text-sm space-y-1 mb-4">
          {Object.values(errors).map((error, idx) => (
            <li key={idx}>• {error}</li>
          ))}
        </ul>
        <div className="bg-red-100 p-3 rounded text-sm text-red-800">
          <strong>Solution:</strong> Make sure the parent component passes valid
          functions for:
          <br />• fetchTreatmentPlan
          <br />• onToggleComplete
          <br />• fetchVersion
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-8 p-6 bg-white rounded-2xl shadow border border-purple-100 text-center text-purple-600">
        Loading treatment plan...
      </div>
    );
  }

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
    <div className="mb-8">
      {/* Header */}
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

      {/* Main Card */}
      <div className="bg-white shadow-lg rounded-2xl border border-purple-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
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
                    role === "patient" &&
                    act.assigned_to === "patient" &&
                    isCurrent;

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

          {/* Overall Progress */}
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

          {role === "doctor" &&
            isCurrent &&
            !data.is_terminated &&
            onTerminate && (
              <div className="border-t pt-6 border-gray-200">
                <button
                  onClick={onTerminate}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 py-3 text-white rounded-lg font-semibold shadow hover:shadow-lg transition"
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
