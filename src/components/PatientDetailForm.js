import React, { useState } from "react";

const PatientDetailForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    dob: "",
    gender: "",
    birthHistory: "",
    location: "",
  });

  const [errors, setErrors] = useState({});

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
    setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

  const validateForm = () => {
    const { dob, gender, birthHistory, location } = formData;
    const validationErrors = {};

    if (!dob) {
      validationErrors.dob = "Date of birth is required.";
    } else {
      const dobDate = new Date(dob);
      const calculatedAge = today.getFullYear() - dobDate.getFullYear();
      if (calculatedAge < 16 || calculatedAge > 50) {
        validationErrors.dob = "Patient must be between 16 and 50 years old.";
      }
    }

    if (!gender) {
      validationErrors.gender = "Gender is required.";
    }

    if (gender === "Female" && !birthHistory) {
      validationErrors.birthHistory =
        "Please specify if you have given birth in the past year.";
    }

    if (!location || location.length < 5) {
      validationErrors.location =
        "Location must be at least 5 characters long.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-xl shadow-md max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold text-center mb-4 text-indigo-700">
        Step 3: Additional Details
      </h2>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-yellow-700 font-medium">
          <span className="font-bold">Important:</span> TheraMind only provides
          mental health services for patients aged 16-50. Please ensure your
          date of birth is accurate.
        </p>
      </div>
      {/* Date of Birth Input */}
      <div className="mb-5">
        <label className="block font-medium mb-1 text-gray-700">
          Date of Birth
        </label>
        <input
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          className={`block w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.dob ? "border-red-500" : "border-gray-300"
          }`}
          min={minDate}
          max={maxDate}
        />
        {errors.dob && (
          <p className="text-red-500 text-sm mt-2">{errors.dob}</p>
        )}
      </div>

      {/* Gender Selection */}
      <div className="mb-5">
        <label className="block font-medium mb-1 text-gray-700">Gender</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        {errors.gender && (
          <p className="text-red-500 text-sm mt-2">{errors.gender}</p>
        )}
      </div>

      {/* Birth History (Only if Female) */}
      {formData.gender === "Female" && (
        <div className="mb-5">
          <label className="block font-medium text-gray-700">
            Have you given birth in the past year?
          </label>
          <div className="flex gap-4 mt-2">
            {["Yes", "No"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, birthHistory: option })
                }
                className={`px-4 py-2 rounded-lg transition focus:outline-none ${
                  formData.birthHistory === option
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {errors.birthHistory && (
            <p className="text-red-500 text-sm mt-2">{errors.birthHistory}</p>
          )}
        </div>
      )}

      {/* Location Input */}
      <div className="mb-5">
        <label className="block font-medium mb-1 text-gray-700">Location</label>
        <input
          name="location"
          type="text"
          placeholder="Enter your location"
          value={formData.location}
          onChange={handleChange}
          className={`block w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.location ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-2">{errors.location}</p>
        )}
      </div>

      {/* Continue Button */}
      <button
        type="submit"
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 
  hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white 
  font-medium rounded-lg transition duration-200"
      >
        Continue
      </button>
    </form>
  );
};

export default PatientDetailForm;
