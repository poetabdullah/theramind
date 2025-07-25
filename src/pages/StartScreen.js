import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setMessage("You must be logged in to access the questionnaire.");
        setEligible(false);
        setLoading(false);
        return;
      }
       //Storing user so we can use it later
      setUser(user);
      try {
        //Only patient can access questionnaire
        const patientDoc = await getDoc(doc(db, "patients", user.email));
        //Checking email if not patient redirect to home
        if (!patientDoc.exists()) {
          navigate("/");
          return;
        }

        //Check if patient has taken the assessment recently
        const assessmentsRef = collection(db, "patients", user.email, "assessments");
        const assessmentsQuery = query(
          assessmentsRef,
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(assessmentsQuery);
        //If no assessments found, user is eligible
        if (snapshot.empty) {
          setEligible(true);
          setMessage("You are eligible to take the questionnaire.");
        } else {
          //If assessments found, check the latest one, taken within 3 months or not, comparing with current date
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
        }
      } catch (error) {
        console.error("Error checking eligibility:", error);
        setEligible(false);
        navigate("/");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  //Redirect if questionnaire was not started, on reloading the page
  useEffect(() => {
    //Checking from browser's temporary storage if questionnaire was started
    const started = sessionStorage.getItem("questionnaireStarted");
    if (!started) {
      navigate("/start-screen");
    }
  }, [navigate]); //Dependency to check user is logged in and questionnaire was started

  //Prevent back button navigation
  useEffect(() => {
    //Adding a new state to browser history so no real page navigation occurs
    window.history.pushState(null, "", window.location.href);
    //Setting a custom handler for the back button to still navigate to start screen not reopen questionnaire again
    window.onpopstate = () => {
      navigate("/start-screen");
    };
  }, [navigate]);

  const handleStart = () => {
    if (eligible) {
      //Setting a flag in session storage to indicate questionnaire has started
      sessionStorage.setItem("questionnaireStarted", "true");
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
          {/*If still loading, show loading message, else show questionnaire button*/}
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
