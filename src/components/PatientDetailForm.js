import React, { useState } from "react";

const PatientDetailForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    dob: "",
    location: "",
  });

  const [errors, setErrors] = useState({}); // Local state to track validation errors

  // Calculate max and min valid dates for the date picker
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  const minDate = new Date(
    today.getFullYear() - 50,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: null })); // Clear the error for the field being updated
  };

  const validateForm = () => {
    const { dob, location } = formData;
    const validationErrors = {};

    // Validate date of birth
    if (!dob) {
      validationErrors.dob = "Date of birth is required.";
    } else {
      const dobDate = new Date(dob);
      const calculatedAge = today.getFullYear() - dobDate.getFullYear();
      if (calculatedAge < 16 || calculatedAge > 50) {
        validationErrors.dob = "Patient must be between 16 and 50 years old.";
      }
    }

    // Validate location
    if (!location || location.length < 5) {
      validationErrors.location =
        "Location must be at least 5 characters long.";
    }

    setErrors(validationErrors); // Update errors in state
    return Object.keys(validationErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Pass valid data to parent component
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">
        Step 3: Enter Additional Details
      </h2>

      {/* Date of Birth Input */}
      <div className="mb-4">
        <input
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          className={`block w-full p-3 border ${
            errors.dob ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:border-orange-500`}
          min={minDate}
          max={maxDate}
        />
        {errors.dob && (
          <p className="text-red-500 text-sm mt-2">{errors.dob}</p>
        )}
      </div>

      {/* Location Input */}
      <div className="mb-4">
        <input
          name="location"
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className={`block w-full p-3 border ${
            errors.location ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:border-orange-500`}
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-2">{errors.location}</p>
        )}
      </div>

      {/* Continue Button */}
      <button
        type="submit"
        className="bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-400 w-full"
      >
        Continue
      </button>
    </form>
  );
};

export default PatientDetailForm;
