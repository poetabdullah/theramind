import React, { useState } from "react";
import { Send } from "lucide-react";
import Footer from "../components/Footer"; // Import Footer

const TheraChat = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "ai" },
    {
      text: "I’m wondering if you have any tips for managing stress and anxiety?",
      sender: "user",
    },
    {
      text: "Absolutely! Managing stress and anxiety involves mindfulness, breathing techniques, and self-care. Would you like specific exercises?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [hideHeadline, setHideHeadline] = useState(false);

  const sendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Header */}
      {!hideHeadline && (
        <div className="absolute top-6 text-center w-full">
          <h1 className="text-3xl font-semibold text-indigo-600">
            How can I assist you today?
          </h1>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 w-full max-w-3xl p-6 space-y-4 overflow-y-auto mt-20 mx-auto">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "items-start"
            } animate-fade-in`}
            onAnimationEnd={() => setHideHeadline(true)}
          >
            <div
              className={`${
                msg.sender === "user"
                  ? "bg-indigo-500 text-white"
                  : "bg-purple-600 text-white"
              } rounded-xl p-4 shadow-lg max-w-lg`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="w-full max-w-3xl px-4 py-4 flex items-center space-x-3 mx-auto">
        <input
          type="text"
          className="flex-1 bg-white text-gray-900 border border-indigo-400 rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 text-sm shadow-md"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white rounded-full p-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
          aria-label="Send message"
          onClick={sendMessage}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Footer with Extra Spacing */}
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default TheraChat;
