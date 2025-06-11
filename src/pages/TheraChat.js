// Gemini powered chatbot
import React, { useState, useEffect, useRef } from "react";
import { Send, Menu } from "lucide-react";
import Footer from "../components/Footer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import Sidebar from "../components/TheraChat Sidebar";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const TheraChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hideHeadline, setHideHeadline] = useState(false);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (loggedInUser) => {
      if (!loggedInUser) {
        navigate("/login");
      } else {
        setUser(loggedInUser);
        fetchConversations(loggedInUser.uid);
      }
    });

    // Handle mobile view - close sidebar by default on small screens to make the screen easier to navigate
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (chatContainerRef.current) {
      // Auto-scrolls the chat window down whenever messages change.
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetches the current user's conversations by recency
  const fetchConversations = (userId) => {
    const conversationsRef = collection(db, "conversations");
    onSnapshot(conversationsRef, (snapshot) => {
      const userConversations = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((conv) => conv.userId === userId)
        .sort((a, b) => b.timestamp - a.timestamp); // Sort by most recent
      setConversations(userConversations);
    });
  };
  // When the new chat starts, it resets the chat
  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setHideHeadline(false);
    // Auto closes the sidebar on mobile after selecting a conversation, or starting a new conversation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Handles the selected past conversations, finds the selected conversation and displays it to the user
  const handleSelectConversation = (conversationId) => {
    const selectedChat = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (selectedChat) {
      setCurrentConversation(selectedChat);
      setMessages(selectedChat.messages || []);
      setHideHeadline(true);
      // Close sidebar on mobile after selecting a conversation
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
  };

  // Handles the sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Generate an appropriate title of the conversation
  const createTitle = (text) => {
    // Create a meaningful title from the first message
    return text.length > 30 ? `${text.substring(0, 30)}...` : text;
  };

  const sendMessage = async () => { // Awaits for external processes with Gemini
    if (input.trim() === "") return; // Prevents sending blank messages.
    if (messages.length === 0) setHideHeadline(true); //Hides the initial headlines once the conversation starts

    // Temporarily stores the user's messages in chat
    const userMessage = { text: input, sender: "user", timestamp: Date.now() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true); // Shows "typing..."

    try {
      const result = await model.generateContent(input); // Function of Gemini SDK
      let aiResponse = result?.response?.text(); // Extracts the text of the response
      if (!aiResponse || typeof aiResponse !== "string") {
        aiResponse = "I couldn't process that, please try again.";
      }

      // For the processing of the Gemini's response
      const botMessage = {
        text: aiResponse,
        sender: "ai",
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMessage, botMessage];
      // Updates the React state (setMessages) so it renders in the chat window
      setMessages(updatedMessages);

      if (user) {
        // Makes sure that the user is authenticated
        if (!currentConversation) {
          // Create a new conversation
          const chatRef = doc(collection(db, "conversations"));
          const title = createTitle(input);
          const newConversation = {
            id: chatRef.id,
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName,
            messages: updatedMessages,
            timestamp: Date.now(),
            title,
          };

          await setDoc(chatRef, newConversation);
          // Keeps a copy in currentConversation state so we know which session is active
          setCurrentConversation(newConversation);
        } else {
          // Update existing conversation
          const chatRef = doc(db, "conversations", currentConversation.id);
          const updatedConversation = {
            ...currentConversation,
            messages: updatedMessages,
            timestamp: Date.now(), // Update timestamp to move to top of list
          };

          await updateDoc(chatRef, {
            messages: updatedMessages,
            timestamp: Date.now(),
          });

          setCurrentConversation(updatedConversation);
        }
      }
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Oops! Something went wrong.",
          sender: "ai",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      // Whether success or error, hide the typing animation
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex flex-1 relative">
        {/* Mobile sidebar toggle button */}
        <button
          className="md:hidden absolute top-4 left-4 z-20 bg-white rounded-full p-2 shadow-md"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5 text-purple-600" />
        </button>

        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out md:translate-x-0 fixed md:relative z-10 h-screen`}
        >
          <Sidebar
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversation={currentConversation}
            onNewConversation={startNewConversation}
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
          />
        </div>
        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Semi-transparent overlay for mobile when sidebar is open */}
          {sidebarOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-5"
              onClick={toggleSidebar}
            ></div>
          )}

          {/* Main content wrapper with fixed height */}
          <div
            className="flex flex-col"
            style={{ height: "calc(100vh - 80px)" }}
          >
            {/* Headline section - with reduced flex properties */}
            {!hideHeadline && messages.length === 0 && (
              <div className="flex items-center justify-center h-48">
                {" "}
                {/* Fixed height instead of flex-grow */}
                <h1 className="text-4xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent py-6">
                  How can I assist you today?
                </h1>
              </div>
            )}

            {/* Chat messages container */}
            <div
              ref={chatContainerRef}
              className="flex-1 w-full max-w-4xl p-6 space-y-3 overflow-y-auto mx-auto"
              style={{
                height:
                  messages.length > 0
                    ? "calc(100vh - 160px)"
                    : "calc(100vh - 160px - 48px)",
              }}
            // Adjust height based on whether headline is shown
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"
                    } animate-fade-in`}
                >
                  <div
                    className={`${msg.sender === "user"
                      ? "bg-gradient-to-r from-indigo-800 to-indigo-500 text-white"
                      : "bg-gradient-to-r from-purple-800 to-purple-500 text-white"
                      } rounded-2xl px-5 py-3 shadow-lg max-w-xl leading-normal text-left text-base break-words whitespace-pre-wrap`}
                  >
                    {/* Gemini responds in markdown and that text needs to be processed in order to display it accurately */}
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <p className="mb-0.5" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="ml-4 mt-0 mb-0" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:top-[2px]">
                            {props.children}
                          </li>
                        ),
                      }}
                    >
                      {msg.text
                        .replace(/\n{3,}/g, "\n")
                        .replace(/\n\s*\n/g, "\n")
                        .replace(/•\s*/g, "")}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {/* Loading animation when the AI is responding */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-purple-500 text-white rounded-2xl px-5 py-3 shadow-lg max-w-md text-left">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "600ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input area - fixed height */}
            {/* This style of height and width is carefully curated and was widely tested as per the sidebar. It earlier made the UI area practically non-functional. */}
            <div className="w-full bg-white border-t border-gray-100 py-4">
              <div className="max-w-3xl mx-auto px-4">
                <div className="flex items-center w-full space-x-3">
                  <input
                    type="text"
                    className="flex-1 bg-white text-gray-900 border border-purple-500 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-500 text-sm shadow-md"
                    placeholder="Type your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendMessage()
                    }
                    disabled={loading}
                  />
                  <button
                    className="group bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-3 shadow-lg focus:outline-none transition-all transform hover:scale-105 focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 flex items-center justify-center"
                    onClick={sendMessage}
                    disabled={loading}
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TheraChat;
