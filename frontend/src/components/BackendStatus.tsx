import { useBackendStatus } from "../hooks/useBackendStatus";
import { useTheme } from "../context/ThemeContext";

interface BackendStatusProps {
  className?: string;
}

export default function BackendStatus({ className = "" }: BackendStatusProps) {
  const { isConnected, lastChecked, error } = useBackendStatus();
  const { isDark } = useTheme();

  if (!lastChecked) {
    return null; // Still checking
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
        isConnected
          ? isDark
            ? "bg-green-500/20 border border-green-400/30"
            : "bg-green-100/70 border border-green-200/50"
          : isDark
          ? "bg-orange-500/20 border border-orange-400/30"
          : "bg-orange-100/70 border border-orange-200/50"
      } ${className}`}
    >
      {/* Status Indicator */}
      <div
        className={`w-2 h-2 rounded-full animate-pulse ${
          isConnected ? "bg-green-400" : "bg-orange-400"
        }`}
      />

      {/* Status Text */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-xs font-medium ${
            isConnected
              ? isDark
                ? "text-green-300"
                : "text-green-700"
              : isDark
              ? "text-orange-300"
              : "text-orange-700"
          }`}
        >
          {isConnected ? "Backend Connected" : "Fallback Mode"}
        </div>
        <div
          className={`text-xs opacity-70 ${
            isConnected
              ? isDark
                ? "text-green-400"
                : "text-green-600"
              : isDark
              ? "text-orange-400"
              : "text-orange-600"
          }`}
        >
          {isConnected ? "Real file search & content" : "Using mock data"}
        </div>
      </div>

      {/* Tooltip for errors */}
      {!isConnected && error && (
        <div
          className={`text-xs opacity-60 truncate max-w-[120px] ${
            isDark ? "text-orange-300" : "text-orange-600"
          }`}
          title={error}
        >
          {error.slice(0, 20)}...
        </div>
      )}
    </div>
  );
}
