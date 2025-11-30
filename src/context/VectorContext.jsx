import { createContext, useState, useEffect, useCallback } from 'react';

const VectorContext = createContext(null);

const STORAGE_KEYS = {
  RESOURCES: 'vector_res',
  NOTES: 'vector_notes',
  HISTORY: 'vector_hist',
};

const DEFAULT_RESOURCES = [
  { id: 'github', name: 'GitHub', url: 'https://github.com', iframe: false },
  { id: 'docs', name: 'Documentation', url: 'https://reactjs.org', iframe: false },
];

const DEFAULT_NOTES = '# Welcome to Vector Notes\n\nStart typing your notes here...';

export function VectorProvider({ children }) {
  // Resources state
  const [resources, setResources] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      return stored ? JSON.parse(stored) : DEFAULT_RESOURCES;
    } catch {
      return DEFAULT_RESOURCES;
    }
  });

  // Notes state
  const [notes, setNotes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTES);
      return stored || DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  });

  // Command history state
  const [commandHistory, setCommandHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Current viewport content
  const [viewport, setViewport] = useState({ type: 'card', resource: null });

  // Persist resources to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
    } catch (e) {
      console.error('Failed to save resources:', e);
    }
  }, [resources]);

  // Persist notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, notes);
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  }, [notes]);

  // Persist command history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(commandHistory));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, [commandHistory]);

  // Resource CRUD operations
  const addResource = useCallback((resource) => {
    const newResource = {
      ...resource,
      id: resource.id || crypto.randomUUID(),
    };
    setResources((prev) => [...prev, newResource]);
    return newResource;
  }, []);

  const updateResource = useCallback((id, updates) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  }, []);

  const deleteResource = useCallback((id) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    // Clear viewport if deleted resource was displayed
    setViewport((prev) => {
      if (prev.resource?.id === id) {
        return { type: 'card', resource: null };
      }
      return prev;
    });
  }, []);

  const getResourceById = useCallback(
    (id) => {
      return resources.find((r) => r.id === id);
    },
    [resources]
  );

  // Command history operations
  const addToHistory = useCallback((entry) => {
    setCommandHistory((prev) => [...prev, { ...entry, timestamp: Date.now() }]);
  }, []);

  const clearHistory = useCallback(() => {
    setCommandHistory([]);
  }, []);

  // Viewport operations
  const openResource = useCallback(
    (id) => {
      const resource = resources.find((r) => r.id === id);
      if (resource) {
        if (resource.iframe) {
          setViewport({ type: 'iframe', resource });
        } else {
          setViewport({ type: 'card', resource });
        }
        return true;
      }
      return false;
    },
    [resources]
  );

  const clearViewport = useCallback(() => {
    setViewport({ type: 'card', resource: null });
  }, []);

  const value = {
    // Resources
    resources,
    addResource,
    updateResource,
    deleteResource,
    getResourceById,

    // Notes
    notes,
    setNotes,

    // Command history
    commandHistory,
    addToHistory,
    clearHistory,

    // Viewport
    viewport,
    openResource,
    clearViewport,
  };

  return (
    <VectorContext.Provider value={value}>{children}</VectorContext.Provider>
  );
}

export default VectorContext;
