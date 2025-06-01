import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc, } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
  const auth = getAuth();

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setMessage("You must be logged in to access the questionnaire.");
      setEligible(false);
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const assessmentsRef = collection(db, "patients", user.email, "assessments");
    const assessmentsQuery = query(assessmentsRef, orderBy("timestamp", "desc"), limit(1));
    const snapshot = await getDocs(assessmentsQuery);

    if (snapshot.empty) {
      // No assessments found — allow access
      setEligible(true);
      setLoading(false);
      return;
    }

    // Get the latest assessment timestamp
    const latestAssessmentDoc = snapshot.docs[0];
    const latestTimestamp = latestAssessmentDoc.data().timestamp.toDate();
    const today = new Date();

    const nextEligibleDate = new Date(latestTimestamp);
    nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);

    if (today < nextEligibleDate) {
      const remainingDays = Math.ceil(
        (nextEligibleDate - today) / (1000 * 60 * 60 * 24)
      );
      setMessage(`You can take the questionnaire again in ${remainingDays} days.`);
      setEligible(false);
    } else {
      setMessage("You are eligible to take the questionnaire.");
      setEligible(true);
    }

    setLoading(false);
  });

  return () => unsubscribe();
}, []);


const handleStart = () => {
  if (eligible) {
    navigate("/questionnaire");
  }
};


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-orange-500 text-white">
          <motion.h1
            className="text-6xl font-extrabold text-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Welcome to TheraMind
          </motion.h1>

          <motion.p
            className="text-lg text-center text-gray-200 max-w-lg mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Our diagnostic questionnaire will help assess your mental well-being. Answer honestly for accurate insights.
          </motion.p>

          {loading ? (
            <p className="text-lg text-white">Checking eligibility...</p>
          ) : eligible ? (
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-purple-550 to-orange-550 font-bold text-lg text-white rounded-full shadow-lg hover:bg-purple-100 transition duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStart}
            >
              Start Questionnaire
            </motion.button>
          ) : (
            <p className="text-lg text-yellow-200 font-medium">{message}</p>
          )}

          <motion.h4
            className="text-2xl font-bold text-center mt-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Disclaimer:
          </motion.h4>
          <motion.p
            className="text-lg text-center text-gray-200 max-w-5xl mt-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            TheraMind's diagnostic questionnaire does not in any form try to substitute a professional's
            diagnosis, it just aims to provide preliminary insights into potential mental health conditions.
            <br />
            This questionnaire is based on the following scales: Beck Depression Inventory (BDI), Beck Anxiety
            Inventory (BAI), Obsessive Compulsive Inventory-Revised (OCI-R), NSESSS, IES-R.
          </motion.p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WelcomeScreen;
