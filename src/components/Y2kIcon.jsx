import { Y2K_ICON_MAP } from '@/data/y2kIcons'

// Renders the Lucide-icon equivalent of a plain Unicode emoji.
// Falls back to the plain emoji character if it isn't in the map yet.
export default function Y2kIcon({ emoji, size = 32, className = '', strokeWidth = 2 }) {
  const Icon = Y2K_ICON_MAP[emoji]

  if (!Icon) {
    return <span className={className} style={{ fontSize: size * 0.85, lineHeight: 1 }}>{emoji}</span>
  }

  return <Icon size={size} strokeWidth={strokeWidth} className={className} />
}
