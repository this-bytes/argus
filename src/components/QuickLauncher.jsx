import { useArgus } from '../context/useArgus';

function QuickLauncher() {
  const { bookmarks, usageStats, settings } = useArgus();
  
  // Get top bookmarks based on usage frequency
  const getTopBookmarks = () => {
    const maxItems = 9;
    
    // If we have usage stats, sort by frequency
    if (usageStats && Object.keys(usageStats).length > 0) {
      return [...bookmarks]
        .sort((a, b) => (usageStats[b.id] || 0) - (usageStats[a.id] || 0))
        .slice(0, maxItems);
    }
    
    // Otherwise return first N bookmarks
    return bookmarks.slice(0, maxItems);
  };

  const topBookmarks = getTopBookmarks();
  const theme = settings?.theme || 'green';

  // Dynamic colors based on theme
  const getThemeColors = () => {
    const themes = {
      green: { text: 'text-green-400', border: 'border-green-500/40', hover: 'hover:border-green-400', bg: 'hover:bg-green-900/20' },
      amber: { text: 'text-amber-400', border: 'border-amber-500/40', hover: 'hover:border-amber-400', bg: 'hover:bg-amber-900/20' },
      blue: { text: 'text-blue-400', border: 'border-blue-500/40', hover: 'hover:border-blue-400', bg: 'hover:bg-blue-900/20' },
      red: { text: 'text-red-400', border: 'border-red-500/40', hover: 'hover:border-red-400', bg: 'hover:bg-red-900/20' },
      purple: { text: 'text-purple-400', border: 'border-purple-500/40', hover: 'hover:border-purple-400', bg: 'hover:bg-purple-900/20' },
    };
    return themes[theme] || themes.green;
  };

  const colors = getThemeColors();

  if (topBookmarks.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className={`text-xs ${colors.text} opacity-50 mb-3 font-bold tracking-wider`}>
        QUICK LAUNCH [1-9]
      </div>
      <div className="grid grid-cols-3 gap-3">
        {topBookmarks.map((bookmark, index) => (
          <QuickLaunchItem 
            key={bookmark.id} 
            bookmark={bookmark} 
            index={index + 1}
            colors={colors}
          />
        ))}
      </div>
    </div>
  );
}

function QuickLaunchItem({ bookmark, index, colors }) {
  const { recordUsage } = useArgus();

  const handleClick = () => {
    if (recordUsage) {
      recordUsage(bookmark.id);
    }
    window.open(bookmark.url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center p-3 
        border ${colors.border} ${colors.hover} ${colors.bg}
        rounded-lg bg-black/50 transition-all group
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
      `}
      title={`${bookmark.name} (Press ${index} to launch)`}
    >
      <span className="text-2xl mb-1">{bookmark.icon}</span>
      <span className={`text-xs ${colors.text} truncate w-full text-center`}>
        {bookmark.name}
      </span>
      <span className={`text-[10px] ${colors.text} opacity-40 mt-1`}>
        [{index}]
      </span>
    </button>
  );
}

export default QuickLauncher;
