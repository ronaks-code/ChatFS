import { useEffect, useState } from "react";
import type { Toast, ToastType } from "../hooks/useToast";

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastIcons: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const toastStyles: Record<ToastType, string> = {
  success: "bg-green-500/20 border-green-400/30 text-green-100",
  error: "bg-red-500/20 border-red-400/30 text-red-100",
  warning: "bg-yellow-500/20 border-yellow-400/30 text-yellow-100",
  info: "bg-blue-500/20 border-blue-400/30 text-blue-100",
};

function SingleToast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    // Wait for exit animation before removing
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={`relative p-4 rounded-xl border backdrop-blur-lg shadow-lg transition-all duration-200 transform cursor-pointer group ${
        toastStyles[toast.type]
      } ${
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}
      onClick={handleRemove}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">
          {toastIcons[toast.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed break-words">
            {toast.message}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white/60 hover:text-white/80 ml-2"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({
  toasts,
  onRemove,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9998] space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToast toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
