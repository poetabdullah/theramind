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
      const fetchedQuestions = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      setQuestions(fetchedQuestions);
      console.log("Fetched Questions:", fetchedQuestions);
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    console.log("Current Question Index:", currentQuestionIndex);
    console.log("Responses:", responses);
  }, [currentQuestionIndex, responses]);


  const changeEvent = (event) => {
    const { name, value, type, checked } = event.target;
    setResponses((prevResponses) => {
      if (type === "checkbox") {
        const updatedValues = prevResponses[name] || [];
        return {
          ...prevResponses,
          [name]: checked ? [...updatedValues, value] : updatedValues.filter((v) => v !== value),
        };
      }
      return {
        ...prevResponses,
        [name]: value
      };
    });

    // Update condition scores if the question has a condition
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion?.condition) {
      setConditionScores((prevScores) => ({
        ...prevScores,
        [currentQuestion.condition]: prevScores[currentQuestion.condition] + parseInt(value),
      }));
    }
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) return;

    // Skip logic based on conditions
    if (
      currentQuestionIndex === 1 &&
      responses["question1"] === "none" &&
      responses["question2"] === "No"
    ) {
      setCurrentQuestionIndex(2); // Skip to Q3
      return;
    }

    if (
      currentQuestionIndex === 2 &&
      responses["question1"] !== "none" &&
      responses["question2"] !== "No"
    ) {
      setCurrentQuestionIndex(3); // Skip to Q4
      return;
    }

    if (currentQuestionIndex === 3 && responses["question3"] === "Yes") {
      setCurrentQuestionIndex(4); // Skip to Q5
      return;
    }

    if (currentQuestionIndex === 3 && responses["question3"] === "No") {
      setCurrentQuestionIndex(5); // Skip to Q6
      return;
    }

    // Diagnosis logic
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const diagnosedCondition = Object.keys(conditionScores).reduce((a, b) =>
        conditionScores[a] > conditionScores[b] ? a : b
      );
      setDiagnosis(diagnosedCondition);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const isNextButtonDisabled = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return true;

    return !responses[`question-${currentQuestion.id}`];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="text-center py-4">
        <h2 className="text-3xl font-bold text-purple-600 mt-2">
          Diagnostic Questionnaire
        </h2>
      </header>
      <main className="flex-grow flex items-center justify-center mb-5">
        <motion.div
          className="bg-white shadow-lg rounded-lg p-4 mt-4 w-full max-w-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          {questions.length > 0 && currentQuestionIndex < questions.length ? (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                {questions[currentQuestionIndex]?.text}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestionIndex]?.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 bg-blue-100 p-2 rounded-full cursor-pointer hover:bg-green-200"
                  >
                    <input
                      type={questions[currentQuestionIndex]?.type === "checkbox" ? "checkbox" : "radio"}
                      name={`question-${questions[currentQuestionIndex]?.id}`}
                      value={option.value}
                      checked={
                        Array.isArray(responses[`question-${questions[currentQuestionIndex]?.id}`])
                          ? responses[`question-${questions[currentQuestionIndex]?.id}`].includes(option.value)
                          : responses[`question-${questions[currentQuestionIndex]?.id}`] === option.value
                      }
                      onChange={changeEvent}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                Diagnosis
              </h3>
              <p className="text-lg text-gray-600">
                Based on your responses, you may be experiencing symptoms of:{" "}
                <b>{diagnosis}</b>
              </p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {currentQuestionIndex > 0 && (
              <button
                className={`bg-blue-500 p-2 rounded text-white hover:bg-blue-600
                  ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handlePrevious}
              >
                Back
              </button>
            )}
            <button
              className={`bg-blue-500 p-2 rounded text-white hover:bg-blue-600 ${isNextButtonDisabled() ? "opacity-50 cursor-not-allowed" : ""
                }`}
              onClick={handleNext}
              disabled={isNextButtonDisabled()}
            >
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


