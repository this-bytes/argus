import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArgus } from '../context/useArgus';

function Terminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([
    { type: 'system', text: 'ARGUS TERMINAL v2.0.0' },
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
  } = useArgus();
  const [historyIndex, setHistoryIndex] = useState(-1);

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

    // Add command to output
    addOutput([{ type: 'command', text: `${settings.terminalPrompt} ${trimmedCmd}` }]);
    addToHistory({ command: trimmedCmd });

    const parts = trimmedCmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1).map(arg => arg.replace(/^"|"$/g, ''));

    switch (command) {
      case 'help':
      case '?':
        addOutput([
          { type: 'info', text: '┌─────────────────────────────────────────┐' },
          { type: 'info', text: '│          ARGUS COMMAND REFERENCE        │' },
          { type: 'info', text: '├─────────────────────────────────────────┤' },
          { type: 'info', text: '│  NAVIGATION                             │' },
          { type: 'info', text: '│    go <alias> [query]  Quick navigate   │' },
          { type: 'info', text: '│    open <url>          Open URL         │' },
          { type: 'info', text: '│                                         │' },
          { type: 'info', text: '│  BOOKMARKS                              │' },
          { type: 'info', text: '│    bm                  List bookmarks   │' },
          { type: 'info', text: '│    bm add <name> <url> Add bookmark     │' },
          { type: 'info', text: '│    bm rm <id>          Remove bookmark  │' },
          { type: 'info', text: '│    bm tag <tag>        Filter by tag    │' },
          { type: 'info', text: '│                                         │' },
          { type: 'info', text: '│  ALIASES                                │' },
          { type: 'info', text: '│    alias               List aliases     │' },
          { type: 'info', text: '│    alias add <a> <url> Add alias        │' },
          { type: 'info', text: '│    alias rm <alias>    Remove alias     │' },
          { type: 'info', text: '│                                         │' },
          { type: 'info', text: '│  FEEDS & CONTENT                        │' },
          { type: 'info', text: '│    feeds               Show RSS feeds   │' },
          { type: 'info', text: '│    scripts             List scripts     │' },
          { type: 'info', text: '│                                         │' },
          { type: 'info', text: '│  UTILITIES                              │' },
          { type: 'info', text: '│    note                Open notes       │' },
          { type: 'info', text: '│    config              Configuration    │' },
          { type: 'info', text: '│    clear               Clear terminal   │' },
          { type: 'info', text: '│    history             Command history  │' },
          { type: 'info', text: '│    time                Show date/time   │' },
          { type: 'info', text: '│    home                Reset viewport   │' },
          { type: 'info', text: '└─────────────────────────────────────────┘' },
          { type: 'system', text: '' },
        ]);
        break;

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
        addOutput([
          { type: 'success', text: 'Opening notes editor...' },
          { type: 'system', text: '' },
        ]);
        navigate('/notes');
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
          { type: 'system', text: 'ARGUS TERMINAL v2.0.0' },
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
      case 'date':
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
          { type: 'info', text: 'Argus Terminal v2.0.0' },
          { type: 'info', text: 'Built with React + Vite + TailwindCSS' },
          { type: 'info', text: 'https://github.com/this-bytes/argus' },
          { type: 'system', text: '' },
        ]);
        break;

      default:
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
      // Simple tab completion for commands
      const commands = ['help', 'go', 'open', 'bm', 'alias', 'feeds', 'scripts', 'note', 'config', 'clear', 'history', 'home', 'time', 'whoami', 'version'];
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
        { type: 'system', text: 'ARGUS TERMINAL v2.0.0' },
        { type: 'system', text: '' },
      ]);
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
