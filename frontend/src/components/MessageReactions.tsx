import { CURRENT_USER_ID } from "../types/message";

interface MessageReactionsProps {
  reactions: Record<string, Set<string>>;
  onToggleReaction: (emoji: string) => void;
  isUser?: boolean;
}

export default function MessageReactions({
  reactions,
  onToggleReaction,
  isUser = false,
}: MessageReactionsProps) {
  const hasReactions = Object.keys(reactions).length > 0;

  if (!hasReactions) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {Object.entries(reactions).map(([emoji, userIds]) => {
        const count = userIds.size;
        const hasUserReacted = userIds.has(CURRENT_USER_ID);

        if (count === 0) return null;

        return (
          <button
            key={emoji}
            onClick={() => onToggleReaction(emoji)}
            className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full backdrop-blur border transition-all duration-200 hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-1 ${
              hasUserReacted
                ? isUser
                  ? "bg-blue-500/30 border-blue-300/50 text-blue-100 ring-1 ring-blue-300/30"
                  : "bg-white/20 border-white/40 text-white ring-1 ring-white/30"
                : isUser
                ? "bg-blue-400/10 border-blue-300/20 text-blue-200 hover:bg-blue-400/20 hover:border-blue-300/30"
                : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
            }`}
            title={
              hasUserReacted
                ? `You and ${count - 1} others reacted with ${emoji}`
                : `${count} ${
                    count === 1 ? "person" : "people"
                  } reacted with ${emoji}`
            }
          >
            <span className="leading-none">{emoji}</span>
            {count > 1 && (
              <span
                className={`text-xs font-medium ${
                  hasUserReacted
                    ? isUser
                      ? "text-blue-100"
                      : "text-white"
                    : isUser
                    ? "text-blue-300"
                    : "text-gray-400"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
