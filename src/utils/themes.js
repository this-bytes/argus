// Theme definitions for Argus

export const THEMES = {
  green: {
    name: 'Matrix Green',
    primary: '#4ade80',      // green-400
    secondary: '#22c55e',     // green-500
    muted: '#15803d',         // green-700
    background: '#000000',
    border: 'rgba(74, 222, 128, 0.6)',
    glow: 'rgba(74, 222, 128, 0.2)',
    headerGradient: 'from-green-900/40 to-black/60',
    accent: 'green',
  },
  amber: {
    name: 'Retro Amber',
    primary: '#fbbf24',       // amber-400
    secondary: '#f59e0b',     // amber-500
    muted: '#b45309',         // amber-700
    background: '#000000',
    border: 'rgba(251, 191, 36, 0.6)',
    glow: 'rgba(251, 191, 36, 0.2)',
    headerGradient: 'from-amber-900/40 to-black/60',
    accent: 'amber',
  },
  blue: {
    name: 'Cyber Blue',
    primary: '#60a5fa',       // blue-400
    secondary: '#3b82f6',     // blue-500
    muted: '#1d4ed8',         // blue-700
    background: '#000000',
    border: 'rgba(96, 165, 250, 0.6)',
    glow: 'rgba(96, 165, 250, 0.2)',
    headerGradient: 'from-blue-900/40 to-black/60',
    accent: 'blue',
  },
  red: {
    name: 'Alert Red',
    primary: '#f87171',       // red-400
    secondary: '#ef4444',     // red-500
    muted: '#b91c1c',         // red-700
    background: '#000000',
    border: 'rgba(248, 113, 113, 0.6)',
    glow: 'rgba(248, 113, 113, 0.2)',
    headerGradient: 'from-red-900/40 to-black/60',
    accent: 'red',
  },
  purple: {
    name: 'Phantom Purple',
    primary: '#c084fc',       // purple-400
    secondary: '#a855f7',     // purple-500
    muted: '#7e22ce',         // purple-700
    background: '#000000',
    border: 'rgba(192, 132, 252, 0.6)',
    glow: 'rgba(192, 132, 252, 0.2)',
    headerGradient: 'from-purple-900/40 to-black/60',
    accent: 'purple',
  },
};

// Get theme by name (with fallback to green)
export function getTheme(themeName) {
  return THEMES[themeName] || THEMES.green;
}

// Get all theme names
export function getThemeNames() {
  return Object.keys(THEMES);
}

// Get CSS variables for a theme
export function getThemeCssVars(themeName) {
  const theme = getTheme(themeName);
  return {
    '--theme-primary': theme.primary,
    '--theme-secondary': theme.secondary,
    '--theme-muted': theme.muted,
    '--theme-background': theme.background,
    '--theme-border': theme.border,
    '--theme-glow': theme.glow,
  };
}
