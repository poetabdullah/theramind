
import React from 'react';

const Navbar = () => (
  <nav className="navbar">
    <div className="logo">TheraMind</div>
    <ul className="nav-links">
      <li><a href="#about">About</a></li>
      <li><a href="/Questionnaire">Questionnaire</a></li>
      <li><a href="#services">Services</a></li>
      <li><a href="#how-it-works">How It Works</a></li>
      <li><a href="#contact">Contact</a></li>
      <li><a href="#signup" className="signup-btn">SignUp</a></li>
    </ul>
  </nav>
);

export default Navbar;