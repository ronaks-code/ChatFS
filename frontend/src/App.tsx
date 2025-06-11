import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import CommandPalette from "./components/CommandPalette";
import ToastContainer from "./components/Toast";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { EmojiPickerProvider } from "./context/EmojiPickerContext";
import { useToast } from "./hooks/useToast";
import type { ChatMessage, ChatThread } from "./types/message";
import { CURRENT_USER_ID } from "./types/message";

// Model-specific typing delays (in milliseconds) - Made much faster and snappier
const typingDelays = {
  "gpt-4": { min: 8, max: 15 }, // Fast but still thoughtful
  claude: { min: 5, max: 12 }, // Snappy medium pace
  perplexity: { min: 2, max: 8 }, // Very fast bursts
};

// Model-specific response personalities
function generateModelResponse(prompt: string, model: string): string {
  switch (model) {
    case "gpt-4":
      return `I understand you're asking: "${prompt}". Let me provide a comprehensive analysis:

1. **Initial Assessment**: Based on your query, I can examine the file structure and provide detailed insights.

2. **Technical Analysis**: The files you mentioned (@README.md, @package.json) contain crucial information about the project structure and dependencies.

3. **Recommendations**: 
   - Review the documentation for implementation details
   - Check dependency versions for compatibility
   - Consider the architectural patterns being used

4. **Next Steps**: I can dive deeper into specific areas if you'd like more detailed analysis of particular components or configurations.

Would you like me to focus on any specific aspect of the codebase?`;

    case "claude":
      return `Thanks for your question about "${prompt}"! I'd be happy to help you explore this.

I can see you're working with some interesting files here. Let me share what I notice in a conversational way:

The way I understand it, you're building something with React and Tauri, which is a really nice combination for desktop apps. The @mentions you're using suggest you're creating a file-based chat system, which sounds fascinating!

I'm particularly drawn to how you're structuring this project. The separation between frontend and backend components shows thoughtful architecture. If you'd like, I can walk through any of these files with you and explain what stands out to me.

What would be most helpful for you to explore next?`;

    case "perplexity":
      return `Query: "${prompt}"

**Analysis Results:**

The mentioned files indicate a modern web application stack [1]. Key findings:

• @README.md contains project documentation and setup instructions [2]
• @package.json defines dependencies and build scripts for Node.js projects [3] 
• Tauri framework enables desktop app development with web technologies [4]

**Technical Stack:**
- Frontend: React + TypeScript + Vite
- Backend: Rust + Tauri
- Styling: Tailwind CSS

**References:**
[1] Modern JavaScript project structure
[2] Markdown documentation standard
[3] Node.js package management
[4] Tauri.app - Desktop app framework

Need specific analysis of any file?`;

    default:
      return `I understand you're asking: "${prompt}". I can help you explore your files and folders. What would you like to do next?`;
  }
}

// Utility function to get random delay within model range
function getTypingDelay(model: string): number {
  const delays =
    typingDelays[model as keyof typeof typingDelays] || typingDelays["gpt-4"];
  return Math.random() * (delays.max - delays.min) + delays.min;
}

// Utility function to simulate character-by-character typing
async function typeMessage(
  content: string,
  model: string,
  onUpdate: (partialContent: string) => void,
  onComplete: () => void
): Promise<void> {
  let currentContent = "";

  for (let i = 0; i < content.length; i++) {
    currentContent += content[i];
    onUpdate(currentContent);

    // Add longer pauses for punctuation to simulate thinking
    const char = content[i];
    let delay = getTypingDelay(model);

    if (char === "." || char === "!" || char === "?") {
      delay *= 3; // Longer pause after sentences
    } else if (char === "," || char === ";") {
      delay *= 1.5; // Medium pause after commas
    } else if (char === "\n") {
      delay *= 2; // Pause at line breaks
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  onComplete();
}

function AppContent() {
  const [activeThreadId, setActiveThreadId] = useState<string | null>("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { isDark } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  // Enhanced sample data with reactions
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: "1",
      title: "README Review",
      lastMessage:
        "I understand you're asking about the README. Let me provide a comprehensive analysis...",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      model: "gpt-4",
      messages: [
        {
          id: "1-1",
          content:
            "Can you summarize @README.md and check if @package.json has the right dependencies?",
          isUser: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          reactions: {
            "👍": new Set(["user-2"]),
            "🚀": new Set(["user-1", "user-2", "user-3"]),
          },
        },
        {
          id: "1-2",
          content: `I understand you're asking about @README.md and @package.json. Let me provide a comprehensive analysis:

1. **README Analysis**: The documentation describes ChatFS as a well-structured project with clear installation instructions and feature descriptions.

2. **Package Dependencies**: The @package.json appears to include appropriate dependencies for a React + Tauri application.

3. **Technical Assessment**: The project structure follows modern development practices with proper separation of concerns.

Would you like me to dive deeper into any specific aspect?`,
          isUser: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          reactions: {
            "❤️": new Set(["user-1"]),
            "🔥": new Set(["user-1", "user-4"]),
          },
        },
      ],
    },
    {
      id: "2",
      title: "Project Files Overview",
      lastMessage:
        "Thanks for asking about the project structure! I'd be happy to walk through this with you...",
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      model: "claude",
      messages: [
        {
          id: "2-1",
          content:
            "What files are in this folder? Can you check @frontend/src and @src-tauri/src?",
          isUser: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 50),
          reactions: {},
        },
        {
          id: "2-2",
          content: `Thanks for asking about the project structure! I'd be happy to walk through this with you.

From what I can see, you have a really thoughtful organization here:

**@frontend/** contains your React application - this is where the user interface lives. It's built with modern tools like TypeScript and Tailwind, which makes for a great development experience.

**@src-tauri/** houses the Rust backend that powers your desktop application. Tauri is such an elegant choice for building native apps with web technologies!

The way you've separated these concerns shows good architectural thinking. The @package.json ties it all together as a monorepo workspace.

Is there any particular part of this structure you'd like me to explain more?`,
          isUser: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 45),
          reactions: {
            "😍": new Set(["user-1"]),
            "🎉": new Set(["user-1", "user-2"]),
          },
        },
      ],
    },
    {
      id: "3",
      title: "Code Quality Analysis",
      lastMessage:
        "Query: Code quality analysis. Analysis Results: The codebase demonstrates modern TypeScript practices...",
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      model: "perplexity",
      messages: [
        {
          id: "3-1",
          content:
            "How's the code quality in @frontend/src/App.tsx and @frontend/src/components/Message.tsx?",
          isUser: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 125),
          reactions: {
            "🤔": new Set(["user-2", "user-3"]),
          },
        },
        {
          id: "3-2",
          content: `Query: "Code quality analysis"

**Analysis Results:**

The codebase demonstrates modern TypeScript practices [1]. Key findings:

• @frontend/src/App.tsx follows React functional component patterns [2]
• @frontend/src/components/Message.tsx implements proper interface definitions [3]
• Component separation adheres to single responsibility principle [4]

**Quality Metrics:**
- TypeScript usage: ✓ Proper interfaces
- React patterns: ✓ Hooks-based architecture  
- Code organization: ✓ Modular structure

**Recommendations:**
- Add error boundaries for production readiness
- Implement unit testing framework
- Consider state management for scaling

**References:**
[1] TypeScript best practices documentation
[2] React functional components guide
[3] Interface design patterns
[4] Clean code architecture principles`,
          isUser: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
          reactions: {
            "💯": new Set(["user-1", "user-2", "user-3"]),
            "🚀": new Set(["user-1"]),
          },
        },
      ],
    },
  ]);

  // Global hotkey listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Get current thread and its messages
  const currentThread = threads.find((t) => t.id === activeThreadId);
  const currentMessages = currentThread?.messages || [];
  const currentModel = currentThread?.model || "gpt-4";

  const handleNewChat = () => {
    const newThread: ChatThread = {
      id: Date.now().toString(),
      title: "New Chat",
      lastMessage: "",
      timestamp: new Date(),
      messages: [],
      model: "gpt-4", // Default model for new chats
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
  };

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  const handleModelChange = (model: string) => {
    if (!activeThreadId) return;

    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === activeThreadId ? { ...thread, model } : thread
      )
    );
  };

  // Handle message reactions
  const handleToggleReaction = (messageId: string, emoji: string) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === activeThreadId) {
          return {
            ...thread,
            messages: thread.messages.map((message) => {
              if (message.id === messageId) {
                const newReactions = { ...message.reactions };

                if (!newReactions[emoji]) {
                  newReactions[emoji] = new Set();
                }

                const userSet = new Set(newReactions[emoji]);

                if (userSet.has(CURRENT_USER_ID)) {
                  userSet.delete(CURRENT_USER_ID);
                } else {
                  userSet.add(CURRENT_USER_ID);
                }

                if (userSet.size === 0) {
                  delete newReactions[emoji];
                } else {
                  newReactions[emoji] = userSet;
                }

                return {
                  ...message,
                  reactions: newReactions,
                };
              }
              return message;
            }),
          };
        }
        return thread;
      })
    );
  };

  // Show toast notifications for demo
  useEffect(() => {
    // Demo toast on first load
    const timer = setTimeout(() => {
      addToast(
        "Welcome to ChatFS! Your files are ready to explore.",
        "success",
        5000
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [addToast]);

  const handleSendMessage = async (content: string) => {
    let targetThreadId = activeThreadId;

    // If no active thread, create one
    if (!activeThreadId) {
      handleNewChat();
      // Use the new thread that will be created
      targetThreadId = Date.now().toString();
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
      reactions: {},
    };

    // Add user message and update thread
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === targetThreadId) {
          const updatedMessages = [...thread.messages, newMessage];
          return {
            ...thread,
            messages: updatedMessages,
            lastMessage: content,
            timestamp: new Date(),
            title:
              thread.title === "New Chat"
                ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
                : thread.title,
          };
        }
        return thread;
      })
    );

    // Show toast for file mentions
    const mentions = content.match(/@[a-zA-Z0-9/_.-]+/g);
    if (mentions && mentions.length > 0) {
      addToast(
        `Found ${mentions.length} file mention${
          mentions.length > 1 ? "s" : ""
        } in your message`,
        "info",
        3000
      );
    }

    // Simulate AI response with model-specific personalities and typing
    const currentThreadModel =
      threads.find((t) => t.id === targetThreadId)?.model || "gpt-4";

    // Show thinking state first
    setIsLoading(true);

    // Thinking delay varies by model - Made much faster
    const thinkingDelay =
      {
        "gpt-4": 800, // Reduced from 2000ms
        claude: 600, // Reduced from 1500ms
        perplexity: 400, // Reduced from 800ms
      }[currentThreadModel] || 600;

    setTimeout(async () => {
      setIsLoading(false);
      setIsTyping(true);

      // Generate model-specific response
      const aiResponseContent = generateModelResponse(
        content,
        currentThreadModel
      );

      // Create initial AI message with empty content and reactions
      const aiMessageId = (Date.now() + 1).toString();
      const initialAiMessage: ChatMessage = {
        id: aiMessageId,
        content: "",
        isUser: false,
        timestamp: new Date(),
        reactions: {},
      };

      // Add empty AI message to thread
      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === targetThreadId) {
            return {
              ...thread,
              messages: [...thread.messages, initialAiMessage],
            };
          }
          return thread;
        })
      );

      // Simulate typing character by character
      await typeMessage(
        aiResponseContent,
        currentThreadModel,
        (partialContent) => {
          // Update message content as it's being typed
          setThreads((prev) =>
            prev.map((thread) => {
              if (thread.id === targetThreadId) {
                return {
                  ...thread,
                  messages: thread.messages.map((msg) =>
                    msg.id === aiMessageId
                      ? { ...msg, content: partialContent }
                      : msg
                  ),
                };
              }
              return thread;
            })
          );
        },
        () => {
          // Typing complete
          setIsTyping(false);

          // Update thread lastMessage
          setThreads((prev) =>
            prev.map((thread) => {
              if (thread.id === targetThreadId) {
                return {
                  ...thread,
                  lastMessage: aiResponseContent.slice(0, 60) + "...",
                  timestamp: new Date(),
                };
              }
              return thread;
            })
          );
        }
      );
    }, thinkingDelay);
  };

  return (
    <div
      className={`h-screen w-screen flex overflow-hidden transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      }`}
    >
      <Sidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onThreadSelect={handleThreadSelect}
        onNewChat={handleNewChat}
      />
      <ChatWindow
        messages={currentMessages}
        selectedModel={currentModel}
        onModelChange={handleModelChange}
        onSendMessage={handleSendMessage}
        onToggleReaction={handleToggleReaction}
        isLoading={isLoading}
        isTyping={isTyping}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNewChat={handleNewChat}
        onThreadSelect={handleThreadSelect}
        onModelChange={handleModelChange}
        threads={threads}
        currentModel={currentModel}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <EmojiPickerProvider>
        <AppContent />
      </EmojiPickerProvider>
    </ThemeProvider>
  );
}

export default App;
