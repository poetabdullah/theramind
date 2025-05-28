import { useNavigate } from "react-router-dom";

export default function ManagePatientsCard() {
  const navigate = useNavigate();

  return (
    <div
      className="cursor-pointer bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
      onClick={() => navigate("/manage-patients")}
    >
      <h3 className="text-xl font-semibold mb-2">Manage Patients</h3>
      <p className="text-gray-600">
        View and edit your patients’ treatment plans, appointments &
        questionnaires.
      </p>
    </div>
  );
}
