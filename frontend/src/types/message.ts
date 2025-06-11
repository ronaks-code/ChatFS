export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  reactions: Record<string, Set<string>>; // emoji -> user IDs
}

export interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: ChatMessage[];
  model: string;
}

// Current user ID for reactions (mock for now)
export const CURRENT_USER_ID = "user-1";
