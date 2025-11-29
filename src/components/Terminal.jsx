import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVector } from '../context/useVector';

function Terminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([
    { type: 'system', text: 'VECTOR TERMINAL v1.0.0' },
    { type: 'system', text: 'Type "help" for available commands.' },
    { type: 'system', text: '' },
  ]);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const navigate = useNavigate();
  const { resources, openResource, addToHistory, clearHistory, commandHistory } = useVector();
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Auto-scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input on mount and when clicking terminal
  useEffect(() => {
    inputRef.current?.focus();
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
    addOutput([{ type: 'command', text: `> ${trimmedCmd}` }]);
    addToHistory({ command: trimmedCmd });

    const parts = trimmedCmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        addOutput([
          { type: 'info', text: 'Available commands:' },
          { type: 'info', text: '  ls          - List all resources' },
          { type: 'info', text: '  open [id]   - Open a resource by ID' },
          { type: 'info', text: '  note        - Open notes editor' },
          { type: 'info', text: '  config      - Open configuration' },
          { type: 'info', text: '  clear       - Clear terminal' },
          { type: 'info', text: '  history     - Show command history' },
          { type: 'info', text: '  help        - Show this help' },
          { type: 'system', text: '' },
        ]);
        break;

      case 'ls':
        if (resources.length === 0) {
          addOutput([
            { type: 'info', text: 'No resources configured.' },
            { type: 'info', text: 'Use "config" to add resources.' },
            { type: 'system', text: '' },
          ]);
        } else {
          addOutput([
            { type: 'info', text: 'Resources:' },
            ...resources.map((r) => ({
              type: 'info',
              text: `  [${r.id}] ${r.name} ${r.iframe ? '(iframe)' : '(external)'}`,
            })),
            { type: 'system', text: '' },
          ]);
        }
        break;

      case 'open':
        if (args.length === 0) {
          addOutput([
            { type: 'error', text: 'Usage: open [id]' },
            { type: 'info', text: 'Use "ls" to see available resource IDs.' },
            { type: 'system', text: '' },
          ]);
        } else {
          const resourceId = args[0];
          const found = openResource(resourceId);
          if (found) {
            const resource = resources.find((r) => r.id === resourceId);
            addOutput([
              { type: 'success', text: `Opening "${resource.name}"...` },
              { type: 'system', text: '' },
            ]);
          } else {
            addOutput([
              { type: 'error', text: `Resource "${resourceId}" not found.` },
              { type: 'info', text: 'Use "ls" to see available resources.' },
              { type: 'system', text: '' },
            ]);
          }
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
        addOutput([
          { type: 'success', text: 'Opening configuration...' },
          { type: 'system', text: '' },
        ]);
        navigate('/config');
        break;

      case 'clear':
        setOutput([
          { type: 'system', text: 'VECTOR TERMINAL v1.0.0' },
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
            { type: 'info', text: 'Command history:' },
            ...commandHistory.slice(-10).map((h, i) => ({
              type: 'info',
              text: `  ${i + 1}. ${h.command}`,
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

      default:
        addOutput([
          { type: 'error', text: `Unknown command: ${command}` },
          { type: 'info', text: 'Type "help" for available commands.' },
          { type: 'system', text: '' },
        ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setInput('');
      setHistoryIndex(-1);
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
      const filteredHistory = commandHistory.map((h) => h.command);
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(filteredHistory[filteredHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-red-500';
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
      className="h-full flex flex-col bg-black/50 border border-green-500/50 rounded-sm overflow-hidden cursor-text"
      onClick={handleTerminalClick}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-green-500/30 bg-black/30">
        <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
        <span className="ml-2 text-green-500/70 text-sm">VECTOR TERMINAL</span>
      </div>

      {/* Terminal output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm"
      >
        {output.map((line, index) => (
          <div key={index} className={`${getTextColor(line.type)} whitespace-pre-wrap`}>
            {line.text || '\u00A0'}
          </div>
        ))}
      </div>

      {/* Terminal input */}
      <div className="flex items-center px-3 py-2 border-t border-green-500/30 bg-black/30">
        <span className="text-green-500 mr-2">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="terminal-input flex-1 text-sm"
          placeholder="Enter command..."
          autoComplete="off"
          spellCheck="false"
        />
        <span className="text-green-500 cursor-blink">█</span>
      </div>
    </div>
  );
}

export default Terminal;
