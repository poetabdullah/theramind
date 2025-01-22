import React, { useState } from "react";

const DoctorSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    licenseNumber: "",
    nic: "",
    city: "",
    country: "",
    experience: "",
    specialization: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Validation function
  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      dob,
      licenseNumber,
      nic,
      city,
      country,
      experience,
      specialization,
      password,
    } = formData;

    const today = new Date();
    const dobDate = new Date(dob);
    const age = today.getFullYear() - dobDate.getFullYear();

    // Check minimum age
    if (isNaN(dobDate.getTime()) || age < 23) {
      return "Doctor must be at least 23 years old as per TheraMind's policies.";
    }

    // Validate license number (Pakistan format: 5 digits)
    const licenseRegex = /^[0-9]{5}$/;
    if (!licenseRegex.test(licenseNumber)) {
      return "License number must be a 5-digit number.";
    }

    // Validate NIC (Pakistan format: 13 digits)
    const nicRegex = /^[0-9]{13}$/;
    if (!nicRegex.test(nic)) {
      return "National Identity Card (NIC) number must be 13 digits.";
    }

    // Validate experience
    if (Number(experience) < 2) {
      return "Doctor must have at least 2 years of experience as per TheraMind's policies.";
    }

    // Validate specialization
    if (
      ![
        "Counselling",
        "Therapy",
        "Psychology",
        "Psychiatry",
        "Psychotherapy",
      ].includes(specialization)
    ) {
      return "Specialization must be one of the predefined options as per TheraMind's policies.";
    }

    // Check if all fields are filled
    if (
      !firstName ||
      !lastName ||
      !email ||
      !dob ||
      !licenseNumber ||
      !nic ||
      !city ||
      !country ||
      !experience ||
      !specialization ||
      !password
    ) {
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
    console.log("Doctor form data submitted:", formData);
    // TODO: Add Firebase integration here
  };

  return (
    <div className="flex justify-center items-center py-12 min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">
          Doctor SignUp
        </h2>
        <form>
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            type="text"
            placeholder="First Name"
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            type="text"
            placeholder="Last Name"
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            type="email"
            placeholder="Email Address"
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            type="date"
            placeholder="Date of Birth"
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            type="text"
            placeholder="License Number"
          />
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            type="text"
            placeholder="National Identity Card Number"
          />
          <div className="flex gap-2 mb-4">
            <input
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              type="text"
              placeholder="City"
            />
            <input
              className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              type="text"
              placeholder="Country"
            />
          </div>
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            type="number"
            placeholder="Years of Experience"
          />
          <select className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500">
            <option disabled selected>
              Select Specialization
            </option>
            <option>Counselling</option>
            <option>Therapy</option>
            <option>Psychology</option>
            <option>Psychiatry</option>
            <option>Psychotherapy</option>
          </select>
          <input
            className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            type="password"
            placeholder="Password"
          />
          <button className="block w-full bg-purple-700 text-white py-2 rounded-lg hover:bg-purple-600">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorSignup;
