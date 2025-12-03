import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArgus } from '../context/useArgus';
import { BANG_ENGINES, parseBang, isUrl, getIpLookupUrls, getDomainLookupUrls, getCveLookupUrls, getHashLookupUrls } from '../utils/lookups';
import { base64Encode, base64Decode, urlEncode, urlDecode } from '../utils/encoders';
import { getHttpCode, getHttpCategory } from '../data/httpCodes';
import { THEMES } from '../utils/themes';

function Terminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([
    { type: 'system', text: 'ARGUS TERMINAL v3.0.0' },
    { type: 'system', text: 'Your InfoSec browser command center.' },
    { type: 'system', text: 'Type "help" for available commands.' },
    { type: 'system', text: '' },
  ]);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const navigate = useNavigate();
  const { 
    bookmarks, 
    aliases, 
    feeds,
    scripts,
    addBookmark,
    deleteBookmark,
    addAlias,
    deleteAlias,
    resolveAlias,
    addToHistory, 
    clearHistory, 
    commandHistory,
    showBookmarks,
    showFeeds,
    showWelcome,
    settings,
    updateSettings,
    // New features
    recordUsage,
    recordNavigation,
    getRecentNavigations,
    getMostUsedBookmarks,
    // Todos
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    // Workspaces
    activeWorkspace,
    switchWorkspace,
    // Timer
    timer,
    startTimer,
    stopTimer,
    // Notes
    notes,
    setNotes,
  } = useArgus();
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastCommand, setLastCommand] = useState('');

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const addOutput = (lines) => {
    setOutput((prev) => [...prev, ...lines]);
  };

  const processCommand = (cmd) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Handle !! to repeat last command
    if (trimmedCmd === '!!') {
      if (lastCommand) {
        processCommand(lastCommand);
      } else {
        addOutput([
          { type: 'error', text: 'No previous command to repeat.' },
          { type: 'system', text: '' },
        ]);
      }
      return;
    }

    // Handle !<prefix> to repeat last command starting with prefix
    if (trimmedCmd.startsWith('!') && trimmedCmd.length > 1 && !trimmedCmd.startsWith('!g') && !trimmedCmd.startsWith('!gh')) {
      const prefix = trimmedCmd.slice(1);
      const bangResult = parseBang(trimmedCmd);
      // Only treat as history if it's not a bang search
      if (!bangResult) {
        const match = [...commandHistory].reverse().find(h => h.command.startsWith(prefix));
        if (match) {
          processCommand(match.command);
          return;
        }
      }
    }

    // Handle bang syntax (!g, !gh, etc.)
    const bangResult = parseBang(trimmedCmd);
    if (bangResult) {
      const { engine, query } = bangResult;
      const url = engine.url + encodeURIComponent(query);
      addOutput([
        { type: 'command', text: `${settings.terminalPrompt} ${trimmedCmd}` },
        { type: 'success', text: `Searching ${engine.name}: "${query}"...` },
        { type: 'system', text: '' },
      ]);
      addToHistory({ command: trimmedCmd });
      setLastCommand(trimmedCmd);
      recordNavigation(url, `${engine.name} Search`, 'bang');
      window.open(url, '_blank');
      return;
    }

    // Handle URL-like input (omnibox behavior)
    if (isUrl(trimmedCmd)) {
      let url = trimmedCmd;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      addOutput([
        { type: 'command', text: `${settings.terminalPrompt} ${trimmedCmd}` },
        { type: 'success', text: `Opening ${url}...` },
        { type: 'system', text: '' },
      ]);
      addToHistory({ command: trimmedCmd });
      setLastCommand(trimmedCmd);
      recordNavigation(url, url, 'direct');
      window.open(url, '_blank');
      return;
    }

    // Add command to output
    addOutput([{ type: 'command', text: `${settings.terminalPrompt} ${trimmedCmd}` }]);
    addToHistory({ command: trimmedCmd });
    setLastCommand(trimmedCmd);

    const parts = trimmedCmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));

    switch (command) {
      case 'help':
      case '?':
        addOutput([
          { type: 'info', text: '┌───────────────────────────────────────────────┐' },
          { type: 'info', text: '│            ARGUS COMMAND REFERENCE            │' },
          { type: 'info', text: '├───────────────────────────────────────────────┤' },
          { type: 'info', text: '│  NAVIGATION                                   │' },
          { type: 'info', text: '│    go <alias> [query]    Quick navigate       │' },
          { type: 'info', text: '│    open <url>            Open URL             │' },
          { type: 'info', text: '│    s <query>             Smart search         │' },
          { type: 'info', text: '│    !g <query>            Google search        │' },
          { type: 'info', text: '│    !gh <query>           GitHub search        │' },
          { type: 'info', text: '│                                               │' },
          { type: 'info', text: '│  BOOKMARKS                                    │' },
          { type: 'info', text: '│    bm                    List bookmarks       │' },
          { type: 'info', text: '│    bm add <name> <url>   Add bookmark         │' },
          { type: 'info', text: '│    bm rm <id>            Remove bookmark      │' },
          { type: 'info', text: '│    bm tag <tag>          Filter by tag        │' },
          { type: 'info', text: '│                                               │' },
          { type: 'info', text: '│  INFOSEC LOOKUPS                              │' },
          { type: 'info', text: '│    ip <address>          IP lookup            │' },
          { type: 'info', text: '│    domain <domain>       Domain lookup        │' },
          { type: 'info', text: '│    cve <id>              CVE lookup           │' },
          { type: 'info', text: '│    hash <hash>           Hash lookup          │' },
          { type: 'info', text: '│    http <code>           HTTP status info     │' },
          { type: 'info', text: '│    encode <text>         Base64/URL encode    │' },
          { type: 'info', text: '│    decode <text>         Base64/URL decode    │' },
          { type: 'info', text: '│                                               │' },
          { type: 'info', text: '│  PRODUCTIVITY                                 │' },
          { type: 'info', text: '│    todo add <task>       Add todo item        │' },
          { type: 'info', text: '│    todo list             List todos           │' },
          { type: 'info', text: '│    todo done <id>        Complete todo        │' },
          { type: 'info', text: '│    note add <text>       Append to notes      │' },
          { type: 'info', text: '│    timer <minutes>       Start timer          │' },
          { type: 'info', text: '│    recent                Recent navigations   │' },
          { type: 'info', text: '│    freq                  Most used bookmarks  │' },
          { type: 'info', text: '│                                               │' },
          { type: 'info', text: '│  THEMES & CONFIG                              │' },
          { type: 'info', text: '│    theme <name>          Switch theme         │' },
          { type: 'info', text: '│    workspace <name>      Switch workspace     │' },
          { type: 'info', text: '│    config                Open settings        │' },
          { type: 'info', text: '│                                               │' },
          { type: 'info', text: '│  UTILITIES                                    │' },
          { type: 'info', text: '│    clear                 Clear terminal       │' },
          { type: 'info', text: '│    history               Command history      │' },
          { type: 'info', text: '│    !!                    Repeat last command  │' },
          { type: 'info', text: '│    home                  Reset viewport       │' },
          { type: 'info', text: '└───────────────────────────────────────────────┘' },
          { type: 'system', text: '' },
        ]);
        break;

      // Smart search command
      case 's':
      case 'search': {
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: s <query>' },
            { type: 'info', text: 'Searches bookmarks, aliases, then web.' },
            { type: 'system', text: '' },
          ]);
        } else {
          const query = args.join(' ').toLowerCase();
          // Search bookmarks first
          const bmMatch = bookmarks.find(b => 
            b.name.toLowerCase().includes(query) || 
            b.id.toLowerCase().includes(query) ||
            b.tags.some(t => t.toLowerCase().includes(query))
          );
          if (bmMatch) {
            addOutput([
              { type: 'success', text: `Found bookmark: ${bmMatch.name}` },
              { type: 'success', text: `Opening ${bmMatch.url}...` },
              { type: 'system', text: '' },
            ]);
            recordUsage(bmMatch.id);
            recordNavigation(bmMatch.url, bmMatch.name, 'search');
            window.open(bmMatch.url, '_blank');
          } else {
            // Search aliases
            const aliasMatch = aliases.find(a => 
              a.alias.toLowerCase().includes(query) ||
              a.description.toLowerCase().includes(query)
            );
            if (aliasMatch) {
              const url = aliasMatch.url;
              addOutput([
                { type: 'success', text: `Found alias: ${aliasMatch.alias}` },
                { type: 'success', text: `Opening ${url}...` },
                { type: 'system', text: '' },
              ]);
              recordNavigation(url, aliasMatch.description, 'search');
              window.open(url, '_blank');
            } else {
              // Fall back to default search engine
              const searchUrl = settings.defaultSearchEngine === 'duckduckgo' 
                ? `https://duckduckgo.com/?q=${encodeURIComponent(args.join(' '))}`
                : `https://www.google.com/search?q=${encodeURIComponent(args.join(' '))}`;
              addOutput([
                { type: 'success', text: `Searching web for: "${args.join(' ')}"...` },
                { type: 'system', text: '' },
              ]);
              recordNavigation(searchUrl, `Search: ${args.join(' ')}`, 'search');
              window.open(searchUrl, '_blank');
            }
          }
        }
        break;
      }

      case 'go':
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: go <alias> [query]' },
            { type: 'info', text: 'Example: go gg how to hack' },
            { type: 'info', text: 'Type "alias" to see available aliases.' },
            { type: 'system', text: '' },
          ]);
        } else {
          const aliasName = args[0];
          const query = args.slice(1).join(' ');
          const url = resolveAlias(aliasName, query);
          if (url) {
            addOutput([
              { type: 'success', text: `Navigating to ${aliasName}${query ? ` with query: "${query}"` : ''}...` },
              { type: 'system', text: '' },
            ]);
            window.open(url, '_blank');
          } else {
            addOutput([
              { type: 'error', text: `Alias "${aliasName}" not found.` },
              { type: 'info', text: 'Type "alias" to see available aliases.' },
              { type: 'system', text: '' },
            ]);
          }
        }
        break;

      case 'open':
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: open <url>' },
            { type: 'info', text: 'Example: open https://github.com' },
            { type: 'system', text: '' },
          ]);
        } else {
          let url = args[0];
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          addOutput([
            { type: 'success', text: `Opening ${url}...` },
            { type: 'system', text: '' },
          ]);
          window.open(url, '_blank');
        }
        break;

      case 'bm':
      case 'bookmarks':
        if (args.length === 0) {
          // List all bookmarks
          if (bookmarks.length === 0) {
            addOutput([
              { type: 'info', text: 'No bookmarks configured.' },
              { type: 'info', text: 'Use "bm add <name> <url>" to add one.' },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'info', text: '╔═══════════════════════════════════════════╗' },
              { type: 'info', text: '║              BOOKMARKS                    ║' },
              { type: 'info', text: '╠═══════════════════════════════════════════╣' },
              ...bookmarks.map((b) => ({
                type: 'info',
                text: `║ ${b.icon} [${b.id}] ${b.name.padEnd(20)} ${b.tags.length > 0 ? `#${b.tags.join(' #')}` : ''}`,
              })),
              { type: 'info', text: '╚═══════════════════════════════════════════╝' },
              { type: 'system', text: '' },
              { type: 'info', text: 'Use "open <id>" to launch, "bm tag <tag>" to filter' },
              { type: 'system', text: '' },
            ]);
            showBookmarks();
          }
        } else if (args[0] === 'add' && args.length >= 3) {
          const name = args[1];
          const url = args[2];
          const tags = args.slice(3);
          const newBm = addBookmark({ name, url, tags });
          addOutput([
            { type: 'success', text: `Bookmark "${name}" added with ID: ${newBm.id}` },
            { type: 'system', text: '' },
          ]);
        } else if (args[0] === 'rm' && args.length >= 2) {
          const id = args[1];
          const found = bookmarks.find((b) => b.id === id);
          if (found) {
            deleteBookmark(id);
            addOutput([
              { type: 'success', text: `Bookmark "${found.name}" removed.` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'error', text: `Bookmark "${id}" not found.` },
              { type: 'system', text: '' },
            ]);
          }
        } else if (args[0] === 'tag' && args.length >= 2) {
          const tag = args[1];
          const filtered = bookmarks.filter((b) => b.tags.includes(tag));
          if (filtered.length === 0) {
            addOutput([
              { type: 'info', text: `No bookmarks with tag "${tag}".` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'info', text: `Bookmarks tagged #${tag}:` },
              ...filtered.map((b) => ({
                type: 'info',
                text: `  ${b.icon} [${b.id}] ${b.name}`,
              })),
              { type: 'system', text: '' },
            ]);
            showBookmarks(tag);
          }
        } else {
          addOutput([
            { type: 'error', text: 'Usage: bm [add <name> <url> [tags...]] | [rm <id>] | [tag <tag>]' },
            { type: 'system', text: '' },
          ]);
        }
        break;

      case 'alias':
      case 'aliases':
        if (args.length === 0) {
          if (aliases.length === 0) {
            addOutput([
              { type: 'info', text: 'No aliases configured.' },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'info', text: '╔═══════════════════════════════════════════╗' },
              { type: 'info', text: '║              QUICK ALIASES                ║' },
              { type: 'info', text: '╠═══════════════════════════════════════════╣' },
              ...aliases.map((a) => ({
                type: 'info',
                text: `║  ${a.alias.padEnd(6)} → ${a.description}`,
              })),
              { type: 'info', text: '╚═══════════════════════════════════════════╝' },
              { type: 'system', text: '' },
              { type: 'info', text: 'Use "go <alias> [query]" to navigate' },
              { type: 'system', text: '' },
            ]);
          }
        } else if (args[0] === 'add' && args.length >= 3) {
          const aliasName = args[1];
          const url = args[2];
          const description = args.slice(3).join(' ') || aliasName;
          addAlias({ alias: aliasName, url, description });
          addOutput([
            { type: 'success', text: `Alias "${aliasName}" → ${url} added.` },
            { type: 'system', text: '' },
          ]);
        } else if (args[0] === 'rm' && args.length >= 2) {
          const aliasName = args[1];
          const found = aliases.find((a) => a.alias === aliasName);
          if (found) {
            deleteAlias(aliasName);
            addOutput([
              { type: 'success', text: `Alias "${aliasName}" removed.` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'error', text: `Alias "${aliasName}" not found.` },
              { type: 'system', text: '' },
            ]);
          }
        } else {
          addOutput([
            { type: 'error', text: 'Usage: alias [add <alias> <url> [description]] | [rm <alias>]' },
            { type: 'system', text: '' },
          ]);
        }
        break;

      case 'feeds':
      case 'rss':
        if (feeds.length === 0) {
          addOutput([
            { type: 'info', text: 'No RSS feeds configured.' },
            { type: 'system', text: '' },
          ]);
        } else {
          addOutput([
            { type: 'info', text: '╔═══════════════════════════════════════════╗' },
            { type: 'info', text: '║              RSS FEEDS                    ║' },
            { type: 'info', text: '╠═══════════════════════════════════════════╣' },
            ...feeds.map((f) => ({
              type: 'info',
              text: `║  ${f.enabled ? '●' : '○'} ${f.name.padEnd(25)}`,
            })),
            { type: 'info', text: '╚═══════════════════════════════════════════╝' },
            { type: 'system', text: '' },
            { type: 'info', text: 'Note: RSS parsing requires a backend/proxy.' },
            { type: 'info', text: 'Feeds shown in viewport for reference.' },
            { type: 'system', text: '' },
          ]);
          showFeeds();
        }
        break;

      case 'scripts':
        if (scripts.length === 0) {
          addOutput([
            { type: 'info', text: 'No scripts configured.' },
            { type: 'system', text: '' },
          ]);
        } else {
          addOutput([
            { type: 'info', text: 'Quick Scripts:' },
            ...scripts.map((s) => ({
              type: 'info',
              text: `  [${s.id}] ${s.name} - ${s.description}${s.hotkey ? ` (${s.hotkey})` : ''}`,
            })),
            { type: 'system', text: '' },
          ]);
        }
        break;

      case 'note':
      case 'notes':
        if (args.length > 0 && args[0] === 'add') {
          const text = args.slice(1).join(' ');
          if (text) {
            setNotes(notes + '\n' + text);
            addOutput([
              { type: 'success', text: `Added to notes: "${text}"` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'error', text: 'Usage: note add <text>' },
              { type: 'system', text: '' },
            ]);
          }
        } else {
          addOutput([
            { type: 'success', text: 'Opening notes editor...' },
            { type: 'system', text: '' },
          ]);
          navigate('/notes');
        }
        break;

      case 'config':
      case 'settings':
        addOutput([
          { type: 'success', text: 'Opening configuration...' },
          { type: 'system', text: '' },
        ]);
        navigate('/config');
        break;

      case 'clear':
      case 'cls':
        setOutput([
          { type: 'system', text: 'ARGUS TERMINAL v3.0.0' },
          { type: 'system', text: '' },
        ]);
        break;

      case 'home':
        showWelcome();
        addOutput([
          { type: 'success', text: 'Viewport reset.' },
          { type: 'system', text: '' },
        ]);
        break;

      case 'time':
      case 'date': {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = settings.militaryTime 
          ? now.toLocaleTimeString('en-US', { hour12: false })
          : now.toLocaleTimeString('en-US', { hour12: true });
        addOutput([
          { type: 'info', text: `📅 ${dateStr}` },
          { type: 'info', text: `🕐 ${timeStr}` },
          { type: 'system', text: '' },
        ]);
        break;
      }

      case 'history':
        if (commandHistory.length === 0) {
          addOutput([
            { type: 'info', text: 'No command history.' },
            { type: 'system', text: '' },
          ]);
        } else {
          addOutput([
            { type: 'info', text: 'Recent commands:' },
            ...commandHistory.slice(-15).map((h, i) => ({
              type: 'info',
              text: `  ${(i + 1).toString().padStart(2, ' ')}. ${h.command}`,
            })),
            { type: 'system', text: '' },
          ]);
        }
        break;

      case 'clearhistory':
        clearHistory();
        addOutput([
          { type: 'success', text: 'Command history cleared.' },
          { type: 'system', text: '' },
        ]);
        break;

      case 'whoami':
        addOutput([
          { type: 'info', text: '👤 InfoSec Professional' },
          { type: 'info', text: '🖥️  Argus Browser Command Center' },
          { type: 'info', text: '🔒 Staying secure, staying productive.' },
          { type: 'system', text: '' },
        ]);
        break;

      case 'version':
        addOutput([
          { type: 'info', text: 'Argus Terminal v3.0.0' },
          { type: 'info', text: 'Built with React + Vite + TailwindCSS' },
          { type: 'info', text: 'https://github.com/this-bytes/argus' },
          { type: 'system', text: '' },
        ]);
        break;

      // InfoSec Lookup Commands
      case 'ip': {
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: ip <address>' },
            { type: 'info', text: 'Opens IP in Shodan, VirusTotal, AbuseIPDB' },
            { type: 'system', text: '' },
          ]);
        } else {
          const ip = args[0];
          const lookups = getIpLookupUrls(ip);
          addOutput([
            { type: 'success', text: `Opening IP lookups for ${ip}...` },
            ...lookups.map(l => ({ type: 'info', text: `  → ${l.name}` })),
            { type: 'system', text: '' },
          ]);
          lookups.forEach(l => window.open(l.url, '_blank'));
        }
        break;
      }

      case 'domain': {
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: domain <domain>' },
            { type: 'info', text: 'Opens domain in SecurityTrails, crt.sh, VirusTotal' },
            { type: 'system', text: '' },
          ]);
        } else {
          const domain = args[0];
          const lookups = getDomainLookupUrls(domain);
          addOutput([
            { type: 'success', text: `Opening domain lookups for ${domain}...` },
            ...lookups.map(l => ({ type: 'info', text: `  → ${l.name}` })),
            { type: 'system', text: '' },
          ]);
          lookups.forEach(l => window.open(l.url, '_blank'));
        }
        break;
      }

      case 'cve': {
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: cve <id>' },
            { type: 'info', text: 'Example: cve CVE-2021-44228' },
            { type: 'system', text: '' },
          ]);
        } else {
          const cveId = args[0];
          const lookups = getCveLookupUrls(cveId);
          addOutput([
            { type: 'success', text: `Opening CVE lookups for ${cveId.toUpperCase()}...` },
            ...lookups.map(l => ({ type: 'info', text: `  → ${l.name}` })),
            { type: 'system', text: '' },
          ]);
          lookups.forEach(l => window.open(l.url, '_blank'));
        }
        break;
      }

      case 'hash': {
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: hash <hash>' },
            { type: 'info', text: 'Opens hash in VirusTotal, Hybrid Analysis' },
            { type: 'system', text: '' },
          ]);
        } else {
          const hash = args[0];
          const lookups = getHashLookupUrls(hash);
          addOutput([
            { type: 'success', text: `Opening hash lookups for ${hash}...` },
            ...lookups.map(l => ({ type: 'info', text: `  → ${l.name}` })),
            { type: 'system', text: '' },
          ]);
          lookups.forEach(l => window.open(l.url, '_blank'));
        }
        break;
      }

      case 'http': {
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: http <code>' },
            { type: 'info', text: 'Example: http 404' },
            { type: 'system', text: '' },
          ]);
        } else {
          const code = args[0];
          const info = getHttpCode(code);
          if (info) {
            const category = getHttpCategory(code);
            addOutput([
              { type: 'info', text: `HTTP ${code} - ${info.status}` },
              { type: 'info', text: `Category: ${category}` },
              { type: 'info', text: `${info.description}` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'error', text: `Unknown HTTP status code: ${code}` },
              { type: 'system', text: '' },
            ]);
          }
        }
        break;
      }

      case 'encode': {
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: encode <text>' },
            { type: 'info', text: 'Encodes text to Base64 and URL encoding' },
            { type: 'system', text: '' },
          ]);
        } else {
          const text = args.join(' ');
          const b64 = base64Encode(text);
          const url = urlEncode(text);
          addOutput([
            { type: 'info', text: `Original: ${text}` },
            { type: 'success', text: `Base64:   ${b64}` },
            { type: 'success', text: `URL:      ${url}` },
            { type: 'system', text: '' },
          ]);
        }
        break;
      }

      case 'decode': {
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: decode <text>' },
            { type: 'info', text: 'Attempts to decode Base64 and URL encoding' },
            { type: 'system', text: '' },
          ]);
        } else {
          const text = args.join(' ');
          const b64Result = base64Decode(text);
          const urlResult = urlDecode(text);
          addOutput([
            { type: 'info', text: `Input:    ${text}` },
            { type: 'success', text: `Base64:   ${b64Result || '(invalid base64)'}` },
            { type: 'success', text: `URL:      ${urlResult || '(invalid URL encoding)'}` },
            { type: 'system', text: '' },
          ]);
        }
        break;
      }

      // Todo commands
      case 'todo': {
        if (args.length === 0 || args[0] === 'list') {
          if (todos.length === 0) {
            addOutput([
              { type: 'info', text: 'No todos. Use "todo add <task>" to create one.' },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'info', text: '╔═══════════════════════════════════════════╗' },
              { type: 'info', text: '║                  TODOS                    ║' },
              { type: 'info', text: '╠═══════════════════════════════════════════╣' },
              ...todos.map((t, i) => ({
                type: 'info',
                text: `║  ${t.done ? '✓' : '○'} [${i + 1}] ${t.text.slice(0, 30)}${t.text.length > 30 ? '...' : ''}`,
              })),
              { type: 'info', text: '╚═══════════════════════════════════════════╝' },
              { type: 'system', text: '' },
            ]);
          }
        } else if (args[0] === 'add' && args.length > 1) {
          const task = args.slice(1).join(' ');
          addTodo(task);
          addOutput([
            { type: 'success', text: `Todo added: "${task}"` },
            { type: 'system', text: '' },
          ]);
        } else if (args[0] === 'done' && args.length > 1) {
          const index = parseInt(args[1], 10) - 1;
          if (index >= 0 && index < todos.length) {
            toggleTodo(todos[index].id);
            addOutput([
              { type: 'success', text: `Todo ${index + 1} marked as ${todos[index].done ? 'pending' : 'complete'}.` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'error', text: `Invalid todo number: ${args[1]}` },
              { type: 'system', text: '' },
            ]);
          }
        } else if (args[0] === 'rm' && args.length > 1) {
          const index = parseInt(args[1], 10) - 1;
          if (index >= 0 && index < todos.length) {
            deleteTodo(todos[index].id);
            addOutput([
              { type: 'success', text: `Todo ${index + 1} removed.` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'error', text: `Invalid todo number: ${args[1]}` },
              { type: 'system', text: '' },
            ]);
          }
        } else {
          addOutput([
            { type: 'error', text: 'Usage: todo [add <task>|done <num>|rm <num>|list]' },
            { type: 'system', text: '' },
          ]);
        }
        break;
      }

      // Timer command
      case 'timer': {
        if (args.length === 0) {
          if (timer) {
            // Use getTimerRemaining from context to get remaining time
            const remaining = timer.endTime > 0 ? Math.max(0, timer.endTime - new Date().getTime()) : 0;
            if (remaining > 0) {
              const mins = Math.floor(remaining / 60000);
              const secs = Math.floor((remaining % 60000) / 1000);
              addOutput([
                { type: 'info', text: `Timer running: ${mins}m ${secs}s remaining` },
                { type: 'info', text: 'Use "timer stop" to cancel.' },
                { type: 'system', text: '' },
              ]);
            } else {
              addOutput([
                { type: 'success', text: '⏰ Timer complete!' },
                { type: 'system', text: '' },
              ]);
              stopTimer();
            }
          } else {
            addOutput([
              { type: 'info', text: 'No timer running.' },
              { type: 'info', text: 'Usage: timer <minutes> (e.g., timer 25)' },
              { type: 'system', text: '' },
            ]);
          }
        } else if (args[0] === 'stop') {
          stopTimer();
          addOutput([
            { type: 'success', text: 'Timer stopped.' },
            { type: 'system', text: '' },
          ]);
        } else {
          const minutes = parseInt(args[0].replace('m', ''), 10);
          if (isNaN(minutes) || minutes <= 0) {
            addOutput([
              { type: 'error', text: 'Invalid duration. Use: timer 25' },
              { type: 'system', text: '' },
            ]);
          } else {
            startTimer(minutes);
            addOutput([
              { type: 'success', text: `Timer started for ${minutes} minutes.` },
              { type: 'system', text: '' },
            ]);
          }
        }
        break;
      }

      // Recent navigations
      case 'recent': {
        const recents = getRecentNavigations(10);
        if (recents.length === 0) {
          addOutput([
            { type: 'info', text: 'No recent navigations.' },
            { type: 'system', text: '' },
          ]);
        } else {
          addOutput([
            { type: 'info', text: 'Recent navigations:' },
            ...recents.map((r, i) => ({
              type: 'info',
              text: `  ${i + 1}. ${r.title || r.url}`,
            })),
            { type: 'system', text: '' },
          ]);
        }
        break;
      }

      // Frequency/most used bookmarks
      case 'freq': {
        const topBookmarks = getMostUsedBookmarks(10);
        if (topBookmarks.length === 0) {
          addOutput([
            { type: 'info', text: 'No usage data yet.' },
            { type: 'system', text: '' },
          ]);
        } else {
          addOutput([
            { type: 'info', text: 'Most used bookmarks:' },
            ...topBookmarks.map((b, i) => ({
              type: 'info',
              text: `  ${i + 1}. ${b.icon} ${b.name}`,
            })),
            { type: 'system', text: '' },
          ]);
        }
        break;
      }

      // Theme command
      case 'theme': {
        if (args.length === 0) {
          const themeNames = Object.keys(THEMES);
          addOutput([
            { type: 'info', text: `Current theme: ${settings.theme}` },
            { type: 'info', text: `Available themes: ${themeNames.join(', ')}` },
            { type: 'system', text: '' },
          ]);
        } else {
          const themeName = args[0].toLowerCase();
          if (THEMES[themeName]) {
            updateSettings({ theme: themeName });
            addOutput([
              { type: 'success', text: `Theme changed to: ${THEMES[themeName].name}` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'error', text: `Unknown theme: ${themeName}` },
              { type: 'info', text: `Available: ${Object.keys(THEMES).join(', ')}` },
              { type: 'system', text: '' },
            ]);
          }
        }
        break;
      }

      // Workspace command
      case 'workspace': {
        if (args.length === 0) {
          addOutput([
            { type: 'info', text: `Active workspace: ${activeWorkspace || 'none'}` },
            { type: 'info', text: 'Available: work, research, personal' },
            { type: 'info', text: 'Use: workspace <name>' },
            { type: 'system', text: '' },
          ]);
        } else {
          const wsName = args[0].toLowerCase();
          if (switchWorkspace(wsName)) {
            addOutput([
              { type: 'success', text: `Switched to workspace: ${wsName}` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'error', text: `Unknown workspace: ${wsName}` },
              { type: 'info', text: 'Available: work, research, personal' },
              { type: 'system', text: '' },
            ]);
          }
        }
        break;
      }

      // Bang syntax help
      case 'bangs': {
        addOutput([
          { type: 'info', text: '╔═══════════════════════════════════════════╗' },
          { type: 'info', text: '║           BANG SYNTAX SHORTCUTS           ║' },
          { type: 'info', text: '╠═══════════════════════════════════════════╣' },
          ...Object.entries(BANG_ENGINES).map(([bang, engine]) => ({
            type: 'info',
            text: `║  ${bang.padEnd(8)} → ${engine.name}`,
          })),
          { type: 'info', text: '╚═══════════════════════════════════════════╝' },
          { type: 'system', text: '' },
          { type: 'info', text: 'Usage: !g how to code' },
          { type: 'system', text: '' },
        ]);
        break;
      }

      default: {
        // Check if it's a bookmark ID for quick open
        const matchedBookmark = bookmarks.find((b) => b.id === command);
        if (matchedBookmark) {
          addOutput([
            { type: 'success', text: `Opening ${matchedBookmark.name}...` },
            { type: 'system', text: '' },
          ]);
          window.open(matchedBookmark.url, '_blank');
        } else {
          addOutput([
            { type: 'error', text: `Unknown command: ${command}` },
            { type: 'info', text: 'Type "help" or "?" for available commands.' },
            { type: 'system', text: '' },
          ]);
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setInput('');
      setHistoryIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const filteredHistory = commandHistory.map((h) => h.command);
      if (filteredHistory.length > 0) {
        const newIndex = historyIndex < filteredHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(filteredHistory[filteredHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const filteredHistory = commandHistory.map((h) => h.command);
        setInput(filteredHistory[filteredHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion for commands
      const commands = [
        'help', 'go', 'open', 'bm', 'alias', 'feeds', 'scripts', 'note', 'config', 
        'clear', 'history', 'home', 'time', 'whoami', 'version', 's', 'search',
        'ip', 'domain', 'cve', 'hash', 'http', 'encode', 'decode',
        'todo', 'timer', 'recent', 'freq', 'theme', 'workspace', 'bangs'
      ];
      const aliasNames = aliases.map(a => a.alias);
      const bookmarkIds = bookmarks.map(b => b.id);
      const allCompletions = [...commands, ...aliasNames, ...bookmarkIds];
      
      const matches = allCompletions.filter(c => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        addOutput([
          { type: 'info', text: `Matches: ${matches.join(', ')}` },
        ]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setOutput([
        { type: 'system', text: 'ARGUS TERMINAL v3.0.0' },
        { type: 'system', text: '' },
      ]);
    } else if (e.key === 'Escape') {
      // Clear input and return to welcome
      setInput('');
      showWelcome();
    } else if (e.key === '/' && !input) {
      // Vim-style focus (already focused, so this just confirms)
      e.preventDefault();
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-red-400';
      case 'success':
        return 'text-green-400';
      case 'command':
        return 'text-yellow-400';
      case 'info':
        return 'text-green-300';
      case 'system':
      default:
        return 'text-green-500';
    }
  };

  return (
    <div
      className="h-full flex flex-col bg-black/90 border-2 border-green-500/60 rounded-lg overflow-hidden cursor-text shadow-lg shadow-green-500/20"
      onClick={handleTerminalClick}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-green-500/40 bg-gradient-to-r from-green-900/40 to-black/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
          <span className="ml-2 text-green-400 text-sm font-bold tracking-wider">ARGUS TERMINAL</span>
        </div>
        <Clock settings={settings} />
      </div>

      {/* Terminal output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed"
      >
        {output.map((line, index) => (
          <div key={index} className={`${getTextColor(line.type)} whitespace-pre-wrap`}>
            {line.text || '\u00A0'}
          </div>
        ))}
      </div>

      {/* Terminal input */}
      <div className="flex items-center px-4 py-3 border-t border-green-500/40 bg-gradient-to-r from-black/60 to-green-900/30">
        <span className="text-green-500 mr-2 font-bold">{settings.terminalPrompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="terminal-input flex-1 text-sm text-green-400 placeholder-green-700 bg-transparent border-none outline-none"
          style={{ color: '#4ade80', caretColor: '#4ade80' }}
          placeholder="Enter command..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          autoFocus
        />
        <span className="text-green-500 cursor-blink">█</span>
      </div>
    </div>
  );
}

// Clock component for terminal header
function Clock({ settings }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!settings.showClock) return null;

  const timeStr = settings.militaryTime
    ? time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    : time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });

  return (
    <span className="text-green-500/70 text-xs font-mono">
      {timeStr}
    </span>
  );
}

export default Terminal;
