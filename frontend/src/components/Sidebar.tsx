import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

interface SidebarProps {
  threads: Array<{
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    model: string;
  }>;
  activeThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({
  threads,
  activeThreadId,
  onThreadSelect,
  onNewChat,
}: SidebarProps) {
  const { isDark, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-80"
      } flex-shrink-0 border-r backdrop-blur-sm transition-all duration-300 flex flex-col relative group ${
        isDark ? "border-white/10" : "border-gray-200/20"
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute -right-3 top-6 p-1.5 rounded-full border shadow-lg z-50 transition-all duration-300 ${
          isDark
            ? "bg-gray-900 border-white/10 text-white hover:bg-gray-800"
            : "bg-white border-gray-200/20 text-gray-900 hover:bg-gray-50"
        }`}
      >
        <svg
          className={`w-3 h-3 transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Header */}
      <div className={`p-4 ${isCollapsed ? "px-2" : ""}`}>
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 shadow-lg hover:shadow-xl ${
            isCollapsed ? "px-2" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Threads List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className={`space-y-1 ${isCollapsed ? "p-1" : "p-2"}`}>
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onThreadSelect(thread.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group hover:shadow-md ${
                isCollapsed ? "justify-center px-2" : ""
              } ${
                thread.id === activeThreadId
                  ? isDark
                    ? "bg-white/10 text-white shadow-lg"
                    : "bg-white text-gray-900 shadow-lg"
                  : isDark
                  ? "text-gray-300 hover:bg-white/5"
                  : "text-gray-600 hover:bg-white"
              }`}
              title={isCollapsed ? thread.title : undefined}
            >
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  thread.model === "gpt-4"
                    ? "bg-green-400"
                    : thread.model === "claude"
                    ? "bg-purple-400"
                    : "bg-blue-400"
                }`}
              ></div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate">
                      {thread.title}
                    </div>
                  </div>
                  <div
                    className={`text-xs truncate transition-colors duration-300 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {thread.lastMessage || "No messages yet"}
                  </div>
                  <div
                    className={`text-xs transition-colors duration-300 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {thread.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status Section - Fixed at Bottom */}
      <div
        className={`p-4 border-t ${isCollapsed ? "px-2" : ""} ${
          isDark ? "border-white/10" : "border-gray-200/20"
        }`}
      >
        <div className={`flex flex-col ${isCollapsed ? "gap-2" : "gap-4"}`}>
          {/* Connection Status */}
          <div
            className={`text-sm transition-colors duration-300 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-2"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              {!isCollapsed && <span>Backend Connected</span>}
            </div>
          </div>

          {!isCollapsed && (
            <>
              {/* Features and Shortcuts */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-200 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-blue-400">✓</span>
                  <span>File Search</span>
                </div>
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-200 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-purple-400">⌘K</span>
                  <span>Commands</span>
                </div>
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-200 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-400">📎</span>
                  <span>Drag & Drop</span>
                </div>
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-200 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-yellow-400">📁</span>
                  <span>Add Files</span>
                </div>
              </div>
            </>
          )}

          {/* Theme Toggle */}
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isCollapsed && (
              <div
                className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Theme
              </div>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${
                isDark
                  ? "bg-gray-900/50 border-white/10 text-white hover:bg-gray-800/50"
                  : "bg-white/50 border-gray-200/20 text-gray-900 hover:bg-white/70"
              }`}
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              <div className="relative w-5 h-5">
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isDark ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {/* Sun icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                  </svg>
                </div>
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isDark ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {/* Moon icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
