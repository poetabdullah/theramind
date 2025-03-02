import React, { useState, useEffect } from "react";
import "./questionnaire.css";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer.js";
import { db } from "../firebaseConfig.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const scaleEffect = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
};

const conditionRanges = {
  Stress: { start: 16, end: 30 },
  Depression: { start: 31, end: 41 },
  Anxiety: { start: 42, end: 52 },
  Trauma: { start: 53, end: 68 },
  OCD: { start: 69, end: 80 },
};

const Questionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [noConditionDiagnosed, setNoConditionDiagnosed] = useState(false);
  const [suicidalThoughts, setSuicidalThoughts] = useState(false);
  const [detectedCondition, setDetectedCondition] = useState(null);
  const [detectedConditions, setDetectedConditions] = useState([]);
  const [subtypeScores, setSubtypeScores] = useState({});
  const [diagnosedSubtype, setDiagnosedSubtype] = useState(null);
  const [isQuestionnaireComplete, setIsQuestionnaireComplete] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const q = query(collection(db, "questions"), orderBy("questionNumber", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedQuestions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(fetchedQuestions);
    };
    fetchQuestions();
  }, []);

  const saveResponsesToFirestore = async (responses, diagnosedCondition, diagnosedSubtype) => {
    try {
      const auth = getAuth();
      const user = auth.user;
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const userId = user.uid;
      const responseDocRef = doc(db, "user_responses", userId);

      await setDoc(responseDocRef, {
        responses,
        diagnosedCondition,
        diagnosedSubtype,
        timestamp: new Date(),
      });

      console.log("Responses successfully saved!");
    } catch (error) {
      console.error("Error saving responses: ", error);
    }
  };

  useEffect(() => {
    if (currentQuestionIndex === 1 && responses["question_question1"] === "none" && responses["question_question2"] === "no_symptoms") {
      setNoConditionDiagnosed(true);
    } else {
      setNoConditionDiagnosed(false);
    }

    if (currentQuestionIndex === 2 && responses["question_question3"] === "yes_suicidalthoughts") {
      setSuicidalThoughts(true);
    } else {
      setSuicidalThoughts(false);
    }
  }, [currentQuestionIndex, responses]);

  const changeEvent = (event) => {
    const { name, value } = event.target;
    setResponses((prev) => {
      const updatedResponses = { ...prev, [name]: value };

      // Reset detected conditions if a question in range 3-6 is changed
      const questionIndex = questions.findIndex(q => `question_${q.id}` === name);
      if (questionIndex >= 3 && questionIndex <= 6) {
        setDetectedConditions([]);
      }

      return updatedResponses;
    });
  };

  const handleNext = () => {
    if (!detectedCondition && currentQuestionIndex === 6) {
      const conditionCounts = { Stress: 0, Anxiety: 0, Depression: 0, Trauma: 0, OCD: 0 };

      for (let i = 3; i <= 6; i++) {
        const selectedCondition = responses[`question_${questions[i]?.id}`];
        if (selectedCondition) conditionCounts[selectedCondition]++;
      }

      const detected = Object.keys(conditionCounts).reduce((a, b) => conditionCounts[a] > conditionCounts[b] ? a : b);
      setDetectedCondition(detected);
      setCurrentQuestionIndex(conditionRanges[detected]?.start || 16);
      return;
    }

    if (detectedCondition) {
      const currentQuestion = questions[currentQuestionIndex];
      const selectedOption = responses[`question_${currentQuestion.id}`];

      if (selectedOption && currentQuestion.category) {
        const score = currentQuestion.options.find(option => option.name === selectedOption)?.score || 0;
        setSubtypeScores(prev => ({
          ...prev,
          [currentQuestion.category]: (prev[currentQuestion.category] || 0) + score
        }));
      }

      if (currentQuestionIndex === conditionRanges[detectedCondition].end) {
        setIsQuestionnaireComplete(true);
        return;
      }
    }

    setCurrentQuestionIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (isQuestionnaireComplete) {
      const maxSubtype = Object.keys(subtypeScores).reduce((a, b) => subtypeScores[a] > subtypeScores[b] ? a : b, "");
      setDiagnosedSubtype(maxSubtype);
    }
  }, [isQuestionnaireComplete, subtypeScores]);

  useEffect(() => {
    if (isQuestionnaireComplete) {
      saveResponsesToFirestore(responses, detectedCondition, diagnosedSubtype);
    }
  }, [isQuestionnaireComplete, responses, detectedCondition, diagnosedSubtype]);

  const handlePrevious = () => {
    setNoConditionDiagnosed(false);
    setSuicidalThoughts(false);

    const detectedCondition = detectedConditions[0];

    if (detectedCondition && currentQuestionIndex >= conditionRanges[detectedCondition].start) {
      setCurrentQuestionIndex(6);
    } else if (currentQuestionIndex === 6) {
      setCurrentQuestionIndex(3);
    } else {
      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const getProgress = () => {
    if (noConditionDiagnosed || suicidalThoughts) return 100;
    if (currentQuestionIndex === 0) return 0;
    if (currentQuestionIndex <= 1) return 25;
    if (currentQuestionIndex === 2) return 50;
    if (currentQuestionIndex >= 3 && currentQuestionIndex <= 6) return 75;
    return Math.round((currentQuestionIndex / (questions.length - 1)) * 100);
  };

  if (isQuestionnaireComplete) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="text-center py-4">
          <motion.h2 className="text-3xl font-bold text-purple-600 mt-2" {...fadeInUp}>Diagnosis Result</motion.h2>
        </header>
        <main className="flex-grow flex items-center justify-center mb-5">
          <motion.div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl text-center" {...scaleEffect}>
            <h2 className="text-2xl font-bold">Your diagnosed subtype:</h2>
            <p className="text-xl text-green-800 mt-2">{diagnosedSubtype}</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="text-center py-4">
        <motion.h2 className="text-3xl font-bold text-purple-600 mt-2" {...fadeInUp}>Diagnostic Questionnaire</motion.h2>
      </header>

      {/* Progress Bar (Hidden when interrupted) */}
      {!noConditionDiagnosed && !suicidalThoughts && (
        <div className="w-full max-w-xl mx-auto my-4 px-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-orange-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
        </div>
      )}

      <main className="flex-grow flex items-center justify-center mb-5">
        <motion.div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-xl relative" {...scaleEffect}>
          <AnimatePresence>
            {noConditionDiagnosed && (
              <motion.div {...fadeInUp} className="text-center">
                <h3 className="text-xl font-semibold text-purple-600 mb-4">Thank you for taking TheraMind's diagnostic questionnaire!</h3>
                <p className="text-lg text-orange-500">You are not diagnosed with any mental health condition within TheraMind's scope.</p>
              </motion.div>
            )}
            {suicidalThoughts && (
              <motion.div {...fadeInUp} className="text-center text-red-800">
                <h2 className="text-2xl font-bold">Suicidal Thoughts Detected</h2>
                <p>Your responses indicate suicidal thoughts. Please seek immediate help from an emergency hotline.</p>
                <h3 className="text-lg font-semibold mt-4">Emergency Hotlines:</h3>
                <p><strong>Umang:</strong> 0311 7786264<br /><strong>Rozan:</strong> 0304 111 1741<br /><strong>Welfare Bureau:</strong> 1121</p>
                <p className="mt-4">If in immediate danger, dial <strong>911</strong>.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!noConditionDiagnosed && !suicidalThoughts && questions.length > 0 && currentQuestionIndex < questions.length && (
              <motion.div {...fadeInUp}>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">{questions[currentQuestionIndex]?.text}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {questions[currentQuestionIndex]?.options.map((option, index) => (
                    <motion.label
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-purple-100 p-2 rounded-full cursor-pointer hover:bg-orange-300"
                    >
                      <input
                        type="radio"
                        name={`question_${questions[currentQuestionIndex]?.id}`}
                        value={option.name}
                        checked={responses[`question_${questions[currentQuestionIndex]?.id}`] === option.name}
                        onChange={changeEvent}
                        className="form-radio h-5 w-5 text-purple-600"
                      />
                      <span>{option.label}</span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            {currentQuestionIndex > 0 && !noConditionDiagnosed && !suicidalThoughts && (
              <motion.button
                className="bg-gradient-to-r from-purple-600 to-orange-500 text-white p-2 rounded hover:scale-105 transition duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevious}
              >
                Back
              </motion.button>
            )}
            {!noConditionDiagnosed && !suicidalThoughts && (
              <motion.button
                className={`p-2 rounded transition duration-300 ${responses[`question_${questions[currentQuestionIndex]?.id}`]
                  ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                whileHover={responses[`question_${questions[currentQuestionIndex]?.id}`] ? { scale: 1.1 } : {}}
                whileTap={responses[`question_${questions[currentQuestionIndex]?.id}`] ? { scale: 0.9 } : {}}
                onClick={handleNext}
                disabled={!responses[`question_${questions[currentQuestionIndex]?.id}`]}
              >
                Next
              </motion.button>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Questionnaire;
