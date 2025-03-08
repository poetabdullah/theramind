import React from "react";

const StepProgress = ({ steps, currentStep }) => {
  return (
    <ol
      className="flex items-center w-full p-3 text-xs sm:text-sm md:text-base font-medium text-center text-purple-500 bg-white border border-gray-200 rounded-lg shadow-md sm:p-4 sm:space-x-2 rtl:space-x-reverse"
      style={{ height: "80px" }}
    >
      {steps.map((step, index) => (
        <li key={index} className="flex items-center flex-1">
          <span
            className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 me-1 sm:me-2 text-xs sm:text-sm border rounded-full shrink-0 transition-colors duration-200
              ${
                currentStep === index + 1
                  ? "bg-purple-600 text-white border-purple-600 ring-1 sm:ring-2 ring-purple-200"
                  : currentStep > index + 1
                  ? "bg-purple-600 text-white border-purple-600"
                  : "border-gray-500 text-gray-500"
              }`}
          >
            {currentStep > index + 1 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              index + 1
            )}
          </span>
          <span
            className={`text-xs sm:text-sm transition-colors duration-200 ${
              currentStep === index + 1
                ? "text-purple-600 font-semibold"
                : currentStep > index + 1
                ? "text-gray-700"
                : "text-gray-500"
            }`}
          >
            {step}
          </span>
          {index < steps.length - 1 && (
            <svg
              className="w-2 h-2 sm:w-3 sm:h-3 mx-1 sm:mx-2 rtl:rotate-180 text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 12 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m7 9 4-4-4-4M1 9l4-4-4-4"
              />
            </svg>
          )}
        </li>
      ))}
    </ol>
  );
};

export default StepProgress;
