export const theme = {
  dark: {
    '--bg-primary':    '#0f0f13',
    '--bg-surface':    '#1a1a24',
    '--bg-elevated':   '#252535',
    '--bg-hover':      '#2e2e42',
    '--accent':        '#7c6af5',
    '--accent-hover':  '#9d8fff',
    '--accent-muted':  '#7c6af520',
    '--danger':        '#ef4444',
    '--success':       '#22c55e',
    '--warning':       '#f59e0b',
    '--text-primary':  '#f0f0fa',
    '--text-secondary':'#8888aa',
    '--text-muted':    '#55556a',
    '--border':        '#2e2e42',
    '--border-subtle': '#1e1e2e',
    '--shadow':        '0 4px 24px rgba(0,0,0,0.4)',
  },
  light: {
    '--bg-primary':    '#f5f5fa',
    '--bg-surface':    '#ffffff',
    '--bg-elevated':   '#ebebf5',
    '--bg-hover':      '#e0e0f0',
    '--accent':        '#7c6af5',
    '--accent-hover':  '#5b4dd4',
    '--accent-muted':  '#7c6af520',
    '--danger':        '#ef4444',
    '--success':       '#16a34a',
    '--warning':       '#d97706',
    '--text-primary':  '#111118',
    '--text-secondary':'#555570',
    '--text-muted':    '#999ab0',
    '--border':        '#ddddf0',
    '--border-subtle': '#ebebf5',
    '--shadow':        '0 4px 24px rgba(0,0,0,0.08)',
  }
};

export function applyTheme(mode) {
  const vars = theme[mode];
  Object.entries(vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });
}