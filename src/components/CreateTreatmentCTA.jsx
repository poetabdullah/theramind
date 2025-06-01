import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateTreatmentCTA() {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-center mt-8 px-4">
      <div className="w-full max-w-6xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 text-white rounded-xl shadow-xl p-10 flex flex-col sm:flex-row items-center justify-between hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center space-x-4">
          {/* Solid white circle with icon */}
          <div className="bg-white rounded-full p-4">
            <PlusCircle size={32} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Start a New Treatment Plan
            </h2>
            <p className="text-white text-opacity-90 mt-1 text-sm sm:text-base">
              Create a personalized treatment plan for a new patient today, or
              edit the existing treatment plans.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/treatment-recommendation")}
          className="mt-6 sm:mt-0 bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-gray-300 transition"
        >
          Create Now
        </button>
      </div>
    </div>
  );
}
