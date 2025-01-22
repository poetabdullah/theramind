import React, { useState } from 'react';
import Footer from '../components/Footer';

const QuestionnaireForm = () => {
  const [responses, setResponses] = useState({
    depressedLonely: false,
    lossofInterest: false,
    repetitiveBehavior: false,
    difficultyBreathing: false,
    flashbacksNightmares: false,
    none: false,
  });

  const changeEvent = (event) => {
    const { name, checked } = event.target;
    setResponses((previousResponses) => ({
      ...previousResponses,
      [name]: checked,
    }));
  };
  return (<>
    <div>
      <h2 className='text-customPurple shadow-md rounded-lg max-w-xl mx-auto'>Questionnaire</h2>
    </div>
    <div>
      <h3>Q1. Have you been feeling any of the following lately?</h3>
    </div>
    <div>
      <form>
        <label>
          <input type="checkbox" name="depressedLonely" checked={responses.depressedLonely}
            onChange={changeEvent}>Feeling depressed & lonely</input>
        </label>
        <br></br>
        <label>
          <input type="checkbox" name="lossofInterest" checked={responses.lossofInterest}
            onChange={changeEvent}>Loss of interest in activities</input>
        </label>
        <br></br>
        <label>
          <input type="checkbox" name="repetitiveBehavior" checked={responses.repetitiveBehavior}
            onChange={changeEvent}>Repetitive behaviors</input>
        </label>
        <br></br>
        <label>
          <input type="checkbox" name="difficultyBreathing" checked={responses.difficultyBreathing}
            onChange={changeEvent}>Difficulty concentrating</input>
        </label>
        <br></br>
        <label>
          <input type="checkbox" name="flashbacksNightmares" checked={responses.flashbacksNightmares}
            onChange={changeEvent}>Flashbacks/nightmares</input>
        </label>
        <br></br>
        <label>
          <input type="checkbox" name="none" checked={responses.none}
            onChange={changeEvent}>None of the above</input>
        </label>
        <br></br>
      </form>
    </div>
    <Footer />
  </>
  );
};
export default QuestionnaireForm;
