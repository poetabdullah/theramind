import React from "react";

// Parent State → Props → EnterCaptchaForm → Visual Display (since it is a component)
// User Input → setUserInput → Parent State
// "Verify" Click → onSubmit() → Parent Handles Logic



const EnterCaptchaForm = ({
  captchaCode,
  userInput, // code entered by the user
  setUserInput, // Function to update userInput in the parent
  onSubmit,
  error,
}) => {
  // Generate random distortion values for each character
  // Takes captchaCode (e.g., "3KD9A") and splits it into an array of characters: ["3", "K", "D", "9", "A"]
  const generateDistortionProps = () => {
    const chars = captchaCode.split("");
    return chars.map(() => ({
      rotation: Math.floor(Math.random() * 30) - 15, // -15 to +14 degrees	Tilts the character left/right (CSS rotate)
      xOffset: Math.floor(Math.random() * 6) - 3, // 	-3 to +2 px	Moves the character horizontally (CSS translateX)
      yOffset: Math.floor(Math.random() * 6) - 3, // -3 to +2 px	Moves the character vertically (CSS translateY)
      fontSize: Math.floor(Math.random() * 8) + 24, // 24 to 31 px	Makes font size inconsistent per character
    }));
  };
  // This visual distortion mimics the behavior of the actual CAPTCHA Forms.
  const charProps = generateDistortionProps();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center text-purple-600 mb-4">
        Verify You're Human
      </h2>
      <p className="text-sm text-gray-600 text-center mb-4">
        Enter the code shown below:
      </p>

      {/* Enhanced CAPTCHA Display */}
      <div className="flex justify-center items-center mb-4 relative">
        <div
          className="bg-gray-100 px-5 py-3 rounded-lg shadow overflow-hidden relative"
          style={{
            background:
              "repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #e8e8e8 10px, #e8e8e8 20px)",
          }}
        >
          {/* Wavy pattern overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="wave-pattern"
                width="50"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0,5 C12.5,0 12.5,10 25,5 C37.5,0 37.5,10 50,5"
                  fill="none"
                  stroke="#6B46C1"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wave-pattern)" />
          </svg>

          {/* Distorted characters */}
          <div className="relative">
            {captchaCode.split("").map((char, index) => (
              <span
                key={index}
                style={{
                  display: "inline-block",
                  transform: `rotate(${charProps[index].rotation}deg) 
                              translateX(${charProps[index].xOffset}px) 
                              translateY(${charProps[index].yOffset}px)`,
                  fontSize: `${charProps[index].fontSize}px`,
                  fontWeight: "bold",
                  margin: "0 2px",
                  color: `hsl(${Math.random() * 60 + 240}, 70%, 40%)`,
                  textShadow: "1px 1px 1px rgba(0,0,0,0.2)",
                  fontFamily: index % 2 === 0 ? "monospace" : "sans-serif",
                }}
              >
                {char}
              </span>
            ))}
          </div>

          {/* Noise dots */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                backgroundColor: `rgba(0,0,0,${Math.random() * 0.3 + 0.1})`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
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
