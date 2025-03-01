import React from "react";

const EnterCaptchaForm = ({
  captchaCode,
  userInput,
  setUserInput,
  onSubmit,
  error,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center text-purple-600 mb-4">
        Verify You're Human
      </h2>
      <p className="text-sm text-gray-600 text-center mb-4">
        Enter the code shown below:
      </p>

      {/* CAPTCHA Display */}
      <div className="flex justify-center items-center mb-4">
        <span className="text-2xl font-bold bg-gray-100 px-5 py-3 rounded-lg shadow">
          {captchaCode}
        </span>
      </div>

      {/* CAPTCHA Input */}
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
        placeholder="Enter CAPTCHA"
      />

      {/* Conditional feedback */}
      {error && (
        <div className="text-red-500 text-sm text-center mb-3">{error}</div>
      )}

      {/* Verify Button */}
      <button
        onClick={onSubmit} // Trigger CAPTCHA verification
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 
        hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white 
        font-medium rounded-lg transition duration-200"
      >
        Verify
      </button>
    </div>
  );
};

export default EnterCaptchaForm;
