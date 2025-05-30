import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";

const symptomMap = {
  // OCD Subtypes
  "contamination OCD": {
    cognitive: "Persistent fears of germs or contaminants.",
    behavioral: "Excessive hand washing and cleaning rituals.",
    emotional: "Anxiety and distress over perceived contamination.",
  },
  "symmetry OCD": {
    cognitive: "Obsessions with order and exactness.",
    behavioral: "Compulsive arranging and aligning of objects.",
    emotional: "Irritation when things feel 'off' or misaligned.",
  },
  "checking OCD": {
    cognitive: "Intrusive doubts about safety or mistakes.",
    behavioral: "Repeated checking of locks, appliances, etc.",
    emotional: "Relief followed by renewed anxiety after checking.",
  },

  // Stress Subtypes
  "acute stress": {
    cognitive: "Difficulty concentrating and memory lapses.",
    behavioral: "Avoidance of reminders of the traumatic event.",
    emotional: "Emotional numbness and detachment.",
  },
  "chronic stress": {
    cognitive: "Persistent worry and indecisiveness.",
    behavioral: "Neglect of responsibilities and social withdrawal.",
    emotional: "Irritability and feelings of being overwhelmed.",
  },
  "episodic  stress": {
    cognitive: "Frequent episodes of intense stress.",
    behavioral: "Overcommitment and inability to relax.",
    emotional: "Short-temperedness and anxiety.",
  },

  // Depression Subtypes
  "major depressive disorder": {
    cognitive: "Negative thoughts and hopelessness.",
    behavioral: "Withdrawal from activities and social interactions.",
    emotional: "Persistent sadness and loss of interest.",
  },
  "postpartum depression": {
    cognitive: "Difficulty bonding with the baby.",
    behavioral: "Changes in eating and sleeping patterns.",
    emotional: "Feelings of inadequacy and guilt.",
  },
  "atypical depression": {
    cognitive: "Sensitivity to rejection.",
    behavioral: "Increased appetite and sleep.",
    emotional: "Mood reactivity to positive events.",
  },

  // Anxiety Subtypes
  "generalized anxiety disorder": {
    cognitive: "Excessive worry about various aspects of life.",
    behavioral: "Avoidance of anxiety-inducing situations.",
    emotional: "Restlessness and feeling on edge.",
  },
  "panic disorder": {
    cognitive: "Fear of impending doom during attacks.",
    behavioral: "Avoidance of places where attacks occurred.",
    emotional: "Sudden surges of intense fear.",
  },
  "separation anxiety disorder": {
    cognitive: "Worry about being separated from loved ones.",
    behavioral: "Reluctance to be alone or away from attachment figures.",
    emotional: "Distress during periods of separation.",
  },

  // Trauma Subtypes
  "single event trauma": {
    cognitive: "Intrusive memories of the traumatic event.",
    behavioral: "Avoidance of reminders associated with the trauma.",
    emotional: "Heightened startle response and irritability.",
  },
  "complex trauma": {
    cognitive: "Negative self-perception and distrust.",
    behavioral: "Self-destructive behaviors and difficulty with relationships.",
    emotional: "Emotional dysregulation and feelings of shame.",
  },
  "developmental trauma": {
    cognitive: "Impaired cognitive development and learning difficulties.",
    behavioral: "Attachment issues and behavioral problems.",
    emotional: "Chronic feelings of emptiness and emotional numbness.",
  },
};

const DiagnosisTree = ({ patientEmail }) => {
  const [diagnosis, setDiagnosis] = useState(null);
  const [mentalHistory, setMentalHistory] = useState({
    mentalHealthConditions: [],
    familyHistory: "",
    significantTrauma: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientEmail) return;

    const fetchLatestData = async () => {
      try {
        const patientRef = doc(db, "patients", patientEmail);
        const patientSnap = await getDoc(patientRef);

        if (patientSnap.exists()) {
          const data = patientSnap.data();
          setMentalHistory({
            mentalHealthConditions: data.mentalHealthConditions || [],
            familyHistory: data.familyHistory || "Unknown",
            significantTrauma: data.significantTrauma || "Unknown",
          });
        }

        const assessmentsRef = collection(
          db,
          "patients",
          patientEmail,
          "assessments"
        );
        const q = query(assessmentsRef, orderBy("timestamp", "desc"), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setDiagnosis(null);
        } else {
          const latest = snapshot.docs[0].data();
          if (
            latest.suicidalThoughts ||
            latest.diagnosedSubtype === "No condition at all"
          ) {
            setDiagnosis(null);
          } else {
            setDiagnosis(latest.diagnosedSubtype?.toLowerCase());
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setDiagnosis(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestData();
  }, [patientEmail]);

  if (loading || !diagnosis) return null;

  const { cognitive, behavioral, emotional } = symptomMap[diagnosis] || {
    cognitive: "Cognitive patterns not available for this diagnosis.",
    behavioral: "Behavioral tendencies not available.",
    emotional: "Emotional profile not available.",
  };

  return (
    <div className="bg-gradient-to-b from-orange-50 to-amber-50 p-8 mt-10 rounded-2xl border border-orange-200 shadow-lg">
      <h2 className="text-3xl font-bold text-orange-800 mb-8 text-center tracking-wide">
        Clinical Decision Tree
      </h2>

      <div className="flex flex-col items-center relative">
        <div className="w-2 h-12 bg-gradient-to-b from-orange-600 to-orange-700 rounded-t-lg shadow-sm" />

        <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-full font-semibold text-xl shadow-lg border-2 border-orange-400 mb-6">
          <div className="absolute -top-1 -left-1 w-full h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full -z-10" />
          Primary Diagnosis: {diagnosis}
        </div>

        <div className="relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gradient-to-b from-orange-600 to-orange-500" />
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
          <div className="absolute top-8 left-12 w-px h-6 bg-gradient-to-b from-orange-500 to-orange-400" />
          <div className="absolute top-8 right-12 w-px h-6 bg-gradient-to-b from-orange-500 to-orange-400" />
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gradient-to-b from-orange-500 to-orange-400" />
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-orange-400 to-amber-400 text-white px-6 py-3 rounded-lg font-semibold shadow-md mb-3 border border-orange-300">
              Cognitive Symptoms
            </div>
            <div className="bg-white bg-opacity-80 backdrop-blur-sm text-orange-800 px-4 py-3 rounded-lg shadow-sm border border-orange-200 text-sm leading-relaxed">
              {cognitive}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-orange-400 to-amber-400 text-white px-6 py-3 rounded-lg font-semibold shadow-md mb-3 border border-orange-300">
              Behavioral Patterns
            </div>
            <div className="bg-white bg-opacity-80 backdrop-blur-sm text-orange-800 px-4 py-3 rounded-lg shadow-sm border border-orange-200 text-sm leading-relaxed">
              {behavioral}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-orange-400 to-amber-400 text-white px-6 py-3 rounded-lg font-semibold shadow-md mb-3 border border-orange-300">
              Emotional Presentation
            </div>
            <div className="bg-white bg-opacity-80 backdrop-blur-sm text-orange-800 px-4 py-3 rounded-lg shadow-sm border border-orange-200 text-sm leading-relaxed">
              {emotional}
            </div>
          </div>
        </div>

        {/* Patient History Section */}
        <div className="mt-12 w-full max-w-5xl">
          <div className="text-center mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-orange-600 mx-auto rounded-b-lg" />
            <h3 className="text-xl font-bold text-orange-800 mt-4 mb-6 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Clinical History & Background (Self Reported)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-5 shadow-md border border-orange-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mr-3" />
                <strong className="text-orange-800 font-semibold">
                  Previous Conditions
                </strong>
              </div>
              <div className="text-gray-700 text-sm leading-relaxed pl-6">
                {mentalHistory.mentalHealthConditions.length > 0
                  ? mentalHistory.mentalHealthConditions.join(", ")
                  : "No prior conditions documented"}
              </div>
            </div>

            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-5 shadow-md border border-orange-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mr-3" />
                <strong className="text-orange-800 font-semibold">
                  Family History
                </strong>
              </div>
              <div className="text-gray-700 text-sm leading-relaxed pl-6">
                {mentalHistory.familyHistory}
              </div>
            </div>

            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-5 shadow-md border border-orange-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mr-3" />
                <strong className="text-orange-800 font-semibold">
                  Trauma History
                </strong>
              </div>
              <div className="text-gray-700 text-sm leading-relaxed pl-6">
                {mentalHistory.significantTrauma}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisTree;
