import React from 'react';
import './App.css';

// Navbar Component
const Navbar = () => (
  <nav className="navbar">
    <div className="logo">TheraMind</div>
    <ul className="nav-links">
      <li><a href="#about">About</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#how-it-works">How It Works</a></li>
      <li><a href="#contact">Contact</a></li>
      <li><a href="#signup" className="signup-btn">Sign Up</a></li>
    </ul>
  </nav>
);

// Banner Component
const Banner = () => (
  <div className="banner">
    <h1>Welcome to TheraMind!</h1>
    <p>Not until we're lost do we begin to understand ourselves.</p>
    <button className="action-btn">Take Action</button>
  </div>
);

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

// Updated How It Works Component
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

// Contact Component
const Contact = () => (
  <section id="contact" className="contact">
    <h2>Contact Us</h2>
    <form>
      <input type="text" placeholder="Your Name" required />
      <input type="email" placeholder="Your Email" required />
      <textarea placeholder="Your Message" required></textarea>
      <button type="submit">Send Message</button>
    </form>
  </section>
);

// Footer Component
const Footer = () => (
  <footer className="footer">
    <p>© 2025 TheraMind. All rights reserved.</p>
  </footer>
);

function App() {
  return (
    <div className="App">
      <Navbar />
      <Banner />
      <Services />
      <HowItWorks />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;