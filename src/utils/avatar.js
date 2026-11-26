/**
 * Inline fallback avatar so the UI still looks right when the external
 * avatar host (pravatar / unsplash) is blocked or offline.
 */
export function initialsAvatar(name = '', bg = '#0B2545') {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
    <rect width="150" height="150" fill="${bg}"/>
    <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="#EEB902"
      font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="64" font-weight="700">${initials || 'CUJ'}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
