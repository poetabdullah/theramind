import React, { useState } from "react";

const PatientDetailForm = ({ onSubmit, error }) => {
  const [formData, setFormData] = useState({
    dob: "",
    location: "",
  });

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { dob, location } = formData;
    const dobDate = new Date(dob);
    const calculatedAge = today.getFullYear() - dobDate.getFullYear();

    // Validation logic
    const validationErrors = {};
    if (!dob) {
      validationErrors.dob = "Date of birth is required.";
    } else if (calculatedAge < 16 || calculatedAge > 50) {
      validationErrors.dob = "Patient must be between 16 and 50 years old.";
    }

    if (!location || location.length < 5) {
      validationErrors.location =
        "Location must be at least 5 characters long.";
    }

    if (Object.keys(validationErrors).length > 0) {
      onSubmit(validationErrors); // Pass errors to parent
    } else {
      onSubmit({ dob, location }); // Pass valid data to parent
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">
        Step 2: Enter Additional Details
      </h2>

      {/* Date of Birth Input */}
      <div className="mb-4">
        <input
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          min={minDate}
          max={maxDate}
          required
        />
        {error?.dob && <p className="text-red-500 text-sm mt-2">{error.dob}</p>}
      </div>

      {/* Location Input */}
      <div className="mb-4">
        <input
          name="location"
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
          required
        />
        {error?.location && (
          <p className="text-red-500 text-sm mt-2">{error.location}</p>
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
