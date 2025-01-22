import React, { useState } from "react";
import Footer from "../components/Footer";

const QuestionnaireForm = () => {
  const [responses, setResponses] = useState({
    //Part 1: (Having a condition or not)
    //Options For Question 1
    depressedLonely: false,
    lossofInterest: false,
    repetitiveBehavior: false,
    difficultyBreathing: false,
    flashbacksNightmares: false,
    none: false,
    //Options For Question 2
    symptoms: "",
  });

  //Tracking the Current Question 
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const changeEvent = (event) => {
    const { name, value, checked, type } = event.target;
    setResponses((previousResponses) => ({
      ...previousResponses,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNext = () => {
    setCurrentQuestion((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentQuestion((prev) => prev - 1);
  };

  return (
    <>
      <div>
        <h2 className="text-customPurple shadow-md rounded-lg max-w-xl mx-auto">
          Questionnaire
        </h2>
      </div>
      {/* Question 1 */}
      {currentQuestion === 1 && (
        <>
          <div>
            <h3>Q1. Have you been feeling any of the following lately?</h3>
          </div>
          <div>
            <form>
              <label>
                <input
                  type="checkbox"
                  name="depressedLonely"
                  checked={responses.depressedLonely}
                  onChange={changeEvent}
                />
                Feeling depressed & lonely
              </label>
              <br></br>
              <label>
                <input
                  type="checkbox"
                  name="lossofInterest"
                  checked={responses.lossofInterest}
                  onChange={changeEvent}
                />
                Loss of interest in activities
              </label>
              <br></br>
              <label>
                <input
                  type="checkbox"
                  name="repetitiveBehavior"
                  checked={responses.repetitiveBehavior}
                  onChange={changeEvent}
                />
                Repetitive behaviors
              </label>
              <br></br>
              <label>
                <input
                  type="checkbox"
                  name="difficultyBreathing"
                  checked={responses.difficultyBreathing}
                  onChange={changeEvent}
                />
                Difficulty concentrating
              </label>
              <br></br>
              <label>
                <input
                  type="checkbox"
                  name="flashbacksNightmares"
                  checked={responses.flashbacksNightmares}
                  onChange={changeEvent}
                />
                Flashbacks/nightmares
              </label>
              <br></br>
              <label>
                <input
                  type="checkbox"
                  name="none"
                  checked={responses.none}
                  onChange={changeEvent}
                />
                None of the above
              </label>
              <br></br>
            </form>
          </div>
        </>
      )}

      {/* Question 1 */}
      {currentQuestion === 2 && (
        <>
          <div>
            <h3>Q2. Are you having any of the following symptoms lately; shortness of breath, constant worry,
              fatigue/prolonged muscle tension, insomnia, being easily startled, or spending time on compulsive
              behaviors?</h3>
          </div>
          <div>
            <form>
              <label>
                <input type="radio" name="symptoms" value="Yes" checked={responses.symptoms === "Yes"}
                  onChange={changeEvent} />Yes
              </label>
              <br></br>
              <label>
                <input type="radio" name="symptoms" value="No" checked={responses.symptoms === "No"}
                  onChange={changeEvent} />No
              </label>
            </form>
          </div>
        </>
      )}

      {/* Button To Submit */}
      <div class="flex justify-between mt-4">
        {currentQuestion > 1 && (
          <button class="bg-gray-300 p-2 rounded" onClick={handlePrevious}>Back</button>
        )}
        {currentQuestion < 2 && (
          <button class="bg-gray-300 p-2 rounded" onClick={handleNext}>Next</button>
        )}
      </div>

      <Footer />
    </>
  );
};
export default QuestionnaireForm;
