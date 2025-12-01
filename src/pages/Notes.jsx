import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useArgus } from '../context/useArgus';

function Notes() {
  const { notes, setNotes } = useArgus();
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (e) => {
    setNotes(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      
      setNotes(value.substring(0, start) + '  ' + value.substring(end));
      
      // Move cursor after the inserted spaces
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = document.getElementById('notes-editor');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    const newText = notes.substring(0, start) + prefix + selectedText + suffix + notes.substring(end);
    
    setNotes(newText);
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.selectionStart = textarea.selectionEnd = newCursorPos;
    }, 0);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-green-500/30">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            {'<'} BACK
          </Link>
          <h1 className="text-xl text-green-500 text-glow">NOTES</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-500/50 text-xs">
            Auto-saved to localStorage
          </span>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`px-4 py-2 border text-sm transition-colors ${
              isPreview
                ? 'border-green-500 bg-green-500 text-black'
                : 'border-green-500/50 text-green-500 hover:bg-green-500/10'
            }`}
          >
            {isPreview ? 'EDIT' : 'PREVIEW'}
          </button>
        </div>
      </div>

      {/* Toolbar (only in edit mode) */}
      {!isPreview && (
        <div className="flex items-center gap-1 px-4 py-2 border-b border-green-500/20 bg-black/30">
          <button
            onClick={() => insertMarkdown('**', '**')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => insertMarkdown('*', '*')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm italic"
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => insertMarkdown('`', '`')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm font-mono"
            title="Code"
          >
            {'</>'}
          </button>
          <span className="w-px h-4 bg-green-500/30 mx-1"></span>
          <button
            onClick={() => insertMarkdown('# ')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm"
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => insertMarkdown('## ')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm"
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => insertMarkdown('### ')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm"
            title="Heading 3"
          >
            H3
          </button>
          <span className="w-px h-4 bg-green-500/30 mx-1"></span>
          <button
            onClick={() => insertMarkdown('- ')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm"
            title="Bullet List"
          >
            • List
          </button>
          <button
            onClick={() => insertMarkdown('1. ')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm"
            title="Numbered List"
          >
            1. List
          </button>
          <button
            onClick={() => insertMarkdown('> ')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm"
            title="Quote"
          >
            &quot; Quote
          </button>
          <button
            onClick={() => insertMarkdown('[', '](url)')}
            className="px-2 py-1 text-green-500 hover:bg-green-500/10 text-sm"
            title="Link"
          >
            🔗 Link
          </button>
        </div>
      )}

      {/* Editor / Preview */}
      <div className="flex-1 overflow-hidden p-4">
        {isPreview ? (
          <div className="h-full overflow-y-auto p-4 border border-green-500/30 bg-black/30">
            <div className="markdown-content prose prose-invert prose-green max-w-none">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <textarea
            id="notes-editor"
            value={notes}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-4 bg-black/30 border border-green-500/30 text-green-500 font-mono text-sm resize-none focus:outline-none focus:border-green-500"
            placeholder="Start typing your notes in Markdown..."
            spellCheck="false"
          />
        )}
      </div>
    </div>
  );
}

export default Notes;
