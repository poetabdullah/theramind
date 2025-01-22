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
    //Part 2: (Suicidal Thoughts)
    // Options For Question 3
    suicidalThoughts: "",
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
    if (currentQuestion === 4 && responses.suicidalThoughts === "Yes") {
      setCurrentQuestion(5);
      return;
    }
    if (currentQuestion === 2 && responses.symptoms === "Yes" && (
      responses.depressedLonely ||
      responses.lossofInterest ||
      responses.repetitiveBehavior ||
      responses.difficultyBreathing ||
      responses.flashbacksNightmares
    )) {
      setCurrentQuestion(4);
      return;
    }
    if (currentQuestion === 2 && responses.none === true && responses.symptoms === "No") {
      setCurrentQuestion(3);
      return;
    }
    if (currentQuestion === 4 && responses.suicidalThoughts === "No") {
      setCurrentQuestion(3);
      return;
    }
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

      {currentQuestion === 3 && (
        <>
          <div>
            <h3>Thank you for taking TheraMind's diagnostic questionnaire!</h3>
            <p>Based on the response you have submitted you are not diagnosed with any of the following
              mental health conditions (Stress, Anxiety, Depression, Trauma, OCD) and its subtypes.</p>
          </div>
        </>
      )}

      {/* Question 4 */}
      {currentQuestion === 4 && (
        <>
          <div>
            <h3>Q3. Have you had any thought that it was better if you were dead, or are you planning on
              ending your life?</h3>
          </div>
          <div>
            <form>
              <label>
                <input type="radio" name="suicidalThoughts" value="Yes"
                  checked={responses.suicidalThoughts === "Yes"} onChange={changeEvent} />Yes
              </label>
              <br></br>
              <label>
                <input type="radio" name="suicidalThoughts" value="No"
                  checked={responses.suicidalThoughts === "No"} onChange={changeEvent} />No
              </label>
            </form>
          </div>
        </>
      )}

      {currentQuestion === 5 && responses.suicidalThoughts === "Yes" && (
        <>
          <div>
            <h2 className="text-red-100">Suicidal Thoughts!</h2>
            <h3>You have been diagnosed with Suicidal Thoughts, you need to contact an emergency hotline,
              your life could be in danger and we care for you, so here are some of the emergency contacts
              you can get help from.</h3>
            <p>
              <h3>Emergency Hotlines:</h3>
              Umang: (92) 0311 7786264 <br></br>
              Rozan: (92) 0304 111 1741 <br></br>
              Welfare Bureau: 1121
            </p>
            <p>It is important to talk to someone right away. If you are in immediate danger, please dial 911.</p>
            <p>If you need someone to talk to, consider reaching out to a helpline, counselor, or a trusted individual.</p>
            <p>Your safety and well-being are a priority.</p>
          </div>
        </>
      )}

      {/* Button To Submit */}
      <div className="flex justify-between mt-4">
        {currentQuestion > 1 && currentQuestion < 3 && (
          <button className="bg-gray-300 p-2 rounded" onClick={handlePrevious}>Back</button>
        )}
        {currentQuestion === 1 && (
          <button className="bg-gray-300 p-2 rounded" onClick={handleNext}
            disabled={!(responses.depressedLonely ||
              responses.lossofInterest ||
              responses.repetitiveBehavior ||
              responses.difficultyBreathing ||
              responses.flashbacksNightmares ||
              responses.none
            )}>Next</button>
        )}

        {currentQuestion === 2 && (
          <button className="bg-gray-300 p-2 rounded" onClick={handleNext}
            disabled={!responses.symptoms}>Next</button>
        )}

        {currentQuestion === 4 && (
          <button className="bg-gray-300 p-2 rounded" onClick={handleNext}
            disabled={!responses.suicidalThoughts}>Next</button>
        )}
      </div>

      <Footer />
    </>
  );
};
export default QuestionnaireForm;