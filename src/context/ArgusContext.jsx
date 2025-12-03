import { createContext, useState, useEffect, useCallback } from 'react';

const ArgusContext = createContext(null);

const STORAGE_KEYS = {
  BOOKMARKS: 'argus_bookmarks',
  ALIASES: 'argus_aliases',
  FEEDS: 'argus_feeds',
  SCRIPTS: 'argus_scripts',
  NOTES: 'argus_notes',
  HISTORY: 'argus_history',
  SETTINGS: 'argus_settings',
  USAGE_STATS: 'argus_usage_stats',
  TODOS: 'argus_todos',
  RECENT_NAVIGATIONS: 'argus_recent',
  ACTIVE_WORKSPACE: 'argus_workspace',
  WORKSPACES: 'argus_workspaces',
  TIMER: 'argus_timer',
};

// Default bookmarks for InfoSec productivity
const DEFAULT_BOOKMARKS = [
  { id: 'github', name: 'GitHub', url: 'https://github.com', tags: ['dev', 'code'], icon: '📦' },
  { id: 'hackerone', name: 'HackerOne', url: 'https://hackerone.com', tags: ['bugbounty', 'sec'], icon: '🎯' },
  { id: 'shodan', name: 'Shodan', url: 'https://shodan.io', tags: ['recon', 'osint'], icon: '🔍' },
  { id: 'cve', name: 'CVE Database', url: 'https://cve.mitre.org', tags: ['vuln', 'research'], icon: '🛡️' },
  { id: 'virustotal', name: 'VirusTotal', url: 'https://virustotal.com', tags: ['malware', 'analysis'], icon: '🦠' },
];

// Default aliases for quick navigation
const DEFAULT_ALIASES = [
  { alias: 'gh', url: 'https://github.com', description: 'GitHub' },
  { alias: 'gg', url: 'https://google.com/search?q=', description: 'Google Search (append query)' },
  { alias: 'ddg', url: 'https://duckduckgo.com/?q=', description: 'DuckDuckGo (append query)' },
  { alias: 'yt', url: 'https://youtube.com/results?search_query=', description: 'YouTube Search' },
  { alias: 'so', url: 'https://stackoverflow.com/search?q=', description: 'StackOverflow' },
  { alias: 'mdn', url: 'https://developer.mozilla.org/search?q=', description: 'MDN Web Docs' },
  { alias: 'cve', url: 'https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=', description: 'CVE Search' },
  { alias: 'nvd', url: 'https://nvd.nist.gov/vuln/search/results?query=', description: 'NVD Search' },
  { alias: 'exp', url: 'https://exploit-db.com/search?q=', description: 'Exploit-DB Search' },
];

// Default RSS feeds for security news
const DEFAULT_FEEDS = [
  { id: 'krebs', name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', enabled: true },
  { id: 'schneier', name: 'Schneier on Security', url: 'https://schneier.com/feed/', enabled: true },
  { id: 'hn', name: 'Hacker News', url: 'https://news.ycombinator.com/rss', enabled: true },
  { id: 'reddit-netsec', name: 'r/netsec', url: 'https://reddit.com/r/netsec/.rss', enabled: true },
];

// Default quick scripts (bookmarklets/utilities)
const DEFAULT_SCRIPTS = [
  { 
    id: 'copy-url', 
    name: 'Copy URL', 
    description: 'Copy current page URL to clipboard',
    code: 'navigator.clipboard.writeText(window.location.href)',
    hotkey: 'ctrl+shift+c'
  },
  {
    id: 'view-source',
    name: 'View Source',
    description: 'Open page source in new tab',
    code: 'window.open("view-source:" + window.location.href)',
    hotkey: ''
  },
];

const DEFAULT_NOTES = `# Argus Notes

## Quick Reference
- \`go <alias> [query]\` - Quick navigate using alias
- \`bm\` - List bookmarks
- \`alias\` - List aliases  
- \`feeds\` - Show RSS feeds

## Ideas
- 

## Links to Check
- 
`;

const DEFAULT_SETTINGS = {
  theme: 'green', // green, amber, blue, red, purple
  showClock: true,
  militaryTime: true,
  showDate: true,
  terminalPrompt: '>',
  maxHistory: 100,
  defaultSearchEngine: 'google', // google, duckduckgo, bing
};

// Default workspaces
const DEFAULT_WORKSPACES = {
  work: {
    name: 'Work',
    bookmarkIds: ['github', 'hackerone'],
    aliasFilter: [],
  },
  research: {
    name: 'Research',
    bookmarkIds: ['shodan', 'cve', 'virustotal'],
    aliasFilter: [],
  },
  personal: {
    name: 'Personal',
    bookmarkIds: [],
    aliasFilter: [],
  },
};

export function ArgusProvider({ children }) {
  // Bookmarks state
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return stored ? JSON.parse(stored) : DEFAULT_BOOKMARKS;
    } catch {
      return DEFAULT_BOOKMARKS;
    }
  });

  // Aliases state
  const [aliases, setAliases] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ALIASES);
      return stored ? JSON.parse(stored) : DEFAULT_ALIASES;
    } catch {
      return DEFAULT_ALIASES;
    }
  });

  // Feeds state
  const [feeds, setFeeds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FEEDS);
      return stored ? JSON.parse(stored) : DEFAULT_FEEDS;
    } catch {
      return DEFAULT_FEEDS;
    }
  });

  // Scripts state
  const [scripts, setScripts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
      return stored ? JSON.parse(stored) : DEFAULT_SCRIPTS;
    } catch {
      return DEFAULT_SCRIPTS;
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

  // Settings state
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Usage stats for tracking bookmark frequency
  const [usageStats, setUsageStats] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USAGE_STATS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Todos state
  const [todos, setTodos] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TODOS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Recent navigations (last 100)
  const [recentNavigations, setRecentNavigations] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_NAVIGATIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Active workspace
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE);
      return stored || null;
    } catch {
      return null;
    }
  });

  // Workspaces configuration
  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
      return stored ? JSON.parse(stored) : DEFAULT_WORKSPACES;
    } catch {
      return DEFAULT_WORKSPACES;
    }
  });

  // Timer state
  const [timer, setTimer] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TIMER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Current viewport content
  const [viewport, setViewport] = useState({ type: 'welcome', data: null });

  // Persist all state to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks)); } catch (e) { console.error('Failed to save bookmarks:', e); }
  }, [bookmarks]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.ALIASES, JSON.stringify(aliases)); } catch (e) { console.error('Failed to save aliases:', e); }
  }, [aliases]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.FEEDS, JSON.stringify(feeds)); } catch (e) { console.error('Failed to save feeds:', e); }
  }, [feeds]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts)); } catch (e) { console.error('Failed to save scripts:', e); }
  }, [scripts]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.NOTES, notes); } catch (e) { console.error('Failed to save notes:', e); }
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(commandHistory.slice(-settings.maxHistory))); } catch (e) { console.error('Failed to save history:', e); }
  }, [commandHistory, settings.maxHistory]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch (e) { console.error('Failed to save settings:', e); }
  }, [settings]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(usageStats)); } catch (e) { console.error('Failed to save usage stats:', e); }
  }, [usageStats]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos)); } catch (e) { console.error('Failed to save todos:', e); }
  }, [todos]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.RECENT_NAVIGATIONS, JSON.stringify(recentNavigations.slice(-100))); } catch (e) { console.error('Failed to save recent navigations:', e); }
  }, [recentNavigations]);

  useEffect(() => {
    if (activeWorkspace) {
      try { localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE, activeWorkspace); } catch (e) { console.error('Failed to save active workspace:', e); }
    }
  }, [activeWorkspace]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces)); } catch (e) { console.error('Failed to save workspaces:', e); }
  }, [workspaces]);

  useEffect(() => {
    if (timer) {
      try { localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(timer)); } catch (e) { console.error('Failed to save timer:', e); }
    } else {
      try { localStorage.removeItem(STORAGE_KEYS.TIMER); } catch (e) { console.error('Failed to remove timer:', e); }
    }
  }, [timer]);

  // Bookmark operations
  const addBookmark = useCallback((bookmark) => {
    const newBookmark = {
      ...bookmark,
      id: bookmark.id || bookmark.name.toLowerCase().replace(/\s+/g, '-'),
      tags: bookmark.tags || [],
      icon: bookmark.icon || '🔗',
      createdAt: Date.now(),
    };
    setBookmarks((prev) => [...prev, newBookmark]);
    return newBookmark;
  }, []);

  const updateBookmark = useCallback((id, updates) => {
    setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const deleteBookmark = useCallback((id) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const getBookmarksByTag = useCallback((tag) => {
    return bookmarks.filter((b) => b.tags.includes(tag));
  }, [bookmarks]);

  // Alias operations
  const addAlias = useCallback((alias) => {
    setAliases((prev) => [...prev.filter((a) => a.alias !== alias.alias), alias]);
  }, []);

  const deleteAlias = useCallback((aliasName) => {
    setAliases((prev) => prev.filter((a) => a.alias !== aliasName));
  }, []);

  const resolveAlias = useCallback((aliasName, query = '') => {
    const found = aliases.find((a) => a.alias === aliasName);
    if (found) {
      return found.url + encodeURIComponent(query);
    }
    return null;
  }, [aliases]);

  // Feed operations
  const addFeed = useCallback((feed) => {
    const newFeed = {
      ...feed,
      id: feed.id || feed.name.toLowerCase().replace(/\s+/g, '-'),
      enabled: true,
    };
    setFeeds((prev) => [...prev, newFeed]);
    return newFeed;
  }, []);

  const updateFeed = useCallback((id, updates) => {
    setFeeds((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const deleteFeed = useCallback((id) => {
    setFeeds((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Script operations
  const addScript = useCallback((script) => {
    const newScript = {
      ...script,
      id: script.id || script.name.toLowerCase().replace(/\s+/g, '-'),
    };
    setScripts((prev) => [...prev, newScript]);
    return newScript;
  }, []);

  const deleteScript = useCallback((id) => {
    setScripts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Command history operations
  const addToHistory = useCallback((entry) => {
    setCommandHistory((prev) => [...prev, { ...entry, timestamp: Date.now() }]);
  }, []);

  const clearHistory = useCallback(() => {
    setCommandHistory([]);
  }, []);

  // Viewport operations
  const showBookmarks = useCallback((tag = null) => {
    setViewport({ type: 'bookmarks', data: { tag } });
  }, []);

  const showFeeds = useCallback(() => {
    setViewport({ type: 'feeds', data: null });
  }, []);

  const showWelcome = useCallback(() => {
    setViewport({ type: 'welcome', data: null });
  }, []);

  const openInViewport = useCallback((url, title) => {
    setViewport({ type: 'iframe', data: { url, title } });
  }, []);

  // Settings operations
  const updateSettings = useCallback((updates) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Export/Import configuration
  const exportConfig = useCallback(() => {
    return {
      bookmarks,
      aliases,
      feeds,
      scripts,
      notes,
      settings,
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };
  }, [bookmarks, aliases, feeds, scripts, notes, settings]);

  const importConfig = useCallback((config) => {
    if (config.bookmarks) setBookmarks(config.bookmarks);
    if (config.aliases) setAliases(config.aliases);
    if (config.feeds) setFeeds(config.feeds);
    if (config.scripts) setScripts(config.scripts);
    if (config.notes) setNotes(config.notes);
    if (config.settings) setSettings((prev) => ({ ...prev, ...config.settings }));
    if (config.todos) setTodos(config.todos);
    if (config.workspaces) setWorkspaces(config.workspaces);
  }, []);

  // Usage tracking operations
  const recordUsage = useCallback((bookmarkId) => {
    setUsageStats((prev) => ({
      ...prev,
      [bookmarkId]: (prev[bookmarkId] || 0) + 1,
    }));
  }, []);

  const getMostUsedBookmarks = useCallback((limit = 9) => {
    return [...bookmarks]
      .sort((a, b) => (usageStats[b.id] || 0) - (usageStats[a.id] || 0))
      .slice(0, limit);
  }, [bookmarks, usageStats]);

  // Todo operations
  const addTodo = useCallback((text) => {
    const newTodo = {
      id: Date.now().toString(),
      text,
      done: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [...prev, newTodo]);
    return newTodo;
  }, []);

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getActiveTodoCount = useCallback(() => {
    return todos.filter((t) => !t.done).length;
  }, [todos]);

  // Recent navigation operations
  const recordNavigation = useCallback((url, title, source) => {
    const entry = {
      url,
      title,
      source,
      timestamp: Date.now(),
    };
    setRecentNavigations((prev) => [entry, ...prev.slice(0, 99)]);
  }, []);

  const getRecentNavigations = useCallback((limit = 10) => {
    return recentNavigations.slice(0, limit);
  }, [recentNavigations]);

  // Workspace operations
  const switchWorkspace = useCallback((workspaceName) => {
    if (workspaces[workspaceName]) {
      setActiveWorkspace(workspaceName);
      return true;
    }
    return false;
  }, [workspaces]);

  const getWorkspaceBookmarks = useCallback(() => {
    if (!activeWorkspace || !workspaces[activeWorkspace]) {
      return bookmarks;
    }
    const ws = workspaces[activeWorkspace];
    if (!ws.bookmarkIds || ws.bookmarkIds.length === 0) {
      return bookmarks;
    }
    return bookmarks.filter((b) => ws.bookmarkIds.includes(b.id));
  }, [activeWorkspace, workspaces, bookmarks]);

  // Timer operations
  const startTimer = useCallback((durationMinutes, type = 'timer') => {
    const endTime = Date.now() + durationMinutes * 60 * 1000;
    setTimer({
      type,
      endTime,
      duration: durationMinutes,
      startedAt: Date.now(),
    });
  }, []);

  const stopTimer = useCallback(() => {
    setTimer(null);
  }, []);

  const getTimerRemaining = useCallback(() => {
    if (!timer) return null;
    const remaining = timer.endTime - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [timer]);

  const value = {
    // Bookmarks
    bookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    getBookmarksByTag,

    // Aliases
    aliases,
    addAlias,
    deleteAlias,
    resolveAlias,

    // Feeds
    feeds,
    addFeed,
    updateFeed,
    deleteFeed,

    // Scripts
    scripts,
    addScript,
    deleteScript,

    // Notes
    notes,
    setNotes,

    // Command history
    commandHistory,
    addToHistory,
    clearHistory,

    // Viewport
    viewport,
    showBookmarks,
    showFeeds,
    showWelcome,
    openInViewport,

    // Settings
    settings,
    updateSettings,

    // Config
    exportConfig,
    importConfig,

    // Usage tracking
    usageStats,
    recordUsage,
    getMostUsedBookmarks,

    // Todos
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    getActiveTodoCount,

    // Recent navigations
    recentNavigations,
    recordNavigation,
    getRecentNavigations,

    // Workspaces
    activeWorkspace,
    workspaces,
    switchWorkspace,
    getWorkspaceBookmarks,

    // Timer
    timer,
    startTimer,
    stopTimer,
    getTimerRemaining,
  };

  return (
    <ArgusContext.Provider value={value}>{children}</ArgusContext.Provider>
  );
}

export default ArgusContext;
