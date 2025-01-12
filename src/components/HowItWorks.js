import React from 'react';

const HowItWorks = () => {
  const steps = [
    { id: 1, text: "Create your TheraMind account and fill out a brief questionnaire" },
    { id: 2, text: "Tell your particular diagnosis" },
    { id: 3, text: "Get yourself more relaxed with the meditation exercises" },
    { id: 4, text: "Tell us what's your exact sign in your profile to experience your plan" },
    { id: 5, text: "Find your guidance, let the technology help you control your mind and enjoy the life" }
  ];

  const stats = [
    { title: "Anxiety Improved", percentage: "85%" },
    { title: "Focus Recovered", percentage: "75%" },
    { title: "Sleep Restored", percentage: "80%" },
    { title: "Digital Platform's response", percentage: "90%" }
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works-container">
        <h2>How TheraMind Works?</h2>
        
        <div className="steps-container">
          <div className="steps-list">
            {steps.map((step) => (
              <div key={step.id} className="step-item">
                <div className="step-number">{step.id}</div>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
          
          <div className="gradient-image">
            {/* Gradient background image */}
          </div>
        </div>

        <div className="stats-section">
          <h3>The numbers speak for themselves</h3>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-percentage">{stat.percentage}</div>
                <h4 className="stat-title">{stat.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;