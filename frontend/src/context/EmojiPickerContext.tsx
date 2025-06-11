import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface EmojiPickerContextValue {
  activePickerId: string | null;
  setActivePickerId: (id: string | null) => void;
  isPickerActive: (id: string) => boolean;
  pickerPosition: { x: number; y: number } | null;
  setPickerPosition: (position: { x: number; y: number } | null) => void;
  activePickerProps: {
    onClose: () => void;
    onEmojiSelect: (emoji: string) => void;
    isUser?: boolean;
  } | null;
  setActivePickerProps: (
    props: {
      onClose: () => void;
      onEmojiSelect: (emoji: string) => void;
      isUser?: boolean;
    } | null
  ) => void;
}

const EmojiPickerContext = createContext<EmojiPickerContextValue | undefined>(
  undefined
);

export function EmojiPickerProvider({ children }: { children: ReactNode }) {
  const [activePickerId, setActivePickerId] = useState<string | null>(null);
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [activePickerProps, setActivePickerProps] = useState<{
    onClose: () => void;
    onEmojiSelect: (emoji: string) => void;
    isUser?: boolean;
  } | null>(null);

  const isPickerActive = (id: string) => activePickerId === id;

  return (
    <EmojiPickerContext.Provider
      value={{
        activePickerId,
        setActivePickerId,
        isPickerActive,
        pickerPosition,
        setPickerPosition,
        activePickerProps,
        setActivePickerProps,
      }}
    >
      {children}
      {activePickerId && pickerPosition && activePickerProps && (
        <EmojiPickerPortal
          position={pickerPosition}
          onClose={activePickerProps.onClose}
          onEmojiSelect={activePickerProps.onEmojiSelect}
          isUser={activePickerProps.isUser}
        />
      )}
    </EmojiPickerContext.Provider>
  );
}

function EmojiPickerPortal({
  position,
  onClose,
  onEmojiSelect,
  isUser,
}: {
  position: { x: number; y: number };
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  isUser?: boolean;
}) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999]" onClick={handleBackdropClick}>
      <div
        className="fixed z-[9999] p-3 rounded-xl border shadow-xl backdrop-blur-lg animate-in fade-in slide-in-from-top-2 duration-200"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translateX(-50%)",
          backgroundColor: isUser
            ? "rgba(30, 58, 138, 0.9)"
            : "rgba(17, 24, 39, 0.9)",
          borderColor: isUser
            ? "rgba(147, 197, 253, 0.3)"
            : "rgba(255, 255, 255, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`text-xs font-medium mb-2 ${
            isUser ? "text-blue-200" : "text-gray-300"
          }`}
        >
          React with emoji
        </div>
        <div className="grid grid-cols-6 gap-1">
          {[
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
          ].map((emoji) => (
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
        <div
          className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 ${
            isUser
              ? "bg-blue-900/90 border-l border-t border-blue-300/30"
              : "bg-gray-900/90 border-l border-t border-white/20"
          }`}
        />
      </div>
    </div>,
    document.body
  );
}

export function useEmojiPicker() {
  const context = useContext(EmojiPickerContext);
  if (context === undefined) {
    throw new Error(
      "useEmojiPicker must be used within an EmojiPickerProvider"
    );
  }
  return context;
}
