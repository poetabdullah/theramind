import React from "react";
import { ChevronDown } from "lucide-react";

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
    <div className="mb-10 w-full max-w-xl mx-auto">
      <label
        htmlFor="patient-select"
        className="block text-lg font-semibold text-orange-800 mb-3"
      >
        Select a Patient
      </label>

      <div className="relative">
        <select
          id="patient-select"
          value={selectedPatient || ""}
          onChange={handleChange}
          disabled={loading}
          className="w-full cursor-pointer rounded-2xl border border-orange-200 bg-white px-5 py-4 pr-12 text-base font-medium text-gray-800 shadow-lg transition duration-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none appearance-none hover:border-orange-300 hover:shadow-xl"
        >
          <option value="" disabled>
            {loading ? "Loading patients..." : "Choose a patient"}
          </option>
          {patients.map((p) => (
            <option key={p.email} value={p.email}>
              {p.name} ({p.email})
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
          <ChevronDown className="w-5 h-5 text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default StylizedPatientDropdown;
