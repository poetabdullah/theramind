import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer.js";
import { db } from "../firebaseConfig.js";
import { collection, getDocs, getDoc, query, orderBy, doc, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import RecommendationSection from "../components/RecommendationSection.jsx";

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
  OCD: { start: 7, end: 15 },
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
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [birthHistory, setBirthHistory] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      try {
        const patientRef = doc(db, "patients", currentUser.email);
        const patientSnapshot = await getDoc(patientRef);

        if (patientSnapshot.exists()) {
          const patientData = patientSnapshot.data();
          setUser({
            ...currentUser,
            gender: patientData.gender || "not specified",
          });
          setBirthHistory(patientData.birthHistory || ""); 
          console.log("Fetched user gender:", patientData.gender);
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setUser(currentUser);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Redirect to login if not authenticated
      navigate("/login");
      setIsLoading(false); // Ensure loading state is reset on logout
    }
  });

  return () => unsubscribe();
}, [auth, navigate]);

useEffect(() => {
  //To prevent questionnaire from being restarted if reloaded page midway
  const started = sessionStorage.getItem("questionnaireStarted");
  if (!started) {
    navigate("/start-screen"); 
  }
}, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      const q = query(collection(db, "questions"), orderBy("questionNumber", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedQuestions = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(fetchedQuestions);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    //No Condition Diagnosed
    if (currentQuestionIndex === 1 && responses["question_question1"] === "none" && responses["question_question2"] === "no_symptoms") {
      setNoConditionDiagnosed(true);
    } else {
      setNoConditionDiagnosed(false);
    }
    //Suicidal Thoughts Detected
    if (currentQuestionIndex === 2 && responses["question_question3"] === "yes_suicidalthoughts") {
      setSuicidalThoughts(true);
    } else {
      setSuicidalThoughts(false);
    }
  }, [currentQuestionIndex, responses]);

  //Destructuring: To pull out properties from an input field selected by a user
  const changeEvent = (event) => {
    const { name, value } = event.target;
    setResponses((prev) => {
      const updatedResponses = { ...prev, [name]: value };

      //Get the question text that corresponds to this answer
      const questionKey = name.replace("question_", "");
      const question = questions.find(q => q.id === questionKey);

      //If user is authenticated, save this response to Firestore
      if (user && question) {
        //Store each individual response as it's selected
        const responseData = {
          questionId: questionKey,
          questionText: question.text,
          response: value,
          timestamp: new Date()
        };

        const responseRef = doc(db, "patients", user.email, "responses", questionKey);
        setDoc(responseRef, responseData, { merge: true })
          .then(() => console.log(`Response saved for ${questionKey}`))
          .catch(error => console.error("Firestore write error:", error));

      }

      //Reset detected conditions if a question in range 3-6 is changed
      const questionIndex = questions.findIndex(q => `question_${q.id}` === name);
      if (questionIndex >= 3 && questionIndex <= 6) {
        setDetectedConditions([]);
      }

      return updatedResponses;
    });
  };

 const handleNext = async () => {
  if (!detectedCondition && currentQuestionIndex === 6) {
    const conditionCounts = { Stress: 0, Anxiety: 0, Depression: 0, Trauma: 0, OCD: 0 };

    for (let i = 3; i <= 6; i++) {
      const selectedCondition = responses[`question_${questions[i]?.id}`];
      if (selectedCondition) { conditionCounts[selectedCondition]++ };
    }

    const detected = Object.keys(conditionCounts).reduce((a, b) => conditionCounts[a] > conditionCounts[b] ? a : b);
    setDetectedCondition(detected);
    console.log(detected);
    console.log(conditionCounts);
    setCurrentQuestionIndex(conditionRanges[detected]?.start || 16);
    return;
  }

  let nextIndex = currentQuestionIndex + 1;

  //If Condition = Depression & Male Or Female with no birth history, skipping postpartum questions
  if (
  detectedCondition === "Depression" &&
  currentQuestionIndex === 34 &&
  (
    user?.gender?.toLowerCase() === "male" || 
    (user?.gender?.toLowerCase() === "female" && birthHistory?.toLowerCase() === "no")
  )
) {
  //Skipping postpartum questions
  nextIndex = 38;
}

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = responses[`question_${currentQuestion?.id}`];

  //Adding subtype scoring
  if (selectedOption && currentQuestion?.category) {
    const score = currentQuestion.options.find(option => option.name === selectedOption)?.score || 0;
    setSubtypeScores(prev => ({
      ...prev,
      [currentQuestion.category]: (prev[currentQuestion.category] || 0) + score
    }));
  }

  //Checking if the current question is the last one in the detected condition range
  if (currentQuestionIndex === conditionRanges[detectedCondition]?.end) {
    setIsQuestionnaireComplete(true);
    return;
  }

  setCurrentQuestionIndex(nextIndex);

  //Updating diagnosed subtype, based on the highest score
  const maxSubtype = Object.keys(subtypeScores).reduce(
    (a, b) => subtypeScores[a] > subtypeScores[b] ? a : b,
    ""
  );
  setDiagnosedSubtype(maxSubtype);

  if (user) {
    const diagnosisResult = {
      timestamp: new Date(),
      noConditionDiagnosed,
      suicidalThoughts,
      detectedConditions,
      diagnosedSubtype: maxSubtype,
      allResponses: responses,
    };

    const assessmentRef = doc(db, "patients", user.email, "assessments", new Date().toISOString());
    await setDoc(assessmentRef, diagnosisResult)
      .then(() => console.log("Assessment saved successfully"))
      .catch(error => console.error("Error saving assessment result:", error));
  }
};

  useEffect(() => {
    if (isQuestionnaireComplete) {
      const maxSubtype = Object.keys(subtypeScores).reduce((a, b) => subtypeScores[a] > subtypeScores[b] ? a : b, "");
      setDiagnosedSubtype(maxSubtype);
    }
  }, [isQuestionnaireComplete, subtypeScores]);

  const handlePrevious = () => {
  setNoConditionDiagnosed(false);
  setSuicidalThoughts(false);

  //Using detectedCondition state, not detectedConditions array
  const condition = detectedCondition;

  let newIndex = currentQuestionIndex - 1;

  //Skipping postpartum questions backward if Depression & Gender = Male Or Female with no birth history
  if (
  condition === "Depression" &&
  newIndex >= 35 && newIndex <= 37 &&
  (
    user?.gender?.toLowerCase() === "male" ||
    (user?.gender?.toLowerCase() === "female" && birthHistory?.toLowerCase() === "no")
  )
) {
  newIndex = 34;
}

  //If In Current Detected Condition Range, Backtrack To Normal Back Question Of Range
  if (condition && newIndex === conditionRanges[condition].start - 1) {
    setDetectedCondition(null);
    setCurrentQuestionIndex(6);
    return;
  }

  //If currently inside detected condition range, just go one question back within range
  if (condition && currentQuestionIndex > conditionRanges[condition].start) {
    setCurrentQuestionIndex(newIndex);
    return;
  }

  //If at the first question of detected condition, go back to question 6
  if (condition && currentQuestionIndex === conditionRanges[condition].start) {
    setDetectedCondition(null);
    setCurrentQuestionIndex(6);
    return;
  }

  //If no detected condition and currently at question 6, go back to question 3
  if (!condition && currentQuestionIndex === 6) {
    setCurrentQuestionIndex(3);
    return;
  }

  //Prevent going below question 0
  setCurrentQuestionIndex(Math.max(0, newIndex));
};


  const getProgress = () => {
    if (noConditionDiagnosed || suicidalThoughts) { return 100 };

    const totalQuestions = questions.length;

    if (currentQuestionIndex <= 6) {
      return Math.round((currentQuestionIndex / 6) * 40);
    }

    if (detectedCondition) {
      const { start, end } = conditionRanges[detectedCondition];
      const conditionTotal = end - start + 1;

      return 40 + Math.round(((currentQuestionIndex - start) / conditionTotal) * 60);
    }

    return Math.round((currentQuestionIndex / totalQuestions) * 100);
  };

  if (isLoading) {
    return (
      <motion.div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
        <motion.div className="text-center">
          <motion.p className="text-xl text-purple-600">Loading questionnaire...</motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (isQuestionnaireComplete) {
    //To prevent questionnaire from being restarted if reloaded page midway
    sessionStorage.removeItem("questionnaireStarted");
    return (
      <motion.div className="flex flex-col min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}>
        <motion.header className="text-center py-4">
          <motion.h2 className="text-5xl font-bold text-purple-800 mt-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}>Diagnosis Result</motion.h2>
        </motion.header>
        <main className="flex-grow flex items-center justify-center mb-4">
          <motion.div className="bg-gradient-to-r from-purple-200 to-fuchsia-200 shadow-lg rounded-lg p-6 w-full max-w-xl text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.05, boxShadow: "0px 4px 15px rgba(0,0,0,0.2)" }}>
            <motion.h2 className="text-3xl font-bold bg-gradient-to-r text-pink-600 to-purple-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}>Your diagnosed mental health condition:</motion.h2>
            <motion.p className="text-xl text-purple-800 mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}>Based on the responses you submitted, you are likely to
              have features of,<br></br><motion.span
                className="font-bold text-pink-700 text-3xl"
                animate={{ scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } }}
              >
                {diagnosedSubtype}
              </motion.span></motion.p>
          </motion.div>
        </main>
        {/* Recommendation Section */}
        {diagnosedSubtype && (
          <RecommendationSection
            diagnosedSubtype={diagnosedSubtype}
          />
        )}
        <Footer />
      </motion.div>
    );
  }

  return (
    <motion.div className="flex flex-col min-h-screen">
      <motion.header className="text-center py-4">
        <motion.h2 className="text-5xl font-extrabold text-purple-700 mt-2" {...fadeInUp}>Diagnostic Questionnaire</motion.h2>
      </motion.header>
      <main className="flex-grow flex items-center justify-center mb-5 bg-gradient-to-r from-purple-150 to-orange-150">
        <motion.div
          className={`p-6 w-full max-w-xl relative ${suicidalThoughts || noConditionDiagnosed
            ? "bg-transparent shadow-none"
            : "bg-white shadow-lg rounded-lg"
            }`}

          {...scaleEffect}
        >
          <AnimatePresence>
            {noConditionDiagnosed && (
              <motion.div
                {...fadeInUp}
                className="text-center p-8 w-full bg-gradient-to-r from-purple-200 to-purple-300 rounded-lg shadow-lg"
              >
                <motion.h3
                  className="text-3xl font-bold text-purple-900"
                >
                  Thank you for taking TheraMind's diagnostic questionnaire!
                </motion.h3>
                <motion.p
                  className="text-2xl font-semibold text-orange-700 mt-4"
                >
                  You are not diagnosed with any mental health condition within TheraMind's scope.
                </motion.p>
              </motion.div>
            )}
            {suicidalThoughts && (
              <motion.div {...fadeInUp} initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
                className="text-center text-red-800 p-4 border border-red-500 rounded-lg bg-red-100">
                <motion.h2 className="text-2xl font-bold"
                  animate={{
                    scale: [1, 1.1, 1],
                    transition: { repeat: Infinity, duration: 1.5 }
                  }}>🚨😔 Suicidal Thoughts Detected</motion.h2>
                <motion.p className="mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}>Your responses indicate suicidal thoughts. Please seek immediate help from an emergency hotline.</motion.p>
                <motion.h3 className="text-lg font-semibold mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}>Emergency Hotlines:</motion.h3>
                <motion.p className="mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}>
                  <motion.span whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgba(255, 0, 0, 0.8)" }}>
                    <motion.strong>Umang:</motion.strong> 0311 7786264
                  </motion.span>
                  <motion.br />
                  <motion.span whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgba(255, 0, 0, 0.8)" }}>
                    <motion.strong>Rozan:</motion.strong> 0304 111 1741
                  </motion.span>
                  <motion.br />
                  <motion.span whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgba(255, 0, 0, 0.8)" }}>
                    <motion.strong>Welfare Bureau:</motion.strong> 1121
                  </motion.span></motion.p>
                <motion.p className="mt-4 font-bold text-red-900"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ x: [-2, 2, -2, 2, 0], transition: { duration: 0.2 } }}>If in immediate danger, dial <strong>911</strong>.</motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!noConditionDiagnosed && !suicidalThoughts && questions.length > 0 && currentQuestionIndex < questions.length && (!(detectedCondition === "Depression" && user?.gender?.toLowerCase() === "male" && currentQuestionIndex >= 35 && currentQuestionIndex <=37)) && (
              <motion.div {...fadeInUp}>
                <motion.h3 className="text-2xl font-bold text-orange-600 mb-3">{questions[currentQuestionIndex]?.text}</motion.h3>
                <motion.div className="grid grid-cols-1 gap-2">
                  {questions[currentQuestionIndex]?.options.map((option, index) => (
                    <motion.label
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-gradient-to-r from-fuchsia-400 to-purple-400 p-2 rounded-full cursor-pointer hover:to-purple-600 transition-colors"
                    >
                      <motion.input
                        type="radio"
                        name={`question_${questions[currentQuestionIndex]?.id}`}
                        value={option.name}
                        checked={responses[`question_${questions[currentQuestionIndex]?.id}`] === option.name}
                        onChange={changeEvent}
                        className="form-radio h-5 w-5 text-purple-600"
                      />
                      <motion.span>{option.label}</motion.span>
                    </motion.label>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="flex justify-between mt-6">
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
          </motion.div>
          {/* Progress Bar (Hidden when interrupted) */}
          {!noConditionDiagnosed && !suicidalThoughts && (
            <motion.div className="w-full max-w-xl mx-auto my-4 px-6">
              <motion.div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className="bg-gradient-to-r from-purple-600 to-orange-500 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </main>
      <Footer />
    </motion.div >
  );
};

export default Questionnaire;