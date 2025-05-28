import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ManagePatientsCard() {
  const navigate = useNavigate();

  return (
    <div
      className="
        p-[2px]
        bg-gradient-to-r 
          from-orange-400 
          via-orange-500 
          to-orange-600
        rounded-xl
      "
    >
      <div
        className="
          bg-white 
          rounded-xl 
          shadow 
          p-6 
          flex 
          items-center 
          justify-between 
          space-x-4
        "
      >
        {/* Icon + text */}
        <div className="flex items-start space-x-4">
          <div
            className="
              p-3 
              bg-gradient-to-tr 
                from-orange-400 
                to-orange-500
              rounded-full
            "
          >
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-800">
              Manage Patients
            </h3>
            <p className="mt-1 text-gray-600">
              View and edit your patients’ treatment plans, appointments &
              questionnaires.
            </p>
          </div>
        </div>

        {/* Button only */}
        <button
          onClick={() => navigate("/manage-patients")}
          className="
            bg-gradient-to-r
              from-orange-400 
              to-orange-500
            text-white 
            font-semibold 
            px-5 
            py-2 
            rounded-lg 
            shadow 
            hover:from-orange-500 
            hover:to-orange-600
            transition 
            duration-200
          "
        >
          Manage Patients
        </button>
      </div>
    </div>
  );
}
