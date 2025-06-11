import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useEmojiPicker } from "../context/EmojiPickerContext";
import { useToast } from "../hooks/useToast";
import Message from "./Message";
import ModelSelector from "./ModelSelector";
import type { ChatMessage } from "../types/message";

interface ChatWindowProps {
  messages: ChatMessage[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  onSendMessage: (message: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => void;
  isLoading?: boolean;
  isTyping?: boolean;
}

export default function ChatWindow({
  messages,
  selectedModel,
  onModelChange,
  onSendMessage,
  onToggleReaction,
  isLoading = false,
  isTyping = false,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputEmojiPickerId] = useState(() => `input-emoji-${Date.now()}`);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const { addToast } = useToast();
  const { setActivePickerId, setPickerPosition, setActivePickerProps } =
    useEmojiPicker();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  // Drag and Drop Event Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the container itself
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Convert files to @mentions and add to input
    const mentions = files.map((file) => `@${file.name}`).join(" ");

    // Add mentions to the input value
    const currentValue = inputValue;
    const separator = currentValue && !currentValue.endsWith(" ") ? " " : "";
    const newValue = currentValue + separator + mentions + " ";

    setInputValue(newValue);

    // Focus the textarea and adjust height
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(adjustTextareaHeight, 0);
    }

    addToast(
      `Added ${files.length} file mention${files.length > 1 ? "s" : ""}`,
      "success",
      3000
    );
  };

  // Handle emoji picker for input
  const handleOpenEmojiPicker = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8, // Position above the button
      });
    }

    setActivePickerProps({
      onClose: () => setActivePickerId(null),
      onEmojiSelect: (emoji: string) => {
        // Add emoji to input value at cursor position
        const currentValue = inputValue;
        const separator =
          currentValue && !currentValue.endsWith(" ") ? " " : "";
        const newValue = currentValue + separator + emoji + " ";

        setInputValue(newValue);

        // Focus textarea and adjust height
        if (textareaRef.current) {
          textareaRef.current.focus();
          setTimeout(adjustTextareaHeight, 0);
        }

        setActivePickerId(null);
      },
      isUser: false,
    });

    setActivePickerId(inputEmojiPickerId);
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b transition-colors duration-300 relative z-[9998] w-full ${
          isDark
            ? "bg-gray-900/50 border-white/10"
            : "bg-white/50 border-gray-200/20"
        }`}
      >
        <div className="flex-1">
          <h2
            className={`text-lg font-semibold transition-colors duration-300 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            ChatFS
          </h2>
          <p
            className={`text-sm transition-colors duration-300 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {messages.length > 0
              ? `${messages.length} message${messages.length > 1 ? "s" : ""}`
              : "Start a conversation"}
          </p>
        </div>
        <div className="flex-shrink-0">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in duration-500">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-gradient-to-br from-blue-400 to-purple-500"
              }`}
            >
              <span className="text-white text-2xl">🗂️</span>
            </div>
            <h3
              className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome to ChatFS
            </h3>
            <p
              className={`text-sm max-w-md transition-colors duration-300 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Start chatting with your files and folders. I can help you
              explore, analyze, and work with your file system.
            </p>
            <p
              className={`text-xs mt-2 transition-colors duration-300 ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              💡 Tip: Drag & drop files here to add @mentions, hover messages
              for reactions
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Message
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  reactions={message.reactions}
                  onToggleReaction={(emoji) =>
                    onToggleReaction(message.id, emoji)
                  }
                />
              </div>
            ))}
            {(isLoading || isTyping) && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom duration-300">
                <div
                  className={`backdrop-blur-md border rounded-2xl px-4 py-3 transition-colors duration-300 ${
                    isDark
                      ? "bg-white/10 border-white/10"
                      : "bg-white/70 border-gray-200/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span
                      className={`text-sm transition-colors duration-300 ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {isLoading
                        ? "Thinking..."
                        : isTyping
                        ? `Typing...`
                        : "Thinking..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input with Drag & Drop */}
      <div
        className={`p-4 backdrop-blur-sm border-t transition-colors duration-300 ${
          isDark
            ? "bg-gray-900/50 border-white/10"
            : "bg-white/50 border-gray-200/20"
        }`}
      >
        <form onSubmit={handleSubmit} className="relative">
          <div
            ref={inputContainerRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative backdrop-blur-md border rounded-2xl shadow-lg transition-all duration-200 ${
              isDragOver
                ? "bg-blue-500/20 border-blue-400/50 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-transparent"
                : isDark
                ? "bg-white/10 border-white/20"
                : "bg-white/70 border-gray-200/30"
            }`}
          >
            {isDragOver && (
              <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 pointer-events-none animate-in fade-in duration-200">
                <div className="text-blue-300 text-sm font-medium flex items-center gap-2">
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Drop files to add @mentions
                </div>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your files, drag & drop to add @mentions..."
              disabled={isLoading}
              className={`w-full px-4 py-3 pr-20 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl transition-colors duration-300 ${
                isDark
                  ? "text-white placeholder-gray-400"
                  : "text-gray-900 placeholder-gray-500"
              }`}
              rows={1}
              style={{ maxHeight: "120px" }}
            />

            {/* Emoji Button */}
            <button
              type="button"
              ref={emojiButtonRef}
              onClick={handleOpenEmojiPicker}
              className={`absolute bottom-2 right-12 p-2 rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-white/10"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
              title="Add emoji"
              aria-label="Add emoji"
            >
              😀
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute bottom-2 right-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:opacity-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-2">
            <div
              className={`text-xs transition-colors duration-300 ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              Press Enter to send, Shift + Enter for new line • Drag & drop
              files to add @mentions • Hover messages for reactions
            </div>
            <div
              className={`text-xs transition-colors duration-300 ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {inputValue.length}/2000
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
