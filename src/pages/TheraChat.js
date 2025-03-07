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
  getDocs,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const genAI = new GoogleGenerativeAI("AIzaSyBGcLuZeHs3iIUUrQTc26jOdFJH4r8iGA4");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    // Handle mobile view - close sidebar by default on small screens
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setHideHeadline(false);
    // Close sidebar on mobile after selecting a conversation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const createTitle = (text) => {
    // Create a meaningful title from the first message
    return text.length > 30 ? `${text.substring(0, 30)}...` : text;
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;
    if (messages.length === 0) setHideHeadline(true);

    const userMessage = { text: input, sender: "user", timestamp: Date.now() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const result = await model.generateContent(input);
      let aiResponse = result?.response?.text();
      if (!aiResponse || typeof aiResponse !== "string") {
        aiResponse = "I couldn't process that, please try again.";
      }
      const botMessage = {
        text: aiResponse,
        sender: "ai",
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMessage, botMessage];
      setMessages(updatedMessages);

      if (user) {
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile sidebar toggle button */}
        <button
          className="md:hidden absolute top-4 left-4 z-20 bg-white rounded-full p-2 shadow-md"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5 text-purple-600" />
        </button>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out md:translate-x-0 fixed md:relative z-10 h-screen`}
        >
          <Sidebar
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            selectedConversation={currentConversation}
            onNewConversation={startNewConversation}
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

          {!hideHeadline && messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center w-full text-center px-4">
              <h1 className="text-4xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent py-6">
                How can I assist you today?
              </h1>
            </div>
          )}

          {/* Chat messages container - make it fill available space */}
          <div
            ref={chatContainerRef}
            className="flex-1 w-full max-w-4xl p-6 space-y-3 overflow-y-auto mx-auto"
            style={{ minHeight: 0 }}
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

            {loading && (
              <div className="flex justify-start">
                <div className="bg-purple-500 text-white rounded-2xl px-5 py-3 shadow-lg max-w-md text-left">
                  Typing...
                </div>
              </div>
            )}
          </div>

          {/* Input area - fixed at bottom */}
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
      <Footer />
    </div>
  );
};

export default TheraChat;
