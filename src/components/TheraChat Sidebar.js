import React from "react";
import { PlusCircle, MessageCircle } from "lucide-react";

const Sidebar = ({
  conversations,
  onSelectConversation,
  selectedConversation,
  onNewConversation,
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 text-gray-800 p-4 flex flex-col overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
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

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2 font-medium">
          Conversations
        </h3>

        {conversations.length === 0 ? (
          <div className="text-gray-400 text-sm py-2 italic">
            No conversations yet
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((chat) => (
              <li key={chat.id}>
                <button
                  onClick={() => onSelectConversation(chat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-start group transition-colors ${
                    selectedConversation?.id === chat.id
                      ? "bg-purple-100 text-purple-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <MessageCircle
                    className={`w-4 h-4 mt-0.5 mr-2 flex-shrink-0 ${
                      selectedConversation?.id === chat.id
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

      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Powered by Gemini</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
