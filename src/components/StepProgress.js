import React from 'react';

const StepProgress = ({ steps, currentStep }) => {
  return (
    <div className="w-full px-2 sm:px-4 py-3">
      <div className="flex items-center justify-between space-x-2 sm:space-x-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-1 min-w-0 relative"
          >
            {/* Connecting line */}
            {index > 0 && (
              <div
                className={`
                  absolute top-[14px] left-0 right-0 h-0.5 
                  ${currentStep > index + 1 ? 'bg-purple-500' : 'bg-gray-300'}
                  z-0
                `}
              />
            )}

            {/* Step indicator */}
            <div
              className={`
                w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center z-10
                ${currentStep === index + 1
                  ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-300'
                  : currentStep > index + 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {currentStep > index + 1 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            {/* Step label with precise alignment */}
            <div
              className={`
                text-[10px] sm:text-xs mt-1.5 text-center w-full h-6 flex items-center justify-center
                ${currentStep === index + 1
                  ? 'text-purple-600 font-semibold'
                  : currentStep > index + 1
                    ? 'text-purple-700'
                    : 'text-gray-500'
                }
              `}
            >
              <span
                className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                title={step}
              >
                {step}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepProgress;