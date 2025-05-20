import React from "react";

const PatientSelector = ({
  selectedPatient,
  setSelectedPatient,
  error,
  patients = [],
  loading = false,
}) => {
  return (
    <div className="mb-8">
      <div className="relative">
        <label
          htmlFor="patient-select"
          className={`absolute left-3 top-[-10px] bg-white px-1 text-sm transition-all duration-200 ${
            error ? "text-red-600" : "text-orange-600"
          }`}
        >
          Select Patient
        </label>
        <select
          id="patient-select"
          className={`w-full mt-3 p-3 bg-white border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-xl shadow-sm focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-orange-500"
          } focus:border-transparent transition-all duration-200 appearance-none`}
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          disabled={loading}
        >
          <option value="" disabled>
            {loading ? "Loading patients..." : "Select a Patient"}
          </option>
          {patients.map((p) => (
            <option key={p.email} value={p.email}>
              {p.name} ({p.email})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-4 top-[50%] translate-y-[-50%] flex items-center text-gray-500">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PatientSelector;
