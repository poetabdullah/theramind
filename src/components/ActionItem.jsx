import React from "react";

const ActionItem = ({
  action,
  goalId,
  goalIndex,
  actionIndex,
  updateAction,
  deleteAction,
  errors,
}) => {
  const priorityStyles = {
    1: "bg-blue-50 border-blue-300 text-blue-800",
    2: "bg-yellow-50 border-yellow-300 text-yellow-800",
    3: "bg-red-50 border-red-300 text-red-800",
  };

  return (
    <div
      className={`border rounded-xl p-4 shadow-md ${
        priorityStyles[action.priority]
      } transition-all`}
    >
      <div className="flex flex-col md:flex-row md:items-start md:gap-6">
        {/* Action Description */}
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action {actionIndex + 1}
          </label>
          <textarea
            className={`w-full p-3 rounded-lg border text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors[`action_${goalIndex}_${actionIndex}`]
                ? "border-red-500"
                : "border-gray-300"
            }`}
            rows="2"
            placeholder="Describe the action clearly (at least 5 words)"
            value={action.description}
            onChange={(e) =>
              updateAction(goalId, action.id, "description", e.target.value)
            }
          />
          {errors[`action_${goalIndex}_${actionIndex}`] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[`action_${goalIndex}_${actionIndex}`]}
            </p>
          )}
        </div>

        {/* Priority & Assignment */}
        <div className="mt-4 md:mt-0 flex flex-col gap-3 w-full md:w-64">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={action.priority}
              onChange={(e) =>
                updateAction(
                  goalId,
                  action.id,
                  "priority",
                  parseInt(e.target.value)
                )
              }
            >
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={action.assigned_to}
              onChange={(e) =>
                updateAction(goalId, action.id, "assigned_to", e.target.value)
              }
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button
            onClick={() => deleteAction(goalId, action.id)}
            className="mt-2 text-red-500 hover:text-red-700 transition text-sm flex items-center gap-1"
            title="Delete Action"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionItem;
