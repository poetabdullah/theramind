import React from "react";
import { PlusCircle, MessageCircle, X } from "lucide-react";

// PlusCircle --> For starting a new conversation
// MessageCircle --> Conversation item icon
// X --> Cross/closing the sidebar

// Acts as the left side panel for holding the previous conversations.
const Sidebar = ({
  conversations, // array of chat objects (from Firestore)
  onSelectConversation, // function to load a convo by ID
  selectedConversation, // the currently selected convo
  onNewConversation, // new convo
  onToggle, // on mobile view, toggle opens/closes the sidebar
}) => {
  return (
    <div className="h-screen w-64 bg-white shadow-lg flex flex-col overflow-hidden border-r border-gray-200 relative">
      {/* Close Button - Only visible on mobile */}
      <button
        onClick={onToggle}
        className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        aria-label="Close sidebar"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          TheraChat
        </h2>
        <button
          onClick={onNewConversation}
          className="text-purple-600 hover:text-indigo-600 transition-colors"
          title="New Conversation"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Conversations Header */}
      <div className="px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 font-medium">
          Conversations
        </h3>
      </div>

      {/* Scrollable Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="text-gray-400 text-sm py-2 italic px-2">
            No conversations yet
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((chat) => (
              <li key={chat.id}>
                <button
                  onClick={() => onSelectConversation(chat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-start transition-colors ${selectedConversation?.id === chat.id
                    ? "bg-purple-100 text-purple-700"
                    : "hover:bg-gray-100"
                    }`}
                >
                  <MessageCircle
                    className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${selectedConversation?.id === chat.id
                      ? "text-purple-600"
                      : "text-gray-500"
                      }`}
                  />
                  <span className="text-sm truncate flex-1">
                    {chat.title || "New conversation"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">Powered by Gemini</p>
      </div>
    </div>
  );
};

export default Sidebar;
