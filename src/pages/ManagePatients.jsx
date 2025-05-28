import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import TreatmentPlanView from "../components/TreatmentPlanView";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import CreateTreatmentCTA from "../components/CreateTreatmentCTA";

// Base URL for your API
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export default function ManagePatients() {
  const [doctorEmail, setDoctorEmail] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPatientEmail, setSelectedPatientEmail] = useState("");
  const [planMeta, setPlanMeta] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Track which version index to display (reset when versions change)
  const [versionIndex, setVersionIndex] = useState(0);

  // Reset versionIndex whenever versions update
  useEffect(() => {
    setVersionIndex(versions.length - 1);
  }, [versions]);
  const containerRef = useRef(null);

  // Capture doctor email
  useEffect(
    () =>
      auth.onAuthStateChanged((user) => setDoctorEmail(user?.email || null)),
    []
  );

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load patients from Firestore
  useEffect(() => {
    if (!doctorEmail) return;
    (async () => {
      const q = query(
        collection(db, "treatment_plans"),
        where("doctor_email", "==", doctorEmail),
        where("is_terminated", "==", false)
      );
      const snapshot = await getDocs(q);
      const map = {};
      snapshot.forEach((docSnap) => {
        const { patient_email, patient_name } = docSnap.data();
        map[patient_email] = patient_name;
      });
      setPatients(
        Object.entries(map).map(([email, name]) => ({
          patient_email: email,
          patient_name: name,
        }))
      );
    })();
  }, [doctorEmail]);

  const filtered = useMemo(
    () =>
      patients.filter((p) =>
        p.patient_name.toLowerCase().includes(filter.toLowerCase())
      ),
    [patients, filter]
  );

  // Select patient
  const handleSelect = (email) => {
    setSelectedPatientEmail(email);
    setDropdownOpen(false);
  };

  // Load plan and versions
  useEffect(() => {
    if (!doctorEmail || !selectedPatientEmail) {
      setPlanMeta(null);
      setVersions([]);
      return;
    }

    setLoadingPlan(true); // start loading
    (async () => {
      try {
        const q = query(
          collection(db, "treatment_plans"),
          where("doctor_email", "==", doctorEmail),
          where("patient_email", "==", selectedPatientEmail),
          where("is_terminated", "==", false),
          limit(1)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          setPlanMeta(null);
          setVersions([]);
        } else {
          const docSnap = snap.docs[0];
          const meta = { ...docSnap.data(), plan_id: docSnap.id };
          setPlanMeta(meta);

          const vRes = await axios.get(
            `${API_BASE}/treatment/${encodeURIComponent(
              meta.plan_id
            )}/versions/`
          );
          setVersions(vRes.data || []);
        }
      } catch (err) {
        console.error("Error fetching treatment plan:", err);
        setPlanMeta(null);
        setVersions([]);
      } finally {
        setLoadingPlan(false); // done loading
      }
    })();
  }, [doctorEmail, selectedPatientEmail]);

  // Backend callbacks
  const fetchTreatmentPlan = useCallback(async (planId) => {
    const res = await axios.get(
      `${API_BASE}/treatment/${encodeURIComponent(planId)}/`
    );
    return res.data;
  }, []);
  const fetchVersion = useCallback(async (planId, versionId) => {
    const res = await axios.get(
      `${API_BASE}/treatment/${encodeURIComponent(
        planId
      )}/version/${encodeURIComponent(versionId)}/`
    );
    return res.data;
  }, []);

  const onToggleComplete = useCallback(
    async ({ goalId, actionId, newStatus }) => {
      if (!planMeta || !versions.length) return;
      const latest = versions[versions.length - 1];
      await axios.post(
        `${API_BASE}/treatment/${encodeURIComponent(
          planMeta.plan_id
        )}/version/${encodeURIComponent(latest.version_id)}/complete/`,
        {
          goal_id: goalId,
          action_id: actionId,
          role: "doctor",
          is_completed: newStatus,
        }
      );
      const vRes = await axios.get(
        `${API_BASE}/treatment/${encodeURIComponent(
          planMeta.plan_id
        )}/versions/`
      );
      setVersions(vRes.data || []);
    },
    [planMeta, versions]
  );

  const onTerminate = useCallback(async () => {
    if (!planMeta) return;
    await axios.post(
      `${API_BASE}/treatment/${encodeURIComponent(planMeta.plan_id)}/terminate/`
    );
    setPlanMeta((prev) => prev && { ...prev, is_terminated: true });
  }, [planMeta]);

  const navigate = useNavigate();

  useEffect(() => {
    const authInstance = getAuth();
    onAuthStateChanged(authInstance, async (loggedInUser) => {
      if (!loggedInUser) {
        navigate("/login");
      } else {
        const docRef = doc(db, "doctors", loggedInUser.email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDoctorEmail(loggedInUser.email);
        } else {
          console.log("Doctor not found in doctors collection");
          navigate("/login");
        }
      }
    });
  }, []);

  return (
    <>
      <div className="flex flex-col items-center space-y-[48px]">
        <div
          className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600
                      text-white text-center py-20"
        >
          <h1 className="text-5xl font-bold">Manage Patients</h1>
          <p className="mt-2 text-xl opacity-90">
            View and manage treatment plans, appointments, and the history of
            your patients
          </p>
        </div>
      </div>
      <CreateTreatmentCTA />
      <div className="p-8 flex flex-col items-center" ref={containerRef}>
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-6 relative">
          <div className="flex items-center mb-4">
            <Search className="text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold">Select Patient</h2>
          </div>
          <div
            className="w-full p-3 border rounded-xl flex items-center cursor-pointer hover:shadow focus:shadow-lg transition"
            onClick={() => setDropdownOpen((o) => !o)}
          >
            <span className="flex-grow text-gray-700">
              {selectedPatientEmail
                ? patients.find((p) => p.patient_email === selectedPatientEmail)
                    ?.patient_name
                : "Search patients..."}
            </span>
            {selectedPatientEmail && (
              <X
                className="text-gray-400 mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPatientEmail("");
                }}
              />
            )}
            {dropdownOpen ? (
              <ChevronUp className="text-gray-400" />
            ) : (
              <ChevronDown className="text-gray-400" />
            )}
          </div>
          {dropdownOpen && (
            <ul className="absolute z-10 mt-1 w-full bg-white border rounded-lg max-h-60 overflow-auto shadow-lg">
              {filtered.length ? (
                filtered.map((p) => (
                  <li
                    key={p.patient_email}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelect(p.patient_email)}
                  >
                    {p.patient_name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No patients found</li>
              )}
            </ul>
          )}
        </div>
        <div className="w-full max-w-6xl mt-8">
          {selectedPatientEmail && loadingPlan ? (
            <div className="text-center p-6 bg-gray-100 rounded-2xl">
              Loading treatment plan...
            </div>
          ) : selectedPatientEmail && planMeta ? (
            <TreatmentPlanView
              planId={planMeta.plan_id}
              versions={versions}
              versionIndex={versions.length - 1}
              role="doctor"
              fetchTreatmentPlan={fetchTreatmentPlan}
              fetchVersion={fetchVersion}
              onToggleComplete={onToggleComplete}
              onTerminate={onTerminate}
            />
          ) : selectedPatientEmail ? (
            <div className="text-center p-6 bg-yellow-100 rounded-2xl">
              No active treatment plan for this patient.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
