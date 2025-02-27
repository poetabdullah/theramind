import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import Footer from "../components/Footer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyBGcLuZeHs3iIUUrQTc26jOdFJH4r8iGA4");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const TheraChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hideHeadline, setHideHeadline] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    if (messages.length === 0) setHideHeadline(true);

    const userMessage = { text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await model.generateContent(input);
      let aiResponse = result?.response?.text();
      if (!aiResponse || typeof aiResponse !== "string") {
        aiResponse = "I couldn't process that, please try again.";
      }
      const botMessage = { text: aiResponse, sender: "ai" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Oops! Something went wrong. Please try again.", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center">
      {!hideHeadline && messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center w-full text-center px-4">
          <h1 className="text-4xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent py-6">
            How can I assist you today?
          </h1>
        </div>
      )}

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 w-full max-w-4xl p-6 space-y-3 overflow-y-auto mx-auto flex flex-col"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-full ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            } animate-fade-in`}
          >
            <div
              className={`${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-indigo-800 to-indigo-500 text-white"
                  : "bg-gradient-to-r from-purple-800 to-purple-500 text-white"
              } rounded-2xl px-5 py-3 shadow-lg max-w-xl leading-normal text-left text-base break-words whitespace-pre-wrap`}
            >
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => (
                    <p className="mb-0.5" {...props} />
                  ), // Minimal space between paragraphs
                  ul: ({ node, ...props }) => (
                    <ul className="ml-4 mt-0 mb-0" {...props} />
                  ), // No extra margin
                  li: ({ node, ...props }) => (
                    <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:top-[2px]">
                      {props.children}
                    </li>
                  ),
                }}
              >
                {
                  msg.text
                    .replace(/\n{3,}/g, "\n") // Reduce excessive newlines
                    .replace(/\n\s*\n/g, "\n") // Ensure proper paragraph breaks
                    .replace(/•\s*/g, "") // Remove actual bullet symbols
                }
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-purple-500 text-white rounded-2xl px-5 py-3 shadow-lg max-w-md text-left">
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="w-full max-w-3xl px-4 py-4 flex flex-col items-center space-y-2 mx-auto">
        <div className="flex items-center w-full space-x-3">
          <input
            type="text"
            className="flex-1 bg-white text-gray-900 border border-purple-500 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-sm shadow-md"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button
            className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-3 shadow-lg focus:outline-none transition-all transform hover:scale-105 focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 flex items-center justify-center"
            aria-label="Send message"
            onClick={sendMessage}
            disabled={loading}
          >
            <Send className="w-5 h-5 text-white group-hover:text-indigo-200 transition-colors duration-200" />
          </button>
        </div>

        {/* Disclaimer Text */}
        <p className="text-xs text-gray-500">
          TheraChat can make mistakes. Check important info.
        </p>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TheraChat;
