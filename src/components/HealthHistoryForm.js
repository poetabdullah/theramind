import React, { useState } from "react";

const HealthHistoryForm = ({ onSubmit, error }) => {
  const [formData, setFormData] = useState({
    mentalHealthConditions: [],
    familyHistory: "",
    significantTrauma: "",
    childhoodChallenges: "",
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">
        Step 3: Health History
      </h2>

      {/* Mental Health Conditions */}
      <div className="bg-white p-6 mb-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Mental Health Conditions</h3>
        {["OCD", "Depression", "Trauma", "Anxiety", "Stress"].map(
          (condition) => (
            <label key={condition} className="flex items-center mb-3">
              <input
                type="checkbox"
                value={condition}
                checked={formData.mentalHealthConditions.includes(condition)}
                onChange={handleChange}
                className="mr-2"
              />
              {condition}
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
      <div className="bg-white p-6 mb-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">
          Family Mental Health History
        </h3>
        {["Yes", "No", "Unsure"].map((option) => (
          <label key={option} className="flex items-center mb-3">
            <input
              type="radio"
              name="familyHistory"
              value={option}
              checked={formData.familyHistory === option}
              onChange={handleChange}
              className="mr-2"
            />
            {option}
          </label>
        ))}
        {error.familyHistory && (
          <p className="text-red-500 text-sm mt-2">{error.familyHistory}</p>
        )}
      </div>

      {/* Significant Trauma */}
      <div className="bg-white p-6 mb-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Significant Trauma</h3>
        {["Yes", "No", "Prefer not to say"].map((option) => (
          <label key={option} className="flex items-center mb-3">
            <input
              type="radio"
              name="significantTrauma"
              value={option}
              checked={formData.significantTrauma === option}
              onChange={handleChange}
              className="mr-2"
            />
            {option}
          </label>
        ))}
        {error.significantTrauma && (
          <p className="text-red-500 text-sm mt-2">{error.significantTrauma}</p>
        )}
      </div>

      {/* Childhood Challenges */}
      <div className="bg-white p-6 mb-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Childhood Challenges</h3>
        {[
          "Abuse",
          "Neglect",
          "Bullying",
          "Family conflict",
          "Unsure",
          "None",
        ].map((option) => (
          <label key={option} className="flex items-center mb-3">
            <input
              type="radio"
              name="childhoodChallenges"
              value={option}
              checked={formData.childhoodChallenges === option}
              onChange={handleChange}
              className="mr-2"
            />
            {option}
          </label>
        ))}
        {error.childhoodChallenges && (
          <p className="text-red-500 text-sm mt-2">
            {error.childhoodChallenges}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-400 w-full"
      >
        Submit
      </button>
    </form>
  );
};

export default HealthHistoryForm;
