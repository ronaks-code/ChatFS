import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const models = [
  {
    id: "gpt-4",
    name: "GPT-4",
    color: "bg-green-400",
    description: "Most capable, thoughtful responses",
    icon: "🤖",
  },
  {
    id: "claude",
    name: "Claude",
    color: "bg-purple-400",
    description: "Conversational, friendly analysis",
    icon: "🧠",
  },
  {
    id: "perplexity",
    name: "Perplexity",
    color: "bg-blue-400",
    description: "Fast, research-focused answers",
    icon: "🔍",
  },
];

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModelData =
    models.find((m) => m.id === selectedModel) || models[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          isDark
            ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
            : "bg-white/70 border-gray-200/30 text-gray-900 hover:bg-white/90"
        }`}
      >
        <span className="text-sm font-medium">{selectedModelData.name}</span>
        <span className="text-lg">{selectedModelData.icon}</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl backdrop-blur-xl z-[9999] animate-in fade-in slide-in-from-top-2 duration-200 ${
            isDark
              ? "bg-gray-900/90 border-white/10"
              : "bg-white/90 border-gray-200/20"
          }`}
        >
          <div className="p-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left rounded-lg transition-colors duration-150 flex items-center gap-2 ${
                  model.id === selectedModel
                    ? isDark
                      ? "bg-white/10 text-white"
                      : "bg-gray-100 text-gray-900"
                    : isDark
                    ? "text-gray-300 hover:bg-white/5"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{model.icon}</span>
                <span className="text-sm font-medium">{model.name}</span>
                {model.id === selectedModel && (
                  <span className="ml-auto text-xs opacity-60">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
