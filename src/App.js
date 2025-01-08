// App.js
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
    <p>Not until we’re lost do we begin to understand ourselves.</p>
    <button className="action-btn">Take Action</button>
  </div>
);

// Services Component
const Services = () => (
  <section id="services" className="services">
    <h2>Get better, faster, with quality mental health care</h2>
    <div className="services-grid">
      <div className="service-item">
        <h3>Schedule Virtual Sessions</h3>
        <p>Connect with professional therapists online for personalized support.</p>
      </div>
      <div className="service-item">
        <h3>Get Personalized Assessments</h3>
        <p>AI-powered tools for tailored mental health insights.</p>
      </div>
      <div className="service-item">
        <h3>Chat or Talk to Experts</h3>
        <p>24/7 support from certified mental health professionals.</p>
      </div>
      <div className="service-item">
        <h3>Education</h3>
        <p>Explore articles and resources to better understand mental health.</p>
      </div>
    </div>
  </section>
);

// How It Works Component
const HowItWorks = () => (
  <section id="how-it-works" className="how-it-works">
    <h2>How TheraMind Works?</h2>
    <p>We make mental health care accessible and efficient with these simple steps:</p>
    <ol className="steps-list">
      <li>Create an account to get started.</li>
      <li>Take a brief assessment to help us understand your needs.</li>
      <li>Match with a therapist tailored to your preferences.</li>
      <li>Start your journey to better mental health with regular sessions.</li>
    </ol>
    <img src="/path-to-your-image.png" alt="How TheraMind Works" className="how-it-works-image" />
  </section>
);

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