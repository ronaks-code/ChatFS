import { useEffect, useRef } from "react";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  position: { x: number; y: number };
  isUser?: boolean;
}

const REACTION_EMOJIS = [
  "😂",
  "❤️",
  "🚀",
  "😍",
  "👍",
  "👎",
  "🔥",
  "🎉",
  "😢",
  "😡",
  "🤔",
  "✨",
];

export default function EmojiPicker({
  isOpen,
  onClose,
  onEmojiSelect,
  position,
  isUser = false,
}: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Calculate safe positioning to avoid going off-screen
  const getAdjustedPosition = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pickerWidth = 192; // Approximate width (6 * 32px)
    const pickerHeight = 100; // Approximate height

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Ensure picker doesn't go off-screen horizontally
    if (adjustedX - pickerWidth / 2 < 10) {
      adjustedX = pickerWidth / 2 + 10;
    } else if (adjustedX + pickerWidth / 2 > viewportWidth - 10) {
      adjustedX = viewportWidth - pickerWidth / 2 - 10;
    }

    // Ensure picker doesn't go off-screen vertically
    if (adjustedY + pickerHeight > viewportHeight - 10) {
      adjustedY = position.y - pickerHeight - 16; // Position above trigger
    }

    return { x: adjustedX, y: adjustedY };
  };

  if (!isOpen) return null;

  const adjustedPosition = getAdjustedPosition();

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 z-[9998] md:hidden" onClick={onClose} />

      {/* Emoji Picker - Maximum z-index to appear above everything */}
      <div
        ref={pickerRef}
        className={`fixed z-[9999] p-3 rounded-xl border shadow-xl backdrop-blur-lg animate-in fade-in slide-in-from-top-2 duration-200 ${
          isUser
            ? "bg-blue-900/90 border-blue-300/30"
            : "bg-gray-900/90 border-white/20"
        }`}
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
          transform: "translateX(-50%)",
        }}
      >
        {/* Header */}
        <div
          className={`text-xs font-medium mb-2 ${
            isUser ? "text-blue-200" : "text-gray-300"
          }`}
        >
          React with emoji
        </div>

        {/* Emoji Grid */}
        <div className="grid grid-cols-6 gap-1">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
              className={`w-8 h-8 flex items-center justify-center text-lg rounded-lg transition-all duration-150 hover:scale-110 ${
                isUser
                  ? "hover:bg-blue-500/20 active:bg-blue-500/30"
                  : "hover:bg-white/10 active:bg-white/20"
              }`}
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Arrow */}
        <div
          className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 ${
            isUser
              ? "bg-blue-900/90 border-l border-t border-blue-300/30"
              : "bg-gray-900/90 border-l border-t border-white/20"
          }`}
        />
      </div>
    </>
  );
}
