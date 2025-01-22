import React, { useState } from "react";

const PatientSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dob: "",
  });

  const [error, setError] = useState("");

  // Validation function
  const validateForm = () => {
    const { firstName, lastName, email, password, dob } = formData;

    const today = new Date();
    const dobDate = new Date(dob);
    const age = today.getFullYear() - dobDate.getFullYear();

    // Check age range
    if (isNaN(dobDate.getTime()) || age < 16 || age > 50) {
      return "Patient must be between 16 and 50 years old.";
    }

    // Check if all fields are filled
    if (!firstName || !lastName || !email || !password || !dob) {
      return "All fields are required.";
    }

    return ""; // No error
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    setError("");
    console.log("Patient form data submitted:", formData);
    // TODO: Add Firebase integration here
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">
          Patient SignUp
        </h2>
        <form>
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            type="text"
            placeholder="First Name"
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            type="text"
            placeholder="Last Name"
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            type="email"
            placeholder="Email Address"
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            type="date"
            placeholder="Date of Birth"
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            type="password"
            placeholder="Password"
          />
          <button className="block w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-400">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientSignup;
