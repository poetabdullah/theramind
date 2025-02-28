import React from "react";

 const TestPrompt = () => {
    return (
      <div className="test-container">
         <div className="test-image-section">
        <img src="https://img.freepik.com/free-vector/urinalysis-abstract-concept-vector-illustration-diabetes-diagnostics-urinalysis-result-urine-analysis-laboratory-testing-service-health-problem-detection-pregnancy-test-abstract-metaphor_335657-4042.jpg?t=st=1740751412~exp=1740755012~hmac=9f951470499d38955236139b244771bf90338b1f74b58b41eabdc1ccac03c3bb&w=740" alt="Peaceful Meditation" className="test-image" />
      </div>
      <div className="text-section">
        <h2 className="title">Take our quick Questionnaire! "How are you feeling?"</h2>
        <p className="description">
        It only takes a few minutes. Let’s get started and see if we can help you!
        </p>
        <a href="/questionnaire" className="cta-button">Fill the Questionnaire</a>
      </div>
    </div>
    );
  };

  export default TestPrompt;