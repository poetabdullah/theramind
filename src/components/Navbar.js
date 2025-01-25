import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="flex justify-between items-center bg-purple-900 text-white py-4 px-8 shadow-lg sticky top-0 z-50">
    {/* Brand Logo */}
    <div className="text-3xl font-extrabold cursor-pointer -mt-2">
      <Link
        to="/"
        className="text-white hover:text-orange-400 transition-colors duration-300 no-underline"
      >
        TheraMind
      </Link>
    </div>
    {/* Navigation Links */}
    <ul className="flex items-center gap-8 text-lg font-medium">
      <li>
        <Link
          to="/#about"
          className="text-white no-underline hover:text-orange-400 transition-colors duration-300"
        >
          About
        </Link>
      </li>
      <li>
        <Link
          to="/Questionnaire"
          className="text-white no-underline hover:text-orange-400 transition-colors duration-300"
        >
          Questionnaire
        </Link>
      </li>
      <li>
        <Link
          to="/#services"
          className="text-white no-underline hover:text-orange-400 transition-colors duration-300"
        >
          Services
        </Link>
      </li>
      <li>
        <Link
          to="/meditation"
          className="text-white no-underline hover:text-orange-400 transition-colors duration-300"
        >
          Meditation
        </Link>
      </li>
      <li>
        <Link
          to="/#contact"
          className="text-white no-underline hover:text-orange-400 transition-colors duration-300"
        >
          Contact
        </Link>
      </li>
      <li>
        <Link
          to="/signup"
          className="bg-pink-500 px-4 py-2 rounded-lg text-white font-medium hover:bg-orange-400 transition-all duration-300 no-underline"
        >
          SignUp
        </Link>
      </li>
      <li>
        <Link
          to="/login"
          className="bg-orange-500 px-4 py-2 rounded-lg text-white font-medium hover:bg-purple-700 transition-all duration-300 no-underline"
        >
          Login
        </Link>
      </li>
    </ul>
  </nav>
);

export default Navbar;
