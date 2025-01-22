import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="flex justify-between items-center bg-purple-800 text-white py-4 px-6 sticky top-0 z-50">
    <div className="text-2xl font-bold cursor-pointer hover:text-orange-500">
      <a href="/">TheraMind</a>
    </div>
    <ul className="flex gap-6">
      <li>
        <a href="#about" className="hover:text-orange-500">
          About
        </a>
      </li>
      <li>
        <a href="/questionnaire">questionnaire</a>
      </li>
      <li>
        <a href="#services" className="hover:text-orange-500">
          Services
        </a>
      </li>
      <li>
        <a href="/Meditation">Meditation</a>
      </li>
      <li>
        <a href="#contact" className="hover:text-orange-500">
          Contact
        </a>
      </li>
      <li>
        <a
          href="./page/SignUpPage"
          className="bg-pink-500 px-4 py-2 rounded-md hover:bg-orange-400"
        >
          SignUp
        </a>
      </li>
      <li>
        <a
          href="#login"
          className="bg-orange-500 px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Login
        </a>
      </li>
    </ul>
  </nav>
);

export default Navbar;
