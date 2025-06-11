import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface BackendStatus {
  isConnected: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    isConnected: false,
    lastChecked: null,
    error: null,
  });

  const checkBackendStatus = async () => {
    try {
      // Try a simple command to check if backend is responsive
      await invoke("read_file_content", {
        path: "non-existent-file-for-health-check.txt",
      });

      // If we get here without an error (even if file doesn't exist), backend is working
      setStatus({
        isConnected: true,
        lastChecked: new Date(),
        error: null,
      });
    } catch (error) {
      // Check if it's a file not found error (expected) vs backend error
      const errorStr = String(error);
      const isFileNotFoundError =
        errorStr.includes("Failed to read file") ||
        errorStr.includes("No such file");

      if (isFileNotFoundError) {
        // File not found is expected - backend is working
        setStatus({
          isConnected: true,
          lastChecked: new Date(),
          error: null,
        });
      } else {
        // Real backend error
        setStatus({
          isConnected: false,
          lastChecked: new Date(),
          error: errorStr,
        });
      }
    }
  };

  useEffect(() => {
    // Check status immediately
    checkBackendStatus();

    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    ...status,
    checkStatus: checkBackendStatus,
  };
}
