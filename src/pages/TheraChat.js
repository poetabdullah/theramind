import React, { useState } from "react";
import { Send } from "lucide-react";
import Footer from "../components/Footer"; // Import Footer

const TheraChat = () => {
  const [hideHeadline, setHideHeadline] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      {!hideHeadline && (
        <div className="absolute top-4 text-center w-full">
          <h1 className="text-3xl font-bold text-orange-600">
            What can I help with?
          </h1>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 w-full max-w-3xl p-6 space-y-4 overflow-y-auto mt-16 mx-auto">
        {/* Assistant message */}
        <div className="flex items-start">
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 text-gray-800 rounded-2xl p-4 shadow-md max-w-lg animate-fade-in">
            Hello, how can I assist you today?
          </div>
        </div>

        {/* User message */}
        <div className="flex items-end justify-end">
          <div className="bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-2xl p-4 shadow-md max-w-lg animate-fade-in">
            I’m wondering if you have any tips for managing stress and anxiety?
          </div>
        </div>

        {/* Assistant reply */}
        <div
          className="flex items-start animate-fade-in"
          onAnimationEnd={() => setHideHeadline(true)}
        >
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 text-gray-800 rounded-2xl p-4 shadow-md max-w-lg">
            Of course, here are some tips...
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="w-full max-w-3xl px-4 py-3 flex items-center space-x-3 mx-auto">
        <input
          type="text"
          className="flex-1 bg-gray-50 border border-gray-300 rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 text-sm shadow-md"
          placeholder="Type your question here..."
        />
        <button
          className="bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-full p-3 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 transition-transform transform hover:scale-105"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default TheraChat;
