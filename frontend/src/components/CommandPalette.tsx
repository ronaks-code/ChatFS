import { useState, useEffect, useRef } from "react";
import { useSemanticSearch } from "../hooks/useSemanticSearch";
import { useTheme } from "../context/ThemeContext";

interface CommandAction {
  id: string;
  label: string;
  category: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onThreadSelect: (threadId: string) => void;
  onModelChange: (model: string) => void;
  threads: Array<{
    id: string;
    title: string;
    model: string;
  }>;
  currentModel: string;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNewChat,
  onThreadSelect,
  onModelChange,
  threads,
  currentModel,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();
  const {
    results: searchResults,
    loading: searchLoading,
    search,
  } = useSemanticSearch();

  // Detect if user is doing a semantic search (starts with "search:" or contains file-related keywords)
  const detectSearchMode = (queryText: string) => {
    const searchTriggers = [
      "search:",
      "find:",
      "look for:",
      "show me:",
      "files with:",
      "function",
      "component",
      "import",
      "export",
      "class",
      "interface",
    ];
    return searchTriggers.some((trigger) =>
      queryText.toLowerCase().includes(trigger)
    );
  };

  // Generate actions based on props
  const generateActions = (): CommandAction[] => {
    const actions: CommandAction[] = [
      // Chat actions
      {
        id: "new-chat",
        label: "New Chat",
        category: "Chats",
        icon: "💬",
        action: () => {
          onNewChat();
          onClose();
        },
      },
      ...threads.map((thread) => ({
        id: `thread-${thread.id}`,
        label: `Jump to: ${thread.title}`,
        category: "Chats",
        icon: "🗂️",
        action: () => {
          onThreadSelect(thread.id);
          onClose();
        },
      })),

      // Model actions
      {
        id: "model-gpt4",
        label: "Switch to GPT-4",
        category: "Models",
        icon: "🤖",
        shortcut: currentModel === "gpt-4" ? "✓ Current" : undefined,
        action: () => {
          onModelChange("gpt-4");
          onClose();
        },
      },
      {
        id: "model-claude",
        label: "Switch to Claude",
        category: "Models",
        icon: "🧠",
        shortcut: currentModel === "claude" ? "✓ Current" : undefined,
        action: () => {
          onModelChange("claude");
          onClose();
        },
      },
      {
        id: "model-perplexity",
        label: "Switch to Perplexity",
        category: "Models",
        icon: "🔍",
        shortcut: currentModel === "perplexity" ? "✓ Current" : undefined,
        action: () => {
          onModelChange("perplexity");
          onClose();
        },
      },

      // File actions (simulated)
      {
        id: "file-readme",
        label: "Search: README.md",
        category: "Files",
        icon: "📄",
        action: () => {
          // Simulate file search/open
          console.log("Opening README.md");
          onClose();
        },
      },
      {
        id: "file-package",
        label: "Search: package.json",
        category: "Files",
        icon: "📦",
        action: () => {
          console.log("Opening package.json");
          onClose();
        },
      },
      {
        id: "file-components",
        label: "Search: /src/components/",
        category: "Files",
        icon: "📁",
        action: () => {
          console.log("Opening components folder");
          onClose();
        },
      },
      {
        id: "file-message",
        label: "Search: Message.tsx",
        category: "Files",
        icon: "⚛️",
        action: () => {
          console.log("Opening Message.tsx");
          onClose();
        },
      },
    ];

    return actions;
  };

  const actions = generateActions();

  // Convert search results to command actions
  const searchActions: CommandAction[] = searchResults.map((result, index) => ({
    id: `search-result-${index}`,
    label: `Open: ${result.path}`,
    category: "Search Results",
    icon: "📄",
    shortcut: result.score ? `${Math.round(result.score * 100)}%` : undefined,
    action: () => {
      // Add the file as a message with @mention and create new chat
      onNewChat();
      // Log for debugging - in real implementation this would send the message
      console.log(`Opening file: ${result.path}`);
      console.log(`Snippet: ${result.snippet}`);
      onClose();
    },
  }));

  // Determine what to show based on search mode
  const displayActions = isSearchMode
    ? searchActions
    : actions.filter(
        (action) =>
          action.label.toLowerCase().includes(query.toLowerCase()) ||
          action.category.toLowerCase().includes(query.toLowerCase())
      );

  // Group actions by category
  const groupedActions = displayActions.reduce((groups, action) => {
    const category = action.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(action);
    return groups;
  }, {} as Record<string, CommandAction[]>);

  // Update selected index when display actions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayActions.length]);

  // Handle search when query changes
  useEffect(() => {
    const searchMode = detectSearchMode(query);
    setIsSearchMode(searchMode);

    if (searchMode && query.length > 2) {
      // Extract search query (remove triggers like "search:")
      const cleanQuery = query
        .replace(/^(search:|find:|look for:|show me:|files with:)\s*/i, "")
        .trim();
      if (cleanQuery.length > 0) {
        search(cleanQuery, 8); // Get top 8 results
      }
    } else if (!searchMode) {
      // Clear search results by searching with empty query
      search("", 0);
    }
  }, [query, search]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
      setSelectedIndex(0);
      setIsSearchMode(false);
      // Clear search results
      search("", 0);
    }
  }, [isOpen, search]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < displayActions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : displayActions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (displayActions[selectedIndex]) {
            displayActions[selectedIndex].action();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, displayActions, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[9997] transition-opacity duration-200 ${
          isOpen
            ? "opacity-100 bg-black/20 backdrop-blur-sm"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Command Palette */}
      <div
        className={`fixed inset-x-4 top-[20%] z-[9998] mx-auto max-w-2xl transition-all duration-200 ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div
          className={`rounded-2xl border shadow-2xl backdrop-blur-xl ${
            isDark
              ? "bg-gray-900/90 border-white/10"
              : "bg-white/90 border-gray-200/20"
          }`}
        >
          {/* Search Input */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, files, or type 'search:' to find files..."
                className={`w-full px-4 py-3 pl-10 pr-4 rounded-xl bg-transparent border transition-colors duration-200 ${
                  isDark
                    ? "text-white placeholder-gray-400 border-white/10 focus:border-white/20"
                    : "text-gray-900 placeholder-gray-500 border-gray-200/50 focus:border-gray-300/50"
                }`}
              />
              <div
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-lg ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                🔍
              </div>
            </div>
          </div>

          {/* Results */}
          <div
            className={`max-h-[60vh] overflow-y-auto p-2 ${
              isDark ? "scrollbar-dark" : "scrollbar-light"
            }`}
          >
            {Object.entries(groupedActions).map(([category, actions]) => (
              <div key={category} className="mb-2">
                <div
                  className={`px-3 py-1.5 text-xs font-medium ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {category}
                </div>
                {actions.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-colors duration-150 flex items-center gap-3 ${
                      index === selectedIndex
                        ? isDark
                          ? "bg-white/10 text-white"
                          : "bg-gray-100 text-gray-900"
                        : isDark
                        ? "text-gray-300 hover:bg-white/5"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{action.icon}</span>
                    <span className="flex-1 truncate">{action.label}</span>
                    {action.shortcut && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          isDark
                            ? "bg-white/10 text-gray-300"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {action.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {/* Loading State */}
            {isSearchMode && searchLoading && (
              <div className="p-4 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              </div>
            )}

            {/* No Results */}
            {!searchLoading && displayActions.length === 0 && (
              <div className="p-4 text-center">
                <div className="text-sm text-gray-400">
                  No results found for "{query}"
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className={`p-3 border-t ${
              isDark ? "border-white/10" : "border-gray-200/20"
            }`}
          >
            <div
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10">Esc</kbd>{" "}
              to close •{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">↑↓</kbd> to
              navigate •{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-white/10">Enter</kbd> to
              select
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
