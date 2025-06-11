import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface SearchResult {
  path: string;
  snippet: string;
  score: number;
}

interface UseSemanticSearchResult {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string, topK?: number) => Promise<void>;
}

// Mock search results for fallback when backend is unavailable
const mockSearchResults: SearchResult[] = [
  {
    path: "src/components/ChatWindow.tsx",
    snippet:
      "React component for the main chat interface with semantic search integration...",
    score: 0.95,
  },
  {
    path: "src/hooks/useFileContent.ts",
    snippet:
      "Custom hook for loading file content with caching and error handling...",
    score: 0.87,
  },
  {
    path: "README.md",
    snippet:
      "ChatFS - A native app for chatting with your files using semantic search...",
    score: 0.82,
  },
];

export function useSemanticSearch(): UseSemanticSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, topK: number = 10) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to search using Tauri command
      const searchResults = await invoke<SearchResult[]>(
        "search_files_command",
        {
          query: query.trim(),
          topK,
        }
      );

      setResults(searchResults);
      setError(null);
    } catch (backendError) {
      console.warn(`Search backend failed for query "${query}":`, backendError);

      // Fall back to mock results filtered by query
      const filteredMockResults = mockSearchResults.filter(
        (result) =>
          result.path.toLowerCase().includes(query.toLowerCase()) ||
          result.snippet.toLowerCase().includes(query.toLowerCase())
      );

      setResults(filteredMockResults);
      setError(`Using fallback search results. Backend error: ${backendError}`);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}
