interface LoadingShimmerProps {
  lines?: number;
  isUser?: boolean;
}

export default function LoadingShimmer({
  lines = 3,
  isUser = false,
}: LoadingShimmerProps) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-3 rounded-md ${
            isUser ? "bg-blue-400/20" : "bg-white/10"
          }`}
          style={{
            width: `${60 + Math.random() * 30}%`,
            animationDelay: `${index * 100}ms`,
          }}
        />
      ))}
    </div>
  );
}
