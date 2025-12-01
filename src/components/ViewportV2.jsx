import { useArgus } from '../context/useArgus';

function Viewport() {
  const { viewport, bookmarks, feeds } = useArgus();

  // Iframe view
  if (viewport.type === 'iframe' && viewport.data) {
    return (
      <div className="h-full flex flex-col bg-black/90 border-2 border-green-500/60 rounded-lg overflow-hidden shadow-lg shadow-green-500/20">
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-500/40 bg-gradient-to-r from-green-900/40 to-black/60">
          <span className="text-green-400 text-sm font-bold truncate tracking-wider">
            {viewport.data.title}
          </span>
          <a
            href={viewport.data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500/70 hover:text-green-400 text-xs transition-colors font-bold"
          >
            [OPEN EXTERNAL]
          </a>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={viewport.data.url}
            title={viewport.data.title}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    );
  }

  // Bookmarks view
  if (viewport.type === 'bookmarks') {
    const tag = viewport.data?.tag;
    const filtered = tag 
      ? bookmarks.filter(b => b.tags.includes(tag))
      : bookmarks;

    return (
      <div className="h-full flex flex-col bg-black/90 border-2 border-green-500/60 rounded-lg overflow-hidden shadow-lg shadow-green-500/20">
        <div className="flex items-center px-4 py-3 border-b border-green-500/40 bg-gradient-to-r from-green-900/40 to-black/60">
          <span className="text-green-400 text-sm font-bold tracking-wider">
            BOOKMARKS {tag ? `#${tag}` : ''}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-green-500/50 py-8">
              No bookmarks found.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Feeds view
  if (viewport.type === 'feeds') {
    return (
      <div className="h-full flex flex-col bg-black/90 border-2 border-green-500/60 rounded-lg overflow-hidden shadow-lg shadow-green-500/20">
        <div className="flex items-center px-4 py-3 border-b border-green-500/40 bg-gradient-to-r from-green-900/40 to-black/60">
          <span className="text-green-400 text-sm font-bold tracking-wider">RSS FEEDS</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {feeds.map((feed) => (
              <FeedCard key={feed.id} feed={feed} />
            ))}
          </div>
          <div className="mt-6 p-4 border border-green-500/30 rounded bg-green-900/10">
            <p className="text-green-500/70 text-sm">
              <span className="text-yellow-400">⚠️ Note:</span> RSS feed parsing requires a backend proxy due to CORS restrictions. 
              These are displayed as quick-access links. Consider using a service like Feedly or a self-hosted RSS reader.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Welcome/Home view (default)
  return (
    <div className="h-full flex flex-col bg-black/90 border-2 border-green-500/60 rounded-lg overflow-hidden shadow-lg shadow-green-500/20">
      <div className="flex items-center px-4 py-3 border-b border-green-500/40 bg-gradient-to-r from-green-900/40 to-black/60">
        <span className="text-green-400 text-sm font-bold tracking-wider">COMMAND CENTER</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <WelcomeCard />
      </div>
    </div>
  );
}

function BookmarkCard({ bookmark }) {
  return (
    <a
      href={bookmark.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border border-green-500/40 rounded-lg bg-black/50 hover:bg-green-900/20 hover:border-green-400 transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{bookmark.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-green-400 font-bold truncate group-hover:text-green-300">
            {bookmark.name}
          </h3>
          <p className="text-green-500/50 text-xs truncate mt-1">
            {bookmark.url}
          </p>
          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {bookmark.tags.map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}

function FeedCard({ feed }) {
  return (
    <a
      href={feed.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-4 border border-green-500/40 rounded-lg bg-black/50 hover:bg-green-900/20 hover:border-green-400 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${feed.enabled ? 'bg-green-500' : 'bg-gray-500'}`}></span>
        <span className="text-green-400 font-medium">{feed.name}</span>
      </div>
      <span className="text-green-500/50 text-xs">[OPEN]</span>
    </a>
  );
}

function WelcomeCard() {
  return (
    <div className="text-center max-w-lg">
      <div className="mb-6">
        <pre className="text-green-500 text-xs leading-tight text-glow inline-block text-left">
{`
    ___    ____  _______ ______
   /   |  / __ \\/ ____/ / / ___/
  / /| | / /_/ / / __/ / /\\__ \\ 
 / ___ |/ _, _/ /_/ / /_/ /__/ / 
/_/  |_/_/ |_|\\____/\\____/____/  
`}
        </pre>
      </div>

      <h2 className="text-xl text-green-500 mb-2 font-bold">
        WELCOME TO ARGUS
      </h2>
      <p className="text-green-500/50 text-sm mb-6">
        Your InfoSec Browser Command Center
      </p>

      <div className="grid grid-cols-2 gap-3 text-left mb-6">
        <QuickCommand cmd="bm" desc="View bookmarks" />
        <QuickCommand cmd="alias" desc="List aliases" />
        <QuickCommand cmd="go gh" desc="Open GitHub" />
        <QuickCommand cmd="feeds" desc="RSS feeds" />
        <QuickCommand cmd="note" desc="Quick notes" />
        <QuickCommand cmd="config" desc="Settings" />
      </div>

      <div className="text-green-500/40 text-xs space-y-1">
        <p>Type <span className="text-green-400">help</span> for all commands</p>
        <p>Press <span className="text-green-400">Tab</span> for autocomplete</p>
        <p>Press <span className="text-green-400">↑/↓</span> for history</p>
      </div>
    </div>
  );
}

function QuickCommand({ cmd, desc }) {
  return (
    <div className="p-2 border border-green-500/20 rounded bg-black/30">
      <code className="text-green-400 text-sm">{cmd}</code>
      <p className="text-green-500/50 text-xs mt-1">{desc}</p>
    </div>
  );
}

export default Viewport;
