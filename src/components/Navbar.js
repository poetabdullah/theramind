import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="flex justify-between items-center bg-purple-800 text-white py-4 px-6 sticky top-0 z-50">
    <div className="text-2xl font-bold cursor-pointer hover:text-orange-500">
      <Link to="/">TheraMind</Link>
    </div>
    <ul className="flex gap-6">
      <li>
        <Link to="/#about" className="hover:text-orange-500">
          About
        </Link>
      </li>
      <li>
        <Link to="/Questionnaire" className="hover:text-orange-500">
          Questionnaire
        </Link>
      </li>
      <li>
        <Link to="/#services" className="hover:text-orange-500">
          Services
        </Link>
      </li>
      <li>
        <Link to="/meditation" className="hover:text-orange-500">
          Meditation
        </Link>
      </li>
      <li>
        <Link to="/#contact" className="hover:text-orange-500">
          Contact
        </Link>
      </li>
      <li>
        <Link
          to="/signup"
          className="bg-pink-500 px-4 py-2 rounded-md hover:bg-orange-400"
        >
          SignUp
        </Link>
      </li>
      <li>
        <Link
          to="/#login"
          className="bg-orange-500 px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Login
        </Link>
      </li>
    </ul>
  </nav>
);

export default Navbar;
