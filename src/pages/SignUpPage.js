// Useless page

import React, { useState } from "react";
import DoctorSignup from "../components/DoctorSignup";
import PatientSignup from "../components/PatientSignup";
import Footer from "../components/Footer";

const SignUpPage = () => {
  const [activeForm, setActiveForm] = useState("patient");

  const toggleForm = (form) => {
    setActiveForm(form);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {" "}
      <div className="flex-grow flex items-center justify-center">
        {" "}
        <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              className={`py-2 px-4 rounded transition-colors duration-300 ${
                activeForm === "patient"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => toggleForm("patient")}
            >
              Patient
            </button>
            <button
              className={`py-2 px-4 rounded transition-colors duration-300 ${
                activeForm === "doctor"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => toggleForm("doctor")}
            >
              Doctor
            </button>
          </div>

          <div className="relative">
            <div
              className={`transition-opacity duration-700 ease-in-out ${
                activeForm === "patient"
                  ? "opacity-100"
                  : "opacity-0 absolute pointer-events-none"
              }`}
            >
              <PatientSignup />
            </div>
            <div
              className={`transition-opacity duration-700 ease-in-out ${
                activeForm === "doctor"
                  ? "opacity-100"
                  : "opacity-0 absolute pointer-events-none"
              }`}
            >
              <DoctorSignup />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUpPage;
