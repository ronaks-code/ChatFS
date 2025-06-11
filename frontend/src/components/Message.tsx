import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import { useFileContent } from "../hooks/useFileContent";
import { useTheme } from "../context/ThemeContext";
import LoadingShimmer from "./LoadingShimmer";
import MessageReactions from "./MessageReactions";
import { useEmojiPicker } from "../context/EmojiPickerContext";

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
  reactions: Record<string, Set<string>>;
  onToggleReaction: (emoji: string) => void;
}

interface FileMention {
  text: string;
  filePath: string;
  startIndex: number;
  endIndex: number;
}

// Mock file previews for fallback when API is unavailable
const fallbackPreviews: Record<string, string> = {
  "README.md": `# ChatFS
A native app for chatting with your files.

## Features
- File system navigation
- Chat-based interface
- Real-time file analysis

## Installation
\`\`\`bash
pnpm install
pnpm run dev
\`\`\`

## Development
This project uses Tauri for the desktop app and React for the frontend.`,
  "package.json": `{
  "name": "chatfs",
  "version": "0.1.0",
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "vite": "^6.3.5"
  }
}`,
};

// Get file preview content with real API or fallback
async function getFilePreview(filePath: string): Promise<string> {
  try {
    const response = await fetch(
      `/api/file?path=${encodeURIComponent(filePath)}`
    );

    if (response.ok) {
      return await response.text();
    } else {
      // Fall back to mock data if API fails
      return getFallbackPreview(filePath);
    }
  } catch (error) {
    console.warn(`Failed to fetch file content for ${filePath}:`, error);
    return getFallbackPreview(filePath);
  }
}

// Get fallback preview content
function getFallbackPreview(filePath: string): string {
  // Try exact match first
  if (fallbackPreviews[filePath]) {
    return fallbackPreviews[filePath];
  }

  // Try just the filename if it's a path
  const filename = filePath.split("/").pop() || filePath;
  if (fallbackPreviews[filename]) {
    return fallbackPreviews[filename];
  }

  // Generate generic preview based on file extension
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "md":
      return `# ${filename}\n\nMarkdown file content...\n\n## Section 1\nSample content here.\n\n## Section 2\nMore content with examples.`;
    case "json":
      return `{\n  "name": "${filename.replace(
        ".json",
        ""
      )}",\n  "version": "1.0.0",\n  "description": "Sample JSON file",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}`;
    case "txt":
      return `${filename}\n${"=".repeat(
        filename.length
      )}\n\nText file content...\nLine 2 with more details\nLine 3 with additional information\n\nEnd of file.`;
    case "py":
      return `# ${filename}\n\ndef main():\n    """Sample Python file"""\n    print("Hello World")\n    \n    # Add your code here\n    result = process_data()\n    return result\n\ndef process_data():\n    return "Processed successfully"\n\nif __name__ == "__main__":\n    main()`;
    case "js":
    case "ts":
    case "tsx":
    case "jsx":
      return `// ${filename}\n\nfunction main() {\n  console.log('Hello World');\n  \n  // Initialize application\n  const app = new Application();\n  app.start();\n  \n  return 0;\n}\n\nclass Application {\n  start() {\n    console.log('Application started');\n  }\n}\n\nmain();`;
    default:
      return `File: ${filename}\n\nBinary or unknown file type.\nPreview not available.\n\nFile size: Unknown\nLast modified: Unknown`;
  }
}

// Get file extension for badge display
function getFileExtension(filePath: string): string {
  const filename = filePath.split("/").pop() || filePath;
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext || "file";
}

// Utility function to parse @mentions from text
function parseFileMentions(text: string): FileMention[] {
  const mentions: FileMention[] = [];
  // Regex to match @filename or @/path/to/file.ext
  // Supports: @README.md, @/docs/plan.txt, @src/components/App.tsx, etc.
  const mentionRegex = /@([a-zA-Z0-9/_.-]+(?:\.[a-zA-Z0-9]+)?)/g;

  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      text: match[0], // Full match including @
      filePath: match[1], // Just the file path without @
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
}

// Component to render a file mention span with hover preview using real content
function FileMentionSpan({
  mention,
  isUser,
  onTogglePreview,
  isPreviewOpen,
}: {
  mention: FileMention;
  isUser: boolean;
  onTogglePreview: (filePath: string) => void;
  isPreviewOpen: boolean;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hoverContent, setHoverContent] = useState<string | null>(null);
  const [hoverLoading, setHoverLoading] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleClick = () => {
    console.log(`Clicked: ${mention.filePath}`);
  };

  const handleMouseEnter = async () => {
    setIsHovering(true);

    // Start loading hover content
    if (!hoverContent && !hoverLoading) {
      setHoverLoading(true);
      try {
        const content = await getFilePreview(mention.filePath);
        setHoverContent(content);
      } catch (error) {
        console.error("Failed to load hover content:", error);
        setHoverContent(getFallbackPreview(mention.filePath));
      } finally {
        setHoverLoading(false);
      }
    }

    // Delay showing preview for better UX
    timeoutRef.current = setTimeout(() => {
      if (isHovering) {
        setShowPreview(true);
      }
    }, 150);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setShowPreview(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const fileExtension = getFileExtension(mention.filePath);

  return (
    <span className="relative inline-block">
      <span
        ref={spanRef}
        title={`View file: ${mention.filePath}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md backdrop-blur border transition-all duration-200 cursor-pointer text-sm font-mono ${
          isUser
            ? "bg-blue-400/20 border-blue-300/30 hover:bg-blue-400/30 hover:border-blue-300/50"
            : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30"
        }`}
      >
        <span>{mention.text}</span>
        <span
          className={`text-xs px-1 py-0.5 rounded text-gray-400 ${
            isUser ? "bg-blue-500/20" : "bg-white/10"
          }`}
        >
          {fileExtension}
        </span>
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onTogglePreview(mention.filePath);
        }}
        className={`ml-2 text-xs transition-all duration-200 ${
          isUser
            ? "text-blue-300 hover:text-blue-100"
            : "text-gray-400 hover:text-gray-200"
        } ${isPreviewOpen ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
        title={isPreviewOpen ? "Hide preview" : "Show preview"}
      >
        {isPreviewOpen ? "⬆ Hide" : "⬇ Preview"}
      </button>

      {/* Hover Preview Tooltip */}
      {showPreview && !isPreviewOpen && (
        <div
          className={`absolute z-50 mt-2 p-4 max-w-sm w-80 rounded-lg border shadow-lg backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${
            isUser
              ? "bg-blue-900/90 border-blue-300/30 text-blue-50"
              : "bg-gray-900/90 border-white/20 text-gray-100"
          }`}
          style={{
            left: "50%",
            transform: "translateX(-50%)",
          }}
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={handleMouseLeave}
        >
          {/* File header */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="text-xs font-medium opacity-80">
              {mention.filePath}
            </span>
          </div>

          {/* File content preview */}
          <div className="max-h-32 overflow-y-auto">
            {hoverLoading ? (
              <div className="p-2">
                <LoadingShimmer lines={4} isUser={isUser} />
              </div>
            ) : (
              <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed opacity-90">
                {hoverContent || "Failed to load content"}
              </pre>
            )}
          </div>

          {/* Small arrow pointing up */}
          <div
            className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 ${
              isUser
                ? "bg-blue-900/90 border-l border-t border-blue-300/30"
                : "bg-gray-900/90 border-l border-t border-white/20"
            }`}
          ></div>
        </div>
      )}
    </span>
  );
}

// Component for rendering inline file previews with real content
function InlineFilePreview({
  mention,
  isUser,
  onClose,
}: {
  mention: FileMention;
  isUser: boolean;
  onClose: () => void;
}) {
  const { content, loading, error } = useFileContent(mention.filePath);
  const fileExtension = getFileExtension(mention.filePath);

  return (
    <div
      className={`rounded-xl border backdrop-blur p-4 shadow-inner transition-all duration-300 ease-out animate-in slide-in-from-top-2 ${
        isUser
          ? "border-blue-300/20 bg-blue-500/10"
          : "border-white/10 bg-white/5"
      }`}
      style={{ maxHeight: "16rem" }}
    >
      {/* File Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <span
            className={`text-xs font-medium ${
              isUser ? "text-blue-200" : "text-gray-300"
            }`}
          >
            {mention.filePath}
          </span>
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-mono ${
              isUser
                ? "bg-blue-400/20 text-blue-300"
                : "bg-white/10 text-gray-400"
            }`}
          >
            .{fileExtension}
          </span>
        </div>
        <button
          onClick={onClose}
          className={`text-xs px-2 py-1 rounded transition-colors ${
            isUser
              ? "text-blue-300 hover:text-blue-100 hover:bg-blue-400/10"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/10"
          }`}
        >
          ✕
        </button>
      </div>

      {/* File Content */}
      <div className="overflow-y-auto" style={{ maxHeight: "12rem" }}>
        {loading ? (
          <div className="py-4">
            <LoadingShimmer lines={8} isUser={isUser} />
          </div>
        ) : error ? (
          <div
            className={`text-xs ${isUser ? "text-red-300" : "text-red-400"}`}
          >
            <div className="mb-2">⚠️ Failed to load file content</div>
            <div className="opacity-70">{error}</div>
            <div className="mt-2 opacity-60">Showing fallback content:</div>
            <pre
              className={`mt-2 whitespace-pre-wrap font-mono leading-relaxed ${
                isUser ? "text-blue-100/70" : "text-white/60"
              }`}
            >
              {getFallbackPreview(mention.filePath)}
            </pre>
          </div>
        ) : (
          <pre
            className={`whitespace-pre-wrap text-xs font-mono leading-relaxed ${
              isUser ? "text-blue-100/90" : "text-white/80"
            }`}
          >
            {content || "No content available"}
          </pre>
        )}
      </div>
    </div>
  );
}

// Function to render text with @mentions as styled components
function renderContentWithMentions(
  content: string,
  isUser: boolean,
  onTogglePreview: (filePath: string) => void,
  expandedPreviews: Set<string>
): ReactNode[] {
  const mentions = parseFileMentions(content);

  if (mentions.length === 0) {
    return [content];
  }

  const elements: ReactNode[] = [];
  let lastIndex = 0;

  mentions.forEach((mention, index) => {
    // Add text before the mention
    if (mention.startIndex > lastIndex) {
      elements.push(content.slice(lastIndex, mention.startIndex));
    }

    // Add the mention component
    elements.push(
      <FileMentionSpan
        key={`mention-${index}`}
        mention={mention}
        isUser={isUser}
        onTogglePreview={onTogglePreview}
        isPreviewOpen={expandedPreviews.has(mention.filePath)}
      />
    );

    lastIndex = mention.endIndex;
  });

  // Add remaining text after the last mention
  if (lastIndex < content.length) {
    elements.push(content.slice(lastIndex));
  }

  return elements;
}

export default function Message({
  content,
  isUser,
  timestamp,
  reactions,
  onToggleReaction,
}: MessageProps) {
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(
    new Set()
  );
  const [isVisible, setIsVisible] = useState(false);
  const [messageId] = useState(() => `message-${Date.now()}-${Math.random()}`);
  const messageRef = useRef<HTMLDivElement>(null);
  const reactionButtonRef = useRef<HTMLButtonElement>(null);
  const { isDark } = useTheme();
  const {
    setActivePickerId,
    setPickerPosition,
    setActivePickerProps,
    isPickerActive,
  } = useEmojiPicker();

  // Animate message on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleTogglePreview = (filePath: string) => {
    setExpandedPreviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
        // Auto-scroll into view when opening
        setTimeout(() => {
          messageRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 100);
      }
      return newSet;
    });
  };

  const handleOpenEmojiPicker = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (reactionButtonRef.current) {
      const rect = reactionButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 8,
      });
    }

    setActivePickerProps({
      onClose: () => setActivePickerId(null),
      onEmojiSelect: (emoji: string) => {
        onToggleReaction(emoji);
        setActivePickerId(null);
      },
      isUser,
    });

    // Close any other open picker and open this one
    setActivePickerId(messageId);
  };

  const renderedContent = renderContentWithMentions(
    content,
    isUser,
    handleTogglePreview,
    expandedPreviews
  );
  const mentions = parseFileMentions(content);
  const expandedMentions = mentions.filter((mention) =>
    expandedPreviews.has(mention.filePath)
  );

  const isEmojiPickerOpen = isPickerActive(messageId);

  return (
    <div
      ref={messageRef}
      className={`group flex w-full ${
        isUser ? "justify-end" : "justify-start"
      } mb-4 relative transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      onContextMenu={handleOpenEmojiPicker}
    >
      <div className="max-w-[80%] relative">
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.01] relative ${
            isUser
              ? isDark
                ? "bg-blue-500/20 backdrop-blur-md border border-blue-300/20 text-blue-50"
                : "bg-blue-100/70 backdrop-blur-md border border-blue-200/30 text-blue-900"
              : isDark
              ? "bg-white/10 backdrop-blur-md border border-white/10 text-gray-100"
              : "bg-white/70 backdrop-blur-md border border-gray-200/20 text-gray-900"
          }`}
        >
          {/* Reaction Button (appears on hover or when picker is open) */}
          <button
            ref={reactionButtonRef}
            onClick={handleOpenEmojiPicker}
            className={`absolute -top-2 ${isUser ? "-left-8" : "-right-8"} ${
              isEmojiPickerOpen
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            } transition-all duration-200 w-6 h-6 rounded-full border backdrop-blur-sm flex items-center justify-center text-sm hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isUser
                ? isDark
                  ? "bg-blue-500/20 border-blue-300/30 text-blue-200 hover:bg-blue-500/30 hover:text-blue-100"
                  : "bg-blue-200/50 border-blue-300/40 text-blue-700 hover:bg-blue-300/50 hover:text-blue-800"
                : isDark
                ? "bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 hover:text-white"
                : "bg-gray-100/50 border-gray-200/30 text-gray-600 hover:bg-gray-200/50 hover:text-gray-700"
            }`}
            title="Add reaction"
            aria-label="Add emoji reaction"
            tabIndex={0}
          >
            +
          </button>

          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {renderedContent}
          </div>
          {timestamp && (
            <div
              className={`text-xs mt-2 opacity-60 transition-opacity duration-200 group-hover:opacity-80 ${
                isUser
                  ? isDark
                    ? "text-blue-200"
                    : "text-blue-700"
                  : isDark
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              {timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>

        {/* Message Reactions */}
        <MessageReactions
          reactions={reactions}
          onToggleReaction={onToggleReaction}
          isUser={isUser}
        />

        {/* Inline File Previews with Real Content */}
        {expandedMentions.length > 0 && (
          <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top duration-300">
            {expandedMentions.map((mention, index) => (
              <div
                key={`preview-${index}`}
                className="animate-in fade-in slide-in-from-top duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <InlineFilePreview
                  mention={mention}
                  isUser={isUser}
                  onClose={() => handleTogglePreview(mention.filePath)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
