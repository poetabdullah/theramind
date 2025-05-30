// PatientSelector.jsx

const PatientSelector = ({ selectedPatientData }) => {
  if (!selectedPatientData) return null;

  return (
    <div className="mb-8">
      <div className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Selected Patient
        </label>
        <div className="text-base font-semibold text-gray-800">
          {selectedPatientData.name} ({selectedPatientData.email})
        </div>
      </div>
    </div>
  );
};

export default PatientSelector;
