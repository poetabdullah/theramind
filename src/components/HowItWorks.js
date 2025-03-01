import React from 'react';

const HowItWorks = () => {
  const steps = [
    { id: 1, text: "Create your TheraMind account and fill out a brief questionnaire" },
    { id: 2, text: "Fill out a brief questionnaire" },
    { id: 3, text: "Share your particular diagnosis with an expert" },
    { id: 4, text: "Book sessions with an expert and get your personal treatment plan" },
    { id: 5, text: "Tell us what's your exact sign in your profile to experience your plan" },
    { id: 6, text: "Find your guidance, let the technology help you control your mind and enjoy the life" }
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
          
          <div className="illustration">
          <img 
               src="https://img.freepik.com/free-vector/hand-drawn-mindfulness-concept-with-characters_52683-69073.jpg?t=st=1740766289~exp=1740769889~hmac=737786ed35a5300828dbfc161c945b1ea47333bddd8a4197570bcf4abe9e0d9b&w=740">

               </img>
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