import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import StylizedPatientDropdown from "../components/StylizedPatientDropdown";
import PatientSelector from "../components/PatientSelector"; // display-only version
import DiagnosisTree from "../components/DiagnosisTree";

const TreatmentRecommendation = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Auth check - only doctor access
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

  // Fetch patients
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

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">
        Treatment Recommendations
      </h1>

      {/* Stylized Patient Dropdown */}
      <StylizedPatientDropdown
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        patients={patients}
        loading={loading}
      />

      {/* Display Selected Patient */}
      {selectedPatient && (
        <PatientSelector
          selectedPatient={selectedPatient}
          setSelectedPatient={() => {}}
          patients={patients}
          loading={false}
          error={false}
        />
      )}

      {/* Tree View Placeholder */}
      {selectedPatient && <DiagnosisTree patientEmail={selectedPatient} />}

      {/* Recommended Templates Section */}
      {selectedPatient && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-orange-600 mb-4">
            Recommended Treatment Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder cards – will be dynamic later */}
            <div className="p-4 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl shadow cursor-pointer hover:shadow-md transition">
              <h3 className="text-lg font-semibold text-orange-700">
                Acute Stress Protocol
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                Recommended plan for acute stress diagnosis.
              </p>
            </div>

            <div
              className="p-4 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl shadow cursor-pointer hover:shadow-md transition"
              onClick={() => navigate("/create-treatment")}
            >
              <h3 className="text-lg font-semibold text-orange-700">
                Blank Plan
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                Start treatment plan from scratch.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentRecommendation;
