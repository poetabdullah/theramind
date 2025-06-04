import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import StylizedPatientDropdown from "../components/StylizedPatientDropdown";
import PatientSelector from "../components/PatientSelector"; // display‐only version
import DiagnosisTree from "../components/DiagnosisTree";
import TreatmentTemplates from "../components/TreatmentTemplates";

const TreatmentRecommendation = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);

  const navigate = useNavigate();

  // 1) Auth check – only doctor access
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const doctorRef = doc(db, "doctors", user.email);
        const docSnap = await getDoc(doctorRef);

        if (docSnap.exists()) {
          setDoctorData(docSnap.data());
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching doctor data:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // cleanup on unmount
  }, [navigate]);

  // 2) Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "patients"));
        const patientList = querySnapshot.docs.map((doc) => ({
          email: doc.id,
          name: doc.data().name,
        }));
        setPatients(patientList);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  const selectedPatientData = patients.find((p) => p.email === selectedPatient);

  // 3) Whenever diagnosis changes, we want to re‐render the "Recommended Treatment Plan" card
  //    diagnosis is lowercased key like "contamination ocd", "major depressive disorder", etc.

  // 4) Handler when the user picks a plan card (only one will appear if diagnosis exists)
  const onClickPlanCard = () => {
    if (!selectedPatient || !diagnosis) {
      alert("Please choose a patient and wait until a diagnosis appears.");
      return;
    }
    // Navigate to CreateTreatmentPlan page, passing patientEmail + planKey
    navigate("/create-treatment", {
      state: { patientEmail: selectedPatient, planKey: diagnosis },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 shadow-xl">
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              Treatment Recommendations
            </h1>
            <p className="text-orange-100 text-lg font-medium">
              AI-powered treatment planning for optimal patient care
            </p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-400"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Patient Selection Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-8 py-6 border-b border-orange-200">
            <h2 className="text-2xl font-bold text-orange-800 mb-2">
              Patient Selection
            </h2>
            <p className="text-orange-700">
              Choose a patient to begin treatment planning
            </p>
          </div>

          <div className="p-8">
            <StylizedPatientDropdown
              selectedPatient={selectedPatient}
              setSelectedPatient={(email) => {
                setSelectedPatient(email);
                // Whenever patient changes, clear the diagnosis until the new one is fetched
                setDiagnosis(null);
              }}
              patients={patients}
              loading={loading}
            />

            {/* Display Selected Patient */}
            {selectedPatient && (
              <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-l-4 border-orange-400">
                <PatientSelector
                  selectedPatient={selectedPatient}
                  setSelectedPatient={() => {}}
                  patients={patients}
                  loading={false}
                  error={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis Section */}
        {selectedPatient && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-8 py-6 border-b border-orange-200">
              <h2 className="text-2xl font-bold text-orange-800 mb-2">
                Clinical Assessment
              </h2>
              <p className="text-orange-700">
                Clinically powered diagnosis based on patient data
              </p>
            </div>

            <div className="p-8">
              <DiagnosisTree
                patientEmail={selectedPatient}
                onDiagnosisSelect={(diagKey) => {
                  setDiagnosis(diagKey);
                }}
              />
            </div>
          </div>
        )}

        {/* Recommended Treatment Plans Section */}
        {selectedPatient && diagnosis && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-8 py-6 border-b border-orange-200">
              <h2 className="text-2xl font-bold text-orange-800 mb-2">
                Recommended Treatment Plans
              </h2>
              <p className="text-orange-700">
                Evidence-based treatment options tailored to the diagnosis
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recommended Plan Card */}
                {TreatmentTemplates[diagnosis] && (
                  <div
                    className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    onClick={onClickPlanCard}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    {/* Content */}
                    <div className="relative p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="px-3 py-1 bg-white/20 rounded-full">
                          <span className="text-xs font-semibold text-white">
                            RECOMMENDED
                          </span>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-100 transition-colors">
                        {TreatmentTemplates[diagnosis].name}
                      </h3>
                      <p className="text-orange-100 text-base leading-relaxed mb-6">
                        Evidence-based treatment plan automatically configured
                        for this specific diagnosis.
                      </p>

                      <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                        <span>Start Treatment Plan</span>
                        <svg
                          className="w-5 h-5 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blank Plan Card */}
                <div
                  className="group relative overflow-hidden bg-gradient-to-br from-slate-100 via-gray-100 to-stone-100 border-2 border-dashed border-orange-300 rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-orange-400"
                  onClick={() => {
                    if (!selectedPatient) {
                      alert("Please choose a patient first.");
                      return;
                    }
                    navigate("/create-treatment", {
                      state: { patientEmail: selectedPatient, planKey: null },
                    });
                  }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500 rounded-full translate-y-12 -translate-x-12"></div>
                  </div>

                  {/* Content */}
                  <div className="relative p-8">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-orange-700 transition-colors">
                      Custom Treatment Plan
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                      Create a personalized treatment plan from scratch with
                      full customization options.
                    </p>

                    <div className="flex items-center text-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Create Custom Plan</span>
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waiting State */}
        {selectedPatient && !diagnosis && (
          <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 5.523 4.477 10 10 10v-4.709a7.962 7.962 0 01-4-3.999z"
                  ></path>
                </svg>
              </div>
              <p className="text-gray-600 italic">
                Waiting for latest assessment to determine diagnosis…
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentRecommendation;
