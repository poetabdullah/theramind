// src/pages/ManagePatients.js

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc as firestoreDoc,
  getDoc,
} from "firebase/firestore";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import emailjs from "emailjs-com";

import TreatmentPlanView from "../components/TreatmentPlanView";
import CreateTreatmentCTA from "../components/CreateTreatmentCTA";
import Footer from "../components/Footer";

// Base URL for your API (make sure this matches your Django server)
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export default function ManagePatients() {
  const [doctorEmail, setDoctorEmail] = useState(null);
  const [doctorName, setDoctorName] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedPatientEmail, setSelectedPatientEmail] = useState("");
  const [planMeta, setPlanMeta] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Track which version index to display (reset when versions change)
  const [versionIndex, setVersionIndex] = useState(0);

  const containerRef = useRef(null);
  const navigate = useNavigate();

  // —————————————————————————————————————————————————————————
  // INITIALIZE EmailJS once, on page‐mount
  // —————————————————————————————————————————————————————————
  useEffect(() => {
    emailjs.init("qSC9QChymUGrSFCY5");
  }, []);

  // ————————————————————————————
  // 1) Grab current doctor email & name from Firebase Auth + Firestore
  // ————————————————————————————
  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(
      authInstance,
      async (loggedInUser) => {
        if (!loggedInUser) {
          navigate("/login");
        } else {
          // 1a) Set doctorEmail so we can query their active patients
          const email = loggedInUser.email;
          setDoctorEmail(email);

          // 1b) Also fetch the doctor's display name from Firestore
          try {
            const docRef = firestoreDoc(db, "doctors", email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setDoctorName(docSnap.data().name || null);
            } else {
              console.warn("No doctor record found for", email);
              setDoctorName(null);
            }
          } catch (e) {
            console.error("Error fetching doctor name:", e);
            setDoctorName(null);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  // ————————————————————————————
  // 2) Load all active (non-terminated) patients for this doctor
  // ————————————————————————————
  useEffect(() => {
    if (!doctorEmail) return;
    (async () => {
      try {
        const q = query(
          collection(db, "treatment_plans"),
          where("doctor_email", "==", doctorEmail),
          where("is_terminated", "==", false)
        );
        const snapshot = await getDocs(q);

        const map = {};
        snapshot.forEach((docSnap) => {
          const { patient_email, patient_name } = docSnap.data();
          // Only keep one entry per unique patient email
          map[patient_email] = patient_name;
        });

        setPatients(
          Object.entries(map).map(([email, name]) => ({
            patient_email: email,
            patient_name: name,
          }))
        );
      } catch (err) {
        console.error("Error loading patients:", err);
        setPatients([]);
      }
    })();
  }, [doctorEmail]);

  // Filter patients by name
  const filtered = useMemo(
    () =>
      patients.filter((p) =>
        p.patient_name.toLowerCase().includes(filter.toLowerCase())
      ),
    [patients, filter]
  );

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (email) => {
    setSelectedPatientEmail(email);
    setDropdownOpen(false);
  };

  // ————————————————————————————
  // 3) Whenever a new patient is selected, load their active plan metadata + versions
  // ————————————————————————————
  useEffect(() => {
    if (!doctorEmail || !selectedPatientEmail) {
      setPlanMeta(null);
      setVersions([]);
      return;
    }

    setLoadingPlan(true);
    (async () => {
      try {
        // 3a) Query Firestore for a single active (non-terminated) plan record
        const q = query(
          collection(db, "treatment_plans"),
          where("doctor_email", "==", doctorEmail),
          where("patient_email", "==", selectedPatientEmail),
          where("is_terminated", "==", false),
          limit(1)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
          // No active plan for this patient
          setPlanMeta(null);
          setVersions([]);
          setLoadingPlan(false);
          return;
        }

        const docSnap = snap.docs[0];
        const meta = { ...docSnap.data(), plan_id: docSnap.id };
        setPlanMeta(meta);

        // 3b) Fetch that plan’s version list from your API
        const vRes = await axios.get(
          `${API_BASE}/treatment/${encodeURIComponent(meta.plan_id)}/versions/`
        );
        setVersions(vRes.data || []);
      } catch (err) {
        console.error("Error fetching treatment plan:", err);
        setPlanMeta(null);
        setVersions([]);
      } finally {
        setLoadingPlan(false);
      }
    })();
  }, [doctorEmail, selectedPatientEmail]);

  // ————————————————————————————
  // 4) fetchTreatmentPlan() and fetchVersion() are passed down into TreatmentPlanView
  // ————————————————————————————
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

  // ————————————————————————————
  // 5) Toggle “complete” on individual actions
  // ————————————————————————————
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

      // Re-fetch all versions so the UI shows updated progress
      const vRes = await axios.get(
        `${API_BASE}/treatment/${encodeURIComponent(
          planMeta.plan_id
        )}/versions/`
      );
      setVersions(vRes.data || []);
    },
    [planMeta, versions]
  );

  // ————————————————————————————
  // 6) TERMINATION: call the backend endpoint, then mark planMeta.is_terminated = true
  //
  //    TreatmentPlanView will handle sending emails (it expects onTerminate(planId))
  // ————————————————————————————
  const onTerminate = useCallback(
    async (planId) => {
      // If planMeta is null or planId mismatches, bail out
      if (!planMeta || planMeta.plan_id !== planId) {
        throw new Error("No active plan to terminate");
      }

      // 6a) Call backend terminate endpoint (must match Django URL)
      await axios.post(
        `http://localhost:8000/api/treatment/${planId}/terminate/`
      );

      // 6b) Locally mark it as terminated so we don’t try to re-render it
      setPlanMeta((prev) => (prev ? { ...prev, is_terminated: true } : prev));
    },
    [planMeta]
  );

  return (
    <>
      <div className="flex flex-col items-center space-y-[48px]">
        <div
          className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600
                     text-white text-center py-20"
        >
          <h1 className="text-5xl font-bold">Manage Patients</h1>
          <p className="mt-2 text-xl opacity-90">
            View and manage treatment plans, appointments, and patient history
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

          {/* 🔽 Dropdown to pick a patient */}
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
                  setPlanMeta(null);
                  setVersions([]);
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

        {/* 🔽 Render TreatmentPlanView if a patient is selected and planMeta exists */}
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
              /** ─────────────────────────────────────────────────── **/
              /** Pass both patient & doctor so emails can be sent **/
              patient={{
                name: planMeta.patient_name,
                email: planMeta.patient_email,
              }}
              doctor={{
                name: planMeta.doctor_name,
                email: planMeta.doctor_email,
              }}
              /** ─────────────────────────────────────────────────── **/
            />
          ) : selectedPatientEmail ? (
            <div className="text-center p-6 bg-yellow-100 rounded-2xl">
              No active treatment plan for this patient.
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </>
  );
}
