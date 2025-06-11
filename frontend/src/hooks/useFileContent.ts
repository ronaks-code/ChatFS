import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface UseFileContentResult {
  content: string | null;
  loading: boolean;
  error: string | null;
}

// Mock file previews for fallback when backend is unavailable
const fallbackPreviews: Record<string, string> = {
  "README.md": `# ChatFS
A native app for chatting with your files.

## Features
- File system navigation
- Chat-based interface
- Real-time file analysis

## Installation
\`\`\`bash
pnpm install
pnpm run dev
\`\`\`

## Development
This project uses Tauri for the desktop app and React for the frontend.`,
  "package.json": `{
  "name": "chatfs",
  "version": "0.1.0",
  "scripts": {
    "dev": "tauri dev",
    "build": "tauri build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.0.0",
    "vite": "^6.3.5"
  }
}`,
};

function getFallbackPreview(filePath: string): string {
  // Try exact match first
  if (fallbackPreviews[filePath]) {
    return fallbackPreviews[filePath];
  }

  // Try just the filename if it's a path
  const filename = filePath.split("/").pop() || filePath;
  if (fallbackPreviews[filename]) {
    return fallbackPreviews[filename];
  }

  // Generate generic preview based on file extension
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "md":
      return `# ${filename}\n\nMarkdown file content...\n\n## Section 1\nSample content here.\n\n## Section 2\nMore content with examples.`;
    case "json":
      return `{\n  "name": "${filename.replace(
        ".json",
        ""
      )}",\n  "version": "1.0.0",\n  "description": "Sample JSON file",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  }\n}`;
    case "txt":
      return `${filename}\n${"=".repeat(
        filename.length
      )}\n\nText file content...\nLine 2 with more details\nLine 3 with additional information\n\nEnd of file.`;
    case "py":
      return `# ${filename}\n\ndef main():\n    """Sample Python file"""\n    print("Hello World")\n    \n    # Add your code here\n    result = process_data()\n    return result\n\ndef process_data():\n    return "Processed successfully"\n\nif __name__ == "__main__":\n    main()`;
    case "js":
    case "ts":
    case "tsx":
    case "jsx":
      return `// ${filename}\n\nfunction main() {\n  console.log('Hello World');\n  \n  // Initialize application\n  const app = new Application();\n  app.start();\n  \n  return 0;\n}\n\nclass Application {\n  start() {\n    console.log('Application started');\n  }\n}\n\nmain();`;
    case "rs":
      return `// ${filename}\n\nfn main() {\n    println!("Hello, world!");\n    \n    // Initialize application\n    let app = Application::new();\n    app.start();\n}\n\nstruct Application;\n\nimpl Application {\n    fn new() -> Self {\n        Application\n    }\n    \n    fn start(&self) {\n        println!("Application started");\n    }\n}`;
    default:
      return `File: ${filename}\n\nBinary or unknown file type.\nPreview not available.\n\nFile size: Unknown\nLast modified: Unknown`;
  }
}

export function useFileContent(filePath: string): UseFileContentResult {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) {
      setContent(null);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to get content using Tauri command
        const fileContent = await invoke<string>("read_file_content", {
          path: filePath,
        });

        setContent(fileContent);
        setError(null);
      } catch (backendError) {
        console.warn(`Backend failed for ${filePath}:`, backendError);

        // Fall back to mock content
        const fallbackContent = getFallbackPreview(filePath);
        setContent(fallbackContent);
        setError(
          `Could not load real file content. Showing fallback content. Backend error: ${backendError}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [filePath]);

  return { content, loading, error };
}
