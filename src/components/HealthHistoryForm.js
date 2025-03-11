// Component of the signup page and inspiration for the patient dashboard as well
import React, { useState } from "react";

const HealthHistoryForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    mentalHealthConditions: [],
    familyHistory: "",
    significantTrauma: "",
    childhoodChallenges: "",
  });

  const [error, setError] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (e.target.type === "checkbox") {
      setFormData((prevData) => {
        const updatedConditions = prevData.mentalHealthConditions.includes(
          value
        )
          ? prevData.mentalHealthConditions.filter((item) => item !== value)
          : [...prevData.mentalHealthConditions, value];
        return { ...prevData, mentalHealthConditions: updatedConditions };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const newError = {};
    if (formData.mentalHealthConditions.length === 0) {
      newError.mentalHealthConditions =
        "Please select at least one mental health condition.";
    }
    if (!formData.familyHistory) {
      newError.familyHistory = "Please select an option for family history.";
    }
    if (!formData.significantTrauma) {
      newError.significantTrauma =
        "Please select an option for significant trauma.";
    }
    if (!formData.childhoodChallenges) {
      newError.childhoodChallenges =
        "Please select an option for childhood challenges.";
    }

    setError(newError);
    return Object.keys(newError).length === 0;
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
      className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl"
    >
      <h2 className="text-3xl font-bold text-center mb-6 text-orange-600">
        Step 4: Health History
      </h2>

      {/* Mental Health Conditions */}
      <div className="bg-gray-50 p-6 mb-6 rounded-lg shadow border">
        <h3 className="text-xl font-semibold mb-4">Mental Health Conditions</h3>
        {["OCD", "Depression", "Trauma", "Anxiety", "Stress"].map(
          (condition) => (
            <label key={condition} className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                value={condition}
                checked={formData.mentalHealthConditions.includes(condition)}
                onChange={handleChange}
                className="form-checkbox text-orange-500 h-5 w-5"
              />
              <span className="text-gray-700">{condition}</span>
            </label>
          )
        )}
        {error.mentalHealthConditions && (
          <p className="text-red-500 text-sm mt-2">
            {error.mentalHealthConditions}
          </p>
        )}
      </div>

      {/* Family History */}
      <div className="bg-gray-50 p-6 mb-6 rounded-lg shadow border">
        <h3 className="text-xl font-semibold mb-4">
          Family Mental Health History
        </h3>
        {["Yes", "No", "Unsure"].map((option) => (
          <label key={option} className="flex items-center space-x-3 mb-3">
            <input
              type="radio"
              name="familyHistory"
              value={option}
              checked={formData.familyHistory === option}
              onChange={handleChange}
              className="form-radio text-orange-500 h-5 w-5"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
        {error.familyHistory && (
          <p className="text-red-500 text-sm mt-2">{error.familyHistory}</p>
        )}
      </div>

      {/* Significant Trauma */}
      <div className="bg-gray-50 p-6 mb-6 rounded-lg shadow border">
        <h3 className="text-xl font-semibold mb-4">Significant Trauma</h3>
        {["Yes", "No", "Prefer not to say"].map((option) => (
          <label key={option} className="flex items-center space-x-3 mb-3">
            <input
              type="radio"
              name="significantTrauma"
              value={option}
              checked={formData.significantTrauma === option}
              onChange={handleChange}
              className="form-radio text-orange-500 h-5 w-5"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
        {error.significantTrauma && (
          <p className="text-red-500 text-sm mt-2">{error.significantTrauma}</p>
        )}
      </div>

      {/* Childhood Challenges */}
      <div className="bg-gray-50 p-6 mb-6 rounded-lg shadow border">
        <h3 className="text-xl font-semibold mb-4">Childhood Challenges</h3>
        {[
          "Abuse",
          "Neglect",
          "Bullying",
          "Family conflict",
          "Unsure",
          "None",
        ].map((option) => (
          <label key={option} className="flex items-center space-x-3 mb-3">
            <input
              type="radio"
              name="childhoodChallenges"
              value={option}
              checked={formData.childhoodChallenges === option}
              onChange={handleChange}
              className="form-radio text-orange-500 h-5 w-5"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
        {error.childhoodChallenges && (
          <p className="text-red-500 text-sm mt-2">
            {error.childhoodChallenges}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 
        hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white 
        font-semibold rounded-lg transition duration-200 transform hover:scale-105 shadow-lg"
      >
        Submit
      </button>
    </form>
  );
};

export default HealthHistoryForm;
