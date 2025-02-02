import React, { useState } from "react";
import "./questionnaire.css";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import { db } from "../firebaseConfig";

const Questionnaire = () => {
  const [responses, setResponses] = useState({
    depressedLonely: false,
    lossofInterest: false,
    repetitiveBehavior: false,
    difficultyBreathing: false,
    flashbacksNightmares: false,
    none: false,
    symptoms: "",
    suicidalThoughts: "",
  });

  const [conditionScores, setConditionScores] = useState({
    Stress: 0,
    Anxiety: 0,
    Depression: 0,
    Trauma: 0,
    OCD: 0,
  });

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [diagnosis, setDiagnosis] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});

  const questions = [
    {
      text: "Which of the following situations are you facing these days?",
      options: [
        {
          label:
            "Overwhelmed/irritated by minor issues & daily life activities ",
          condition: "Stress",
        },
        {
          label:
            "Constantly feeling anxious and nervous about things and situations without a clear reason",
          condition: "Anxiety",
        },
        {
          label: "Feeling sad, depressed & lonely all the time",
          condition: "Depression",
        },
        {
          label:
            "Experienced a traumatic incident in life & having recurring thoughts about it",
          condition: "Trauma",
        },
        {
          label:
            "Obsessing over some particular things & feeling the need to make things “just right”",
          condition: "OCD",
        },
      ],
    },
    {
      text: "Are you facing any of the following symptoms these days?",
      options: [
        {
          label: "Feeling overburdened by tasks & responsibilities",
          condition: "Stress",
        },
        {
          label:
            "Feeling anxious & experiencing palpitations (racing of the heartbeat)",
          condition: "Anxiety",
        },
        {
          label:
            "Feeling tired for most of the day even when you haven’t done anything",
          condition: "Depression",
        },
        {
          label:
            "Having nightmares & feeling startled/frightened about a traumatic incident",
          condition: "Trauma",
        },
        {
          label: "Feeling irritated when things are not going a certain way",
          condition: "OCD",
        },
      ],
    },
    {
      text: "How would you describe your overall mood recently?",
      options: [
        { label: "Feeling a bit overloaded with tasks", condition: "Stress" },
        { label: "Mostly worried or tense", condition: "Anxiety" },
        {
          label: "Frequently feeling sad, lonely & empty",
          condition: "Depression",
        },
        {
          label: "Feeling fearful thinking about a past event",
          condition: "Trauma",
        },
        {
          label: "Feeling the urge to make things symmetrical & clean",
          condition: "OCD",
        },
      ],
    },
    {
      text: "Which of the following behavioral symptoms have you been facing lately?",
      options: [
        {
          label: "Changes in eating habits (overeating & loss of appetite)",
          condition: "Stress",
        },
        {
          label: "Avoiding situations that trigger anxiety",
          condition: "Anxiety",
        },
        { label: "Withdrawal from social gatherings", condition: "Depression" },
        {
          label: "Risk-taking or self-destructive behavior",
          condition: "Trauma",
        },
        {
          label:
            "Excess cleaning, constantly arranging & repeatedly checking things",
          condition: "OCD",
        },
      ],
    },
  ];

  const changeEvent = (event) => {
    const { name, value, checked, type } = event.target;
    setResponses((previousResponses) => ({
      ...previousResponses,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOptionSelect = (questionIndex, condition) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionIndex]: condition,
    }));
    setConditionScores((prevScores) => ({
      ...prevScores,
      [condition]: prevScores[condition] + 1,
    }));
  };

  const handleNext = () => {
    // If "None" is selected and symptoms = "No", skip to Question 3
    if (
      currentQuestion === 1 &&
      responses.none &&
      responses.symptoms === "No"
    ) {
      setCurrentQuestion(3);
      return;
    }

    // Skip Question 3 if "None" is not selected and symptoms = "Yes"
    if (
      currentQuestion === 2 &&
      !responses.none &&
      responses.symptoms === "Yes"
    ) {
      setCurrentQuestion(4);
      return;
    }

    // Move to Question 5 if suicidal thoughts = "Yes"
    if (currentQuestion === 4 && responses.suicidalThoughts === "Yes") {
      setCurrentQuestion(5);
      return;
    }

    if (currentQuestion === 4 && responses.suicidalThoughts === "No") {
      setCurrentQuestion(6);
      return;
    }

    if (currentQuestion < 5 + questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const maxCondition = Object.keys(conditionScores).reduce((a, b) =>
        conditionScores[a] > conditionScores[b] ? a : b
      );
      setDiagnosis(maxCondition);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestion((prev) => prev - 1);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  const isNextButtonDisabled = () => {
    if (currentQuestion === 1) {
      return !(
        responses.depressedLonely ||
        responses.lossofInterest ||
        responses.repetitiveBehavior ||
        responses.difficultyBreathing ||
        responses.flashbacksNightmares ||
        responses.none
      );
    }
    if (currentQuestion === 2) {
      return !responses.symptoms;
    }
    if (currentQuestion === 3 && responses.none && responses.symptoms) {
      return true;
    }
    if (currentQuestion === 4) {
      return !responses.suicidalThoughts;
    }
    if (currentQuestion === 5 && responses.suicidalThoughts === "Yes") {
      return true;
    }
    return false;
  };

  const isBackButtonDisabled = () => {
    if (
      currentQuestion === 3 &&
      responses.none &&
      responses.symptoms === "No"
    ) {
      return true;
    }
    if (currentQuestion === 5 && responses.suicidalThoughts === "Yes") {
      return true;
    }
    return false;
  };

  const shouldShowQuestion4 = currentQuestion === 4;

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
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Question 1 */}
          {currentQuestion === 1 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Question 1: Have you been feeling any of the following lately?
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    name: "depressedLonely",
                    label: "Feeling depressed and lonely",
                  },
                  {
                    name: "lossofInterest",
                    label: "Loss of interest in activities",
                  },
                  { name: "repetitiveBehavior", label: "Repetitive behaviors" },
                  {
                    name: "difficultyBreathing",
                    label: "Difficulty concentrating",
                  },
                  {
                    name: "flashbacksNightmares",
                    label: "Flashbacks/nightmares",
                  },
                  { name: "none", label: "None of the above" },
                ].map((option) => (
                  <label
                    key={option.name}
                    className="flex items-center space-x-2 bg-blue-100 p-2 rounded-full cursor-pointer hover:bg-green-200"
                  >
                    <input
                      type="checkbox"
                      name={option.name}
                      checked={responses[option.name]}
                      onChange={changeEvent}
                      className="form-checkbox h-5 w-5 text-blue-600"
                      disabled={option.name === "none" ? false : responses.none}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Question 2 */}
          {currentQuestion === 2 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Question 2: Are you having any of the following symptoms lately;
                shortness of breath, constant worry, fatigue/prolonged muscle
                tension, insomnia, being easily startled, or spending time on
                compulsive behaviors?
              </h3>
              <div className="flex flex-col space-y-3">
                <label className="flex items-center space-x-2 bg-blue-100 p-2 rounded-full cursor-pointer hover:bg-green-200">
                  <input
                    type="radio"
                    name="symptoms"
                    value="Yes"
                    checked={responses.symptoms === "Yes"}
                    onChange={changeEvent}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  Yes
                </label>
              </div>
              <div className="flex flex-col space-y-3 mt-3">
                <label className="flex items-center space-x-2 bg-blue-100 p-2 rounded-full cursor-pointer hover:bg-green-200">
                  <input
                    type="radio"
                    name="symptoms"
                    value="No"
                    checked={responses.symptoms === "No"}
                    onChange={changeEvent}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  No
                </label>
              </div>
            </div>
          )}

          {/* Question 3 */}
          {currentQuestion === 3 && (
            <div>
              <h3>
                Thank you for taking TheraMind's diagnostic questionnaire!
              </h3>
              <p>
                Based on the response you have submitted, you are not diagnosed
                with any of the following mental health conditions.
              </p>
            </div>
          )}
          {/* Question 4 */}
          {currentQuestion === 4 && shouldShowQuestion4 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Have you had any thoughts of ending your life?
              </h3>
              <div className="flex flex-col space-y-3">
                <label className="flex items-center space-x-2 bg-blue-100 p-2 rounded-full cursor-pointer hover:bg-green-200">
                  <input
                    type="radio"
                    name="suicidalThoughts"
                    value="Yes"
                    checked={responses.suicidalThoughts === "Yes"}
                    onChange={changeEvent}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  Yes
                </label>
              </div>
              <div className="flex flex-col space-y-3 mt-3">
                <label className="flex items-center space-x-2 bg-blue-100 p-2 rounded-full cursor-pointer hover:bg-green-200">
                  <input
                    type="radio"
                    name="suicidalThoughts"
                    value="No"
                    checked={responses.suicidalThoughts === "No"}
                    onChange={changeEvent}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  No
                </label>
              </div>
            </div>
          )}

          {/* Question 5 */}
          {currentQuestion === 5 && responses.suicidalThoughts === "Yes" && (
            <div>
              <h2 className="text-red-800">Suicidal Thoughts!</h2>
              <h3>
                You have been diagnosed with Suicidal Thoughts, you need to
                contact an emergency hotline, your life could be in danger and
                we care for you, so here are some of the emergency contacts you
                can get help from.
              </h3>
              <p>
                <h3>Emergency Hotlines:</h3>
                Umang: (92) 0311 7786264 <br></br>
                Rozan: (92) 0304 111 1741 <br></br>
                Welfare Bureau: 1121
              </p>
              <p>
                It is important to talk to someone right away. If you are in
                immediate danger, please dial 911.
              </p>
              <p>
                If you need someone to talk to, consider reaching out to a
                helpline, counselor, or a trusted individual.
              </p>
              <p>Your safety and well-being are a priority.</p>
            </div>
          )}
          {/* Question 6 */}
          {currentQuestion > 5 && currentQuestion - 6 < questions.length && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Question {currentQuestion} :{" "}
                {questions[currentQuestion - 6].text}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {questions[currentQuestion - 6].options.map((option, index) => (
                  <label
                    key={index}
                    className="bg-blue-100 p-2 rounded-full hover:bg-green-200 text-left"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion - 6}`}
                      value={option.condition}
                      checked={
                        selectedOptions[currentQuestion - 6] ===
                        option.condition
                      }
                      onChange={() =>
                        handleOptionSelect(
                          currentQuestion - 6,
                          option.condition
                        )
                      }
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentQuestion > 5 + questions.length && (
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
            <button
              className="bg-blue-500 p-2 rounded text-white hover:bg-blue-600"
              onClick={handleNext}
            >
              Next
            </button>
          </div>

          {/* Next & Back Buttons */}
          <div className="flex justify-between mt-6">
            {currentQuestion > 1 && (
              <button
                className={`bg-gray-300 p-2 rounded hover:bg-gray-400 ${
                  isBackButtonDisabled() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handlePrevious}
              >
                Back
              </button>
            )}
            <button
              className={`bg-blue-500 p-2 rounded text-white hover:bg-blue-600 ${
                isNextButtonDisabled() ? "opacity-50 cursor-not-allowed" : ""
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
