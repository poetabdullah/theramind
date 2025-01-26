import React from "react";

const EnterOTPForm = ({ otp, setOtp, onSubmit, error }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-center text-purple-600 mb-4">
        Verify Your Email
      </h2>
      <p className="text-sm text-gray-600 text-center mb-6">
        We’ve sent a 6-digit OTP to your email. Enter it below to verify.
      </p>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4"
        placeholder="Enter OTP"
        maxLength={6}
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <button
        onClick={onSubmit}
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
      >
        Verify
      </button>
    </div>
  );
};

export default EnterOTPForm;
