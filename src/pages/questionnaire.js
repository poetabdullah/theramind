import React, { useState, useEffect } from "react";
import "./questionnaire.css";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import { db } from "../firebaseConfig.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const Questionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [diagnosis, setDiagnosis] = useState("");
  const [noConditionDiagnosed, setNoConditionDiagnosed] = useState(false);
  const [suicidalThoughts, setSuicidalThoughts] = useState(false);
  const [detectedConditions, setDetectedConditions] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const q = query(collection(db, "questions"), orderBy("questionNumber", "asc"));
      const querySnapshot = await getDocs(q);
      const fetchedQuestions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(fetchedQuestions);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    // Interrupt for No Condition Diagnosed
    if (
      currentQuestionIndex === 1 &&
      responses["question_question1"] === "none" &&
      responses["question_question2"] === "no_symptoms"
    ) {
      setNoConditionDiagnosed(true);
    } else {
      setNoConditionDiagnosed(false);
    }

    // Interrupt for Suicidal Thoughts
    if (currentQuestionIndex === 2 && responses["question_question3"] === "yes_suicidalthoughts") {
      setSuicidalThoughts(true);
    } else {
      setSuicidalThoughts(false);
    }

    if (currentQuestionIndex >= 3 && currentQuestionIndex <= 6) {
      setDetectedConditions((prevDetectedConditions) => {
        const conditions = ["stress", "anxiety", "depression", "trauma", "ocd"];
        const updatedConditions = new Set(prevDetectedConditions);

        conditions.forEach((condition) => {
          if (responses[`question_${currentQuestionIndex + 1}`] === condition) {
            updatedConditions.add(condition);
          }
        });
        return Array.from(updatedConditions);
      });
    }
  }, [currentQuestionIndex, responses]);

  const changeEvent = (event) => {
    const { name, value } = event.target;
    console.log(`Setting response: ${name} -> ${value}`);
    setResponses((prevResponses) => ({
      ...prevResponses,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (noConditionDiagnosed || suicidalThoughts) {
      return; // Stop navigation if an interrupt is triggered
    }

    setDetectedConditions((prevDetectedConditions) => {
      let updatedConditions = new Set(prevDetectedConditions);

      for (let i = 3; i <= 6; i++) {
        const response = responses[`question_${i + 1}`];
        if (["depression", "stress", "anxiety", "trauma", "ocd"].includes(response)) {
          updatedConditions.add(response);
        }
      }

      updatedConditions = Array.from(updatedConditions);

      // Handle jumps
      let nextIndex = currentQuestionIndex + 1;
      if (currentQuestionIndex === 6) {
        if (updatedConditions.includes("ocd")) nextIndex = 7;
        else if (updatedConditions.includes("stress")) nextIndex = 16;
        else if (updatedConditions.includes("depression")) nextIndex = 31;
        else if (updatedConditions.includes("anxiety")) nextIndex = 42;
        else if (updatedConditions.includes("trauma")) nextIndex = 53;
      }

      setCurrentQuestionIndex(Math.min(nextIndex, questions.length - 1));
      return updatedConditions;
    });
  };

  const handlePrevious = () => {
    setNoConditionDiagnosed(false);
    setSuicidalThoughts(false);
    if (detectedConditions.includes("ocd") && currentQuestionIndex === 7) {
      setCurrentQuestionIndex(6);
    }
    else if (detectedConditions.includes("stress") && currentQuestionIndex === 16) {
      setCurrentQuestionIndex(6);
    }
    else if (detectedConditions.includes("depression") && currentQuestionIndex === 31) {
      setCurrentQuestionIndex(6);
    }
    else if (detectedConditions.includes("anxiety") && currentQuestionIndex === 42) {
      setCurrentQuestionIndex(6);
    }
    else if (detectedConditions.includes("trauma") && currentQuestionIndex === 53) {
      setCurrentQuestionIndex(6);
    }
    else {
      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="text-center py-4">
        <h2 className="text-3xl font-bold text-purple-600 mt-2">Diagnostic Questionnaire</h2>
      </header>
      <main className="flex-grow flex items-center justify-center mb-5">
        <motion.div className="bg-white shadow-lg rounded-lg p-4 mt-4 w-full max-w-xl">
          {/* Interrupt for No Condition Diagnosed */}
          {noConditionDiagnosed ? (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Thank you for taking TheraMind's diagnostic questionnaire!
              </h3>
              <p className="text-lg text-gray-600">
                Based on your responses, you are not diagnosed with any mental health condition, that lies in the scope of TheraMind.
              </p>
            </div>
          ) : suicidalThoughts ? (
            <div className="text-center">
              <h2 className="text-red-800 text-2xl font-bold">Suicidal Thoughts Detected</h2>
              <p className="text-lg text-gray-600">
                Your responses indicate suicidal thoughts. Please reach out to an emergency hotline. Your life is valuable, and we care for you.
              </p>
              <h3 className="text-lg font-semibold text-gray-700 mt-4">Emergency Hotlines:</h3>
              <p>
                <strong>Umang:</strong> (92) 0311 7786264 <br />
                <strong>Rozan:</strong> (92) 0304 111 1741 <br />
                <strong>Welfare Bureau:</strong> 1121
              </p>
              <p className="mt-4">
                If you are in immediate danger, please dial <strong>911</strong>. If you need someone to talk to, consider reaching out to a counselor or a trusted individual.
              </p>
              <p className="font-semibold mt-4">Your safety and well-being are a priority.</p>
            </div>
          ) : questions.length > 0 && currentQuestionIndex < questions.length ? (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                {questions[currentQuestionIndex]?.text}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestionIndex]?.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-2 bg-blue-100 p-2 rounded-full cursor-pointer hover:bg-green-200"
                  >
                    <input
                      type="radio"
                      name={`question_${questions[currentQuestionIndex]?.id}`}
                      value={option.name}
                      checked={responses[`question_${questions[currentQuestionIndex]?.id}`] === option.name}
                      onChange={changeEvent}
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">Diagnosis</h3>
              <p className="text-lg text-gray-600">
                Based on your responses, you may be experiencing symptoms of: <b>{detectedConditions.join(", ")}</b>
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentQuestionIndex > 0 && !noConditionDiagnosed && !suicidalThoughts && (
              <button className="bg-blue-500 p-2 rounded text-white hover:bg-blue-600" onClick={handlePrevious}>
                Back
              </button>
            )}
            {!noConditionDiagnosed && !suicidalThoughts && (
              <button className="bg-blue-500 p-2 rounded text-white hover:bg-blue-600" onClick={handleNext}>
                Next
              </button>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Questionnaire;
