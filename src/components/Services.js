import React from 'react';

// Services Component
const Services = () => (
  <section id="services" className="services">
    <h2 className="services-title">Get better, faster, with quality mental health care</h2>
    <div className="services-grid">
      <div className="service-card">
        <h3>Schedule Virtual Appointments</h3>
        <p>You can schedule virtual appointments with licensed clinical psychologists on TheraMind, who will guide you in your self-healing journey.</p>
        <button className="service-btn">Book a Session</button>
      </div>
      
      <div className="service-card">
        <h3>Get Personalized Treatment Plan</h3>
        <p>Based on assessment by the doctors, you will have an easy to follow daily actionable treatment plan that will track your healing journey.</p>
        <button className="service-btn">Get yourself better</button>
      </div>
      
      <div className="service-card">
        <h3>Chat with Digital Assistant</h3>
        <p>Chat with our top-notch Generative AI assistant that will support you your healing journey. It will provide you with guided assistance.</p>
        <button className="service-btn">Chat with AI</button>
      </div>
      
      <div className="service-card">
        <h3>Practice Meditation</h3>
        <p>Practice Meditation and Mindfulness, which will help you in your healing journey. Get step by step instructions on how to practice meditation.</p>
        <button className="service-btn">Explore Exercises</button>
      </div>
    </div>
  </section>
);


export default Services;