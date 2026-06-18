export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const TAG_COLORS = {
  Work:     '#7c3aed',
  Personal: '#e879f9',
  Ideas:    '#22d3ee',
  Study:    '#4ade80',
  Finance:  '#fbbf24',
  Health:   '#f87171',
  Travel:   '#fb923c',
  Other:    '#8b8aaa',
};

export const ACCENT_COLORS = [
  '#7c3aed', '#e879f9', '#22d3ee', '#4ade80',
  '#fbbf24', '#f87171', '#fb923c', '#38bdf8',
];

export function getTagColor(tag) {
  return TAG_COLORS[tag] || TAG_COLORS['Other'];
}
