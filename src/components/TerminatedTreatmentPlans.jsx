import React, { useState, useEffect, useCallback, useMemo } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import axios from "axios";
import LoadingPlaceholder from "./LoadingPlaceholder";

// Base URL for your API
const API_BASE =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

/**
 * Read-only view for terminated treatment plans for a patient.
 * Props:
 *  - patientEmail: string (required)
 *  - fetchTreatmentPlan (optional)
 *  - fetchVersion (optional)
 *
 * Renders each plan in a collapsible white card: click header to expand/collapse details.
 */
export default function TerminatedTreatmentPlans({
  patientEmail,
  fetchTreatmentPlan,
  fetchVersion,
}) {
  const [plansMeta, setPlansMeta] = useState([]);
  const [plansData, setPlansData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlanInfo = useCallback(
    async (planId) => {
      if (fetchTreatmentPlan) return fetchTreatmentPlan(planId);
      const res = await axios.get(
        `${API_BASE}/treatment/${encodeURIComponent(planId)}/`
      );
      return res.data;
    },
    [fetchTreatmentPlan]
  );

  const fetchPlanVersion = useCallback(
    async (planId, versionId) => {
      if (fetchVersion) return fetchVersion(planId, versionId);
      const res = await axios.get(
        `${API_BASE}/treatment/${encodeURIComponent(
          planId
        )}/version/${encodeURIComponent(versionId)}/`
      );
      return res.data;
    },
    [fetchVersion]
  );

  useEffect(() => {
    if (!patientEmail) {
      setPlansMeta([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const q = query(
          collection(db, "treatment_plans"),
          where("patient_email", "==", patientEmail),
          where("is_terminated", "==", true)
        );
        const snap = await getDocs(q);
        const metas = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          metas.push({ ...data, plan_id: docSnap.id });
        });
        if (metas.length === 0) {
          setPlansMeta([]);
          setLoading(false);
          return;
        }
        metas.sort(
          (a, b) =>
            new Date(b.termination_date).getTime() -
            new Date(a.termination_date).getTime()
        );
        setPlansMeta(metas);

        const tmp = {};
        await Promise.all(
          metas.map(async (meta) => {
            const pid = meta.plan_id;
            try {
              const vRes = await axios.get(
                `${API_BASE}/treatment/${encodeURIComponent(pid)}/versions/`
              );
              tmp[pid] = { versions: vRes.data || [], allVersionsData: {} };
            } catch (e) {
              console.error(`Error fetching versions for plan ${pid}:`, e);
              tmp[pid] = { versions: [], allVersionsData: {} };
            }
          })
        );
        setPlansData(tmp);
      } catch (e) {
        console.error("Error fetching terminated plans:", e);
        setError("Failed to load previous treatment plans.");
      } finally {
        setLoading(false);
      }
    })();
  }, [patientEmail]);

  useEffect(() => {
    Object.entries(plansData).forEach(
      ([planId, { versions, allVersionsData }]) => {
        if (
          versions.length > 0 &&
          Object.keys(allVersionsData).length < versions.length
        ) {
          (async () => {
            const newAll = { ...allVersionsData };
            await Promise.all(
              versions.map(async (v) => {
                const vid = v.version_id;
                if (!(vid in newAll)) {
                  try {
                    const resp = await fetchPlanVersion(planId, vid);
                    newAll[vid] = { ...resp, version_id: vid };
                  } catch (e) {
                    console.error(
                      `Error loading version ${vid} for plan ${planId}:`,
                      e
                    );
                  }
                }
              })
            );
            setPlansData((prev) => ({
              ...prev,
              [planId]: { versions, allVersionsData: newAll },
            }));
          })();
        }
      }
    );
  }, [plansData, fetchPlanVersion]);

  const calculateVersionProgress = useCallback((versionData) => {
    if (!versionData?.goals) return 0;
    const weightMap = { low: 1, medium: 2, high: 3 };
    let total = 0,
      completed = 0;
    versionData.goals.forEach((g) =>
      g.actions?.forEach((a) => {
        const raw = a.priority;
        const key = typeof raw === "string" ? raw.toLowerCase() : raw;
        const w = weightMap[key] || (typeof raw === "number" ? raw : 1);
        total += w;
        if (a.is_completed) completed += w;
      })
    );
    return total > 0 ? parseFloat(((completed / total) * 100).toFixed(2)) : 0;
  }, []);

  const PlanCard = ({ meta, versions = [], allVersionsData = {}, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentIdx, setCurrentIdx] = useState(() => versions.length - 1);

    useEffect(() => {
      setCurrentIdx(versions.length > 0 ? versions.length - 1 : 0);
    }, [versions]);

    const versionId = versions[currentIdx]?.version_id;
    const data = versionId ? allVersionsData[versionId] : null;

    const goPrev = () => setCurrentIdx((i) => Math.max(0, i - 1));
    const goNext = () =>
      setCurrentIdx((i) => Math.min(versions.length - 1, i + 1));
    const toggleExpand = () => setIsExpanded((prev) => !prev);

    const versionProgress = useMemo(
      () => calculateVersionProgress(data),
      [data, calculateVersionProgress]
    );
    const overallProgress = useMemo(() => {
      if (!versions.length) return 0;
      const arr = versions
        .map((v) => calculateVersionProgress(allVersionsData[v.version_id]))
        .filter((p) => !isNaN(p));
      if (!arr.length) return 0;
      const sum = arr.reduce((a, b) => a + b, 0);
      return parseFloat((sum / arr.length).toFixed(2));
    }, [versions, allVersionsData, calculateVersionProgress]);

    const [planInfo, setPlanInfo] = useState(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        try {
          const pi = await fetchPlanInfo(meta.plan_id);
          if (!cancelled) setPlanInfo(pi);
        } catch (e) {
          console.error("Error fetching plan metadata:", e);
          if (!cancelled) setPlanInfo({ plan_name: "Error", error: e.message });
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [meta.plan_id]);

    const lastUpdatedDisplay = useMemo(() => {
      if (data?.end_date) return new Date(data.end_date).toLocaleDateString();
      return "N/A";
    }, [data]);

    return (
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow">
          <button
            onClick={toggleExpand}
            className="w-full flex justify-between items-center p-4 focus:outline-none"
          >
            <h3 className="text-lg font-semibold text-violet-800">
              Plan {index + 1}:{" "}
              {planInfo?.plan_name || meta.plan_name || meta.plan_id}
            </h3>
            <span className="text-sm text-gray-600 flex items-center">
              Last Updated: {lastUpdatedDisplay}
              <span className="ml-2">{isExpanded ? "▲" : "▼"}</span>
            </span>
          </button>
          {isExpanded && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  Version {currentIdx + 1} of {versions.length}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={goPrev}
                    disabled={currentIdx <= 0}
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
                    onClick={goNext}
                    disabled={currentIdx >= versions.length - 1}
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
              <div className="bg-white shadow-lg rounded-2xl border border-purple-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Created By:{" "}
                        {planInfo?.doctor_name || meta.doctor_name || "Doctor"}
                      </h3>
                      {planInfo?.error && (
                        <div className="text-red-500 text-xs mt-1">
                          {planInfo.error}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                        <span>
                          Created:{" "}
                          {data?.start_date
                            ? new Date(data.start_date).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <span>Last Updated: {lastUpdatedDisplay}</span>
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
                  {data?.goals?.map((goal) => (
                    <div
                      key={goal.id}
                      className="border p-5 rounded-xl bg-gray-50"
                    >
                      <h4 className="text-xl font-semibold mb-4 flex items-center">
                        <span className="w-2 h-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mr-3" />
                        {goal.title}
                      </h4>
                      <div className="space-y-3">
                        {goal.actions?.map((act) => {
                          const done = act.is_completed;
                          return (
                            <div
                              key={act.id}
                              className={`flex items-center justify-between p-4 rounded-lg border ${
                                done
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-gray-200"
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
                            </div>
                          );
                        })}
                        <div className="border-t pt-6 space-y-4 border-gray-200 mt-6">
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) return <LoadingPlaceholder />;

  if (error) {
    return <div className="py-8 text-center text-red-600">{error}</div>;
  }
  if (!plansMeta.length) {
    return null;
  }
  return (
    <div>
      <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent mb-4">
        Previous Treatment Plans
      </h2>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {plansMeta.map((meta, index) => (
        <PlanCard
          key={meta.plan_id}
          meta={meta}
          index={index}
          versions={plansData[meta.plan_id]?.versions}
          allVersionsData={plansData[meta.plan_id]?.allVersionsData}
        />
      ))}
    </div>
  );
}
