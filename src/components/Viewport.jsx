import { useVector } from '../context/useVector';

function Viewport() {
  const { viewport } = useVector();

  if (viewport.type === 'iframe' && viewport.resource) {
    return (
      <div className="h-full flex flex-col bg-black/80 border-2 border-green-500/60 rounded-lg overflow-hidden shadow-lg shadow-green-500/10">
        {/* Viewport header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-green-500/40 bg-gradient-to-r from-green-900/30 to-black/50">
          <span className="text-green-400 text-sm font-bold truncate tracking-wider">
            {viewport.resource.name}
          </span>
          <a
            href={viewport.resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500/70 hover:text-green-400 text-xs transition-colors font-bold"
          >
            [OPEN EXTERNAL]
          </a>
        </div>

        {/* IFrame content */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={viewport.resource.url}
            title={viewport.resource.name}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    );
  }

  // Launch Card fallback
  return (
    <div className="h-full flex flex-col bg-black/80 border-2 border-green-500/60 rounded-lg overflow-hidden shadow-lg shadow-green-500/10">
      {/* Viewport header */}
      <div className="flex items-center px-4 py-3 border-b border-green-500/40 bg-gradient-to-r from-green-900/30 to-black/50">
        <span className="text-green-400 text-sm font-bold tracking-wider">VIEWPORT</span>
      </div>

      {/* Launch Card content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {viewport.resource ? (
          <LaunchCard resource={viewport.resource} />
        ) : (
          <WelcomeCard />
        )}
      </div>
    </div>
  );
}

function LaunchCard({ resource }) {
  return (
    <div className="text-center max-w-md">
      <div className="mb-6">
        <div className="inline-block p-4 border-2 border-green-500 rounded-lg mb-4 glitch-hover">
          <svg
            className="w-16 h-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl text-green-500 text-glow mb-2 font-bold">
        {resource.name}
      </h2>
      
      <p className="text-green-500/70 text-sm mb-6 break-all">
        {resource.url}
      </p>

      <p className="text-green-500/50 text-xs mb-6">
        This resource cannot be displayed in an iframe.
        <br />
        Click below to open in a new tab.
      </p>

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-6 py-3 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors text-sm font-bold tracking-wider glitch-hover"
      >
        [ LAUNCH RESOURCE ]
      </a>
    </div>
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

      <h2 className="text-xl text-green-500 mb-4">
        WELCOME TO ARGUS
      </h2>

      <div className="text-green-500/70 text-sm space-y-2 mb-6">
        <p>Your InfoSec browser command center.</p>
        <p>Manage bookmarks, feeds, aliases, and scripts.</p>
      </div>

      <div className="text-green-500/50 text-xs space-y-1">
        <p>Type <span className="text-green-400">help</span> for available commands</p>
        <p>Type <span className="text-green-400">bm</span> to list bookmarks</p>
        <p>Type <span className="text-green-400">go [alias]</span> to quick-launch</p>
      </div>
    </div>
  );
}

export default Viewport;
