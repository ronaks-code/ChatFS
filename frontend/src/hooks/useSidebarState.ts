import { useState, useEffect } from "react";

interface SidebarState {
  isExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
}

export function useSidebarState(): SidebarState {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem("chatfs-sidebar-expanded");
    if (savedState !== null) {
      setIsExpanded(JSON.parse(savedState));
    } else {
      // Default to expanded on first visit
      setIsExpanded(true);
    }
  }, []);

  useEffect(() => {
    // Save sidebar state to localStorage
    localStorage.setItem("chatfs-sidebar-expanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  const setSidebarExpanded = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return {
    isExpanded,
    toggleSidebar,
    setSidebarExpanded,
  };
}
