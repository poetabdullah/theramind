import React from "react";
import { v4 as uuidv4 } from "uuid";
import ActionItem from "./ActionItem";

const GoalEditor = ({
  goal,
  goalIndex,
  updateGoalTitle,
  deleteGoal,
  addAction,
  updateAction,
  deleteAction,
  errors,
}) => {
  return (
    <div className="mb-10 border border-gray-200 rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between bg-gradient-to-r from-orange-100 to-orange-200 px-6 py-4 border-b border-gray-200">
        <div className="w-full">
          <label className="text-md font-semibold text-gray-800 mb-1 block">
            Goal {goalIndex + 1}
          </label>
          <div className="relative">
            <textarea
              className={`w-full p-4 pr-12 rounded-xl border text-gray-800 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm transition ${
                {
                  true: "border-red-500",
                  false: "border-gray-300",
                }[!!errors[`goal_${goalIndex}`]]
              }`}
              placeholder="Enter a meaningful and specific goal description (at least 5 words)"
              rows="2"
              value={goal.title}
              onChange={(e) => updateGoalTitle(goal.id, e.target.value)}
            />
            <button
              onClick={() => deleteGoal(goal.id)}
              className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
              title="Delete Goal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {errors[`goal_${goalIndex}`] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[`goal_${goalIndex}`]}
            </p>
          )}
          {(errors[`goal_actions_min_${goalIndex}`] ||
            errors[`goal_actions_max_${goalIndex}`]) && (
            <p className="mt-2 text-sm text-red-600">
              {errors[`goal_actions_min_${goalIndex}`] ||
                errors[`goal_actions_max_${goalIndex}`]}
            </p>
          )}
        </div>
      </div>

      {/* Actions List */}
      <div className="bg-white px-6 py-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Assigned Actions
        </h3>

        {goal.actions.length === 0 ? (
          <p className="text-sm text-gray-500 italic mb-4">
            No actions yet. Add at least one action to this goal.
          </p>
        ) : (
          <div className="space-y-4 mb-4">
            {goal.actions.map((action, actionIndex) => (
              <ActionItem
                key={action.id}
                action={action}
                goalId={goal.id}
                goalIndex={goalIndex}
                actionIndex={actionIndex}
                updateAction={updateAction}
                deleteAction={deleteAction}
                errors={errors}
              />
            ))}
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={() => addAction(goal.id)}
            disabled={goal.actions.length >= 10}
            className={`flex items-center justify-center w-full py-2 px-4 rounded-lg font-medium transition-all shadow-sm text-white text-sm ${
              goal.actions.length >= 10
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
            }`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Action {goal.actions.length >= 10 && "(Max 10)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalEditor;
