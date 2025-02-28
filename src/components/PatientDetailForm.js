import React, { useState } from "react";

const PatientDetailForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    dob: "",
    gender: "",
    birthHistory: "", // Only applicable if gender is female
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
    setErrors((prevErrors) => ({ ...prevErrors, [name]: null })); // Clear error when user updates field
  };

  const validateForm = () => {
    const { dob, gender, birthHistory, location } = formData;
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

    // Validate gender selection
    if (!gender) {
      validationErrors.gender = "Gender is required.";
    }

    // Validate birth history if gender is female
    if (gender === "Female" && !birthHistory) {
      validationErrors.birthHistory =
        "Please specify if you have given birth in the past year.";
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

      <p className="text-center text-gray-600 mb-4">
        TheraMind provides mental health services for patients aged 16-50.
      </p>

      {/* Date of Birth Input */}
      <div className="mb-4">
        <label className="block font-semibold">Date of Birth</label>
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

      {/* Gender Selection */}
      <div className="mb-4">
        <label className="block font-semibold">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {errors.gender && (
          <p className="text-red-500 text-sm mt-2">{errors.gender}</p>
        )}
      </div>

      {/* Birth History (Shown only if gender is Female) */}
      {formData.gender === "Female" && (
        <div className="mb-4">
          <label className="block font-semibold">
            Have you given birth in the past year?
          </label>
          <div className="flex gap-4 mt-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="birthHistory"
                value="Yes"
                checked={formData.birthHistory === "Yes"}
                onChange={handleChange}
                className="mr-2"
              />
              Yes
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="birthHistory"
                value="No"
                checked={formData.birthHistory === "No"}
                onChange={handleChange}
                className="mr-2"
              />
              No
            </label>
          </div>
          {errors.birthHistory && (
            <p className="text-red-500 text-sm mt-2">{errors.birthHistory}</p>
          )}
        </div>
      )}

      {/* Location Input */}
      <div className="mb-4">
        <label className="block font-semibold">Location</label>
        <input
          name="location"
          type="text"
          placeholder="Enter your location"
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
