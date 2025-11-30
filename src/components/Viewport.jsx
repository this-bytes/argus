import { useVector } from '../context/useVector';

function Viewport() {
  const { viewport } = useVector();

  if (viewport.type === 'iframe' && viewport.resource) {
    return (
      <div className="h-full flex flex-col bg-black/50 border border-green-500/50 rounded-sm overflow-hidden">
        {/* Viewport header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-green-500/30 bg-black/30">
          <span className="text-green-500/70 text-sm truncate">
            {viewport.resource.name}
          </span>
          <a
            href={viewport.resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-500/50 hover:text-green-500 text-xs transition-colors"
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
    <div className="h-full flex flex-col bg-black/50 border border-green-500/50 rounded-sm overflow-hidden">
      {/* Viewport header */}
      <div className="flex items-center px-3 py-2 border-b border-green-500/30 bg-black/30">
        <span className="text-green-500/70 text-sm">VIEWPORT</span>
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
 _    __ ______ ______ ______ ____   ____  
| |  / // ____// ____//_  __// __ \\ / __ \\ 
| | / // __/  / /      / /  / / / // /_/ / 
| |/ // /___ / /___   / /  / /_/ // _, _/  
|___//_____/ \\____/  /_/   \\____//_/ |_|   
`}
        </pre>
      </div>

      <h2 className="text-xl text-green-500 mb-4">
        WELCOME TO VECTOR
      </h2>

      <div className="text-green-500/70 text-sm space-y-2 mb-6">
        <p>A retro-styled resource launcher and terminal.</p>
        <p>Use the terminal on the left to navigate.</p>
      </div>

      <div className="text-green-500/50 text-xs space-y-1">
        <p>Type <span className="text-green-400">help</span> for available commands</p>
        <p>Type <span className="text-green-400">ls</span> to list resources</p>
        <p>Type <span className="text-green-400">open [id]</span> to launch a resource</p>
      </div>
    </div>
  );
}

export default Viewport;
