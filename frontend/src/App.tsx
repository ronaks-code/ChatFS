import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [count, setCount] = useState(0);
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const testFileAccess = async () => {
    try {
      setError("");
      const homeDir = "/Users";
      const result = await invoke<string[]>("list_files", { path: homeDir });
      setFiles(result);
    } catch (err) {
      setError(err as string);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🗂️ ChatFS</h1>
          <p className="text-xl text-gray-600 mb-8">
            Cursor for Your File System
          </p>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white mb-8">
            <h2 className="text-2xl font-semibold mb-4">What It Does</h2>
            <ul className="text-left space-y-2">
              <li>💬 Chat with your files and folders</li>
              <li>🧠 Per-folder memory with saved threads</li>
              <li>🧩 Modular chats you can organize</li>
              <li>🔗 Real file sync with your system</li>
              <li>🔄 Multi-model support (GPT-4, Claude, Perplexity)</li>
            </ul>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => setCount((count) => count + 1)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 mr-4"
            >
              Test Button (clicked {count} times)
            </button>
            <button
              onClick={testFileAccess}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Test File Access 🗂️
            </button>
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {error}
              </div>
            )}
            {files.length > 0 && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <h3 className="font-semibold mb-2">Files in /Users:</h3>
                <ul className="text-left max-h-32 overflow-y-auto">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm">
                      📁 {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Tailwind CSS is working! 🎉 Ready for Tauri integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
