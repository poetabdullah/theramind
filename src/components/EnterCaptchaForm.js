import React from "react";

const EnterCaptchaForm = ({
  captchaCode,
  userInput,
  setUserInput,
  onSubmit,
  error,
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-center text-purple-600 mb-4">
        Verify You're Human
      </h2>
      <p className="text-sm text-gray-600 text-center mb-4">
        Enter the code shown below:
      </p>

      {/* CAPTCHA Display */}
      <div className="flex justify-center items-center mb-3">
        <span className="text-2xl font-bold bg-gray-200 px-4 py-2 rounded">
          {captchaCode}
        </span>
        <button
          onClick={() => setUserInput("")} // Clear input on refresh
          className="ml-3 bg-purple-600 text-white px-3 py-1 rounded hover:bg-blue-600"
          type="button"
        >
          Refresh
        </button>
      </div>

      {/* CAPTCHA Input */}
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="w-full p-3 border rounded-lg mb-2"
        placeholder="Enter CAPTCHA"
      />

      {/* Conditional feedback */}
      {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

      <button
        onClick={() => onSubmit()} // Trigger CAPTCHA verification
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
      >
        Verify
      </button>
    </div>
  );
};

export default EnterCaptchaForm;
