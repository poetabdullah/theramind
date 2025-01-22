import React from 'react';
import { useNavigate } from 'react-router-dom';

const DiagnosticQuestionnaire = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/questionnaire');
  };

  return (
    <div className="badge">
      <h1>Diagnostic Questionnaire</h1>
      <p>This questionnaire helps you diagnose the mental health condition you are facing.</p>
      <button className="action-btn" onClick={handleStart}>Start</button>
    </div>
  );
};

export default DiagnosticQuestionnaire;
