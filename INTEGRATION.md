# ChatFS File Integration Guide

## Overview

ChatFS now supports real-time file content integration through a local Qdrant-powered backend. This guide explains how the frontend connects to the Rust API for file indexing and semantic search.

## API Integration

### File Content Endpoint

**GET** `/api/file?path={filePath}`

Returns the raw content of a file as a string.

**Example:**

```bash
curl "http://localhost:8080/api/file?path=src/App.tsx"
```

**Response:**

```typescript
import { useState } from "react";
// ... file content
```

### Semantic Search Endpoint

**POST** `/api/search`

Performs semantic search across indexed files using Qdrant.

**Request Body:**

```json
{
  "query": "React components that handle state",
  "top_k": 5
}
```

**Response:**

```json
[
  {
    "path": "src/components/ChatWindow.tsx",
    "snippet": "const [messages, setMessages] = useState<Message[]>([]);",
    "score": 0.89
  },
  {
    "path": "src/hooks/useFileContent.ts",
    "snippet": "const [content, setContent] = useState<string | null>(null);",
    "score": 0.76
  }
]
```

## Frontend Features

### Real File Content Integration

- **Hover Previews**: Files mentioned with `@filename` show real content on hover
- **Inline Previews**: Expandable file content blocks within chat messages
- **Error Handling**: Graceful fallback to mock content when API is unavailable
- **Caching**: File content is cached to avoid repeated API calls

### Semantic Search

- **Command Palette Search**: Type `search:` in ⌘K palette to search files semantically
- **Smart Triggers**: Keywords like "function", "component", "import" automatically enable search mode
- **Search Results**: Files are ranked by semantic similarity with snippets

### Performance Optimizations

- **Faster Typing**: All AI models now type 3-5x faster for snappy responses
- **Reduced Thinking Time**: Thinking delays reduced from 2s → 0.8s max
- **Content Caching**: File contents cached in memory to avoid repeated fetches
- **Loading States**: Shimmer animations for better perceived performance

## Development Setup

1. **Start Rust Backend** (port 8080):

   ```bash
   cd src-tauri
   cargo run --bin api-server
   ```

2. **Start Frontend** (port 5175):

   ```bash
   cd frontend
   pnpm dev
   ```

3. **API Proxy**: Vite automatically proxies `/api/*` requests to `localhost:8080`

## File Mention Workflow

1. User drags file into chat or types `@filename`
2. `@mention` appears with file extension badge
3. **Hover**: Triggers `useFileContent` hook → API call → shows preview tooltip
4. **Click Preview**: Expands inline content block with full file content
5. **Search**: ⌘K → "search: React hooks" → semantic results from Qdrant

## Error Handling

- **API Unavailable**: Falls back to realistic mock content
- **File Not Found**: Shows "File not found" error with fallback preview
- **Network Errors**: Displays error message with retry option
- **Loading States**: Shimmer animations during API calls

## Customization

### API Endpoint Configuration

Update the proxy target in `frontend/vite.config.ts`:

```typescript
'/api': {
  target: 'http://localhost:3000', // Your custom port
  changeOrigin: true,
  secure: false,
},
```

### Search Configuration

Adjust search parameters in `CommandPalette.tsx`:

```typescript
search(cleanQuery, 10); // Increase top_k results
```

### Caching Configuration

Modify cache behavior in `useFileContent.ts`:

```typescript
// Clear cache after 5 minutes
setTimeout(() => fileContentCache.delete(path), 5 * 60 * 1000);
```

## Testing

Test the integration with these scenarios:

1. **File Content**: Drop a real file, verify @mention shows actual content
2. **Hover Preview**: Hover over @mention, confirm real file content loads
3. **Inline Preview**: Click "Preview" button, verify full content displays
4. **Search**: Use ⌘K, type "search: useState", confirm semantic results
5. **Error Handling**: Stop backend, verify graceful fallback to mocks
6. **Performance**: Check typing speed feels snappy and responsive

## Future Enhancements

- **File Editing**: Edit files directly in chat interface
- **Diff Previews**: Show file changes over time
- **Directory Indexing**: Browse and search entire project structures
- **Real-time Updates**: Watch for file changes and update index
- **Advanced Search**: Filter by file type, size, date modified
