import React, { useState, useEffect } from "react";
import "./Questionnaire.css";
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
  const [conditionScores, setConditionScores] = useState({
    stress: 0,
    anxiety: 0,
    depression: 0,
    trauma: 0,
    ocd: 0,
  });

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
    if (currentQuestionIndex === 2 && responses["question1"] === "none" && responses["question2"] === "No") {
      setNoConditionDiagnosed(true);
    } else if (currentQuestionIndex === 2 && responses["question1"] !== "none" && responses["question2"] !== "No") {
      setNoConditionDiagnosed(false);
    }

    // Interrupt for Suicidal Thoughts
    if (currentQuestionIndex === 3 && responses["question3"] === "Yes") {
      setSuicidalThoughts(true);
    } else {
      setSuicidalThoughts(false);
    }
  }, [currentQuestionIndex, responses]);

  const changeEvent = (event) => {
    const { name, value } = event.target;
    setResponses((prevResponses) => ({
      ...prevResponses,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (noConditionDiagnosed || suicidalThoughts) {
      return; // Stop navigation if an interrupt is triggered
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setNoConditionDiagnosed(false);
    setSuicidalThoughts(false);
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="text-center py-4">
        <h2 className="text-3xl font-bold text-purple-600 mt-2">Diagnostic Questionnaire</h2>
      </header>
      <main className="flex-grow flex items-center justify-center mb-5">
        <motion.div className="bg-white shadow-lg rounded-lg p-4 mt-4 w-full max-w-xl">
          {questions.length > 0 && currentQuestionIndex < questions.length ? (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                {questions[currentQuestionIndex]?.text}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestionIndex]?.options.map((option, index) => (
                  <label
                    key={index} // Ensures unique key
                    className="flex items-center space-x-2 bg-blue-100 p-2 rounded-full cursor-pointer hover:bg-green-200"
                  >
                    <input
                      type="radio"
                      name={`question_${questions[currentQuestionIndex]?.id}`} // Ensures all options in the same question share the same name
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
                Based on your responses, you may be experiencing symptoms of: <b>{diagnosis}</b>
              </p>
            </div>
          )}
          <div className="flex justify-between mt-6">
            {currentQuestionIndex > 0 && (
              <button className="bg-blue-500 p-2 rounded text-white hover:bg-blue-600" onClick={handlePrevious}>
                Back
              </button>
            )}
            <button className="bg-blue-500 p-2 rounded text-white hover:bg-blue-600" onClick={handleNext}>
              Next
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Questionnaire;
