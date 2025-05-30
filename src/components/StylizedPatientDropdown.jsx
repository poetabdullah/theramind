import React from "react";

const StylizedPatientDropdown = ({
  selectedPatient,
  setSelectedPatient,
  patients = [],
  loading = false,
}) => {
  const handleChange = (e) => {
    const selected = e.target.value;
    console.log("👤 Selected patient:", selected);
    setSelectedPatient(selected);
  };

  return (
    <div className="mb-10">
      <div className="relative w-full max-w-md mx-auto">
        <label
          htmlFor="stylized-patient-select"
          className="block mb-2 text-lg font-semibold text-gray-800"
        >
          Choose a Patient
        </label>
        <select
          id="stylized-patient-select"
          className="block w-full appearance-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base shadow-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all duration-300"
          value={selectedPatient || ""}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="" disabled>
            {loading ? "Fetching patients..." : "Select a patient"}
          </option>
          {patients.map((p) => (
            <option key={p.email} value={p.email}>
              {p.name} ({p.email})
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-3 top-[40px] flex items-center text-gray-400">
          <svg
            className="h-6 w-6"
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
    </div>
  );
};

export default StylizedPatientDropdown;
