type TileProps = {
  title: string;
  emoji: string;
  href: string;
  badgeCount?: number; // old system (safe to keep)
  showNew?: boolean;   // new system for “NEW” badge
};

export default function Tile({ title, emoji, href, badgeCount, showNew }: TileProps) {
  return (
    <a
      href={href}
      className="relative flex flex-col items-center justify-center p-6 rounded-xl bg-red-700 hover:bg-red-600 transition text-center shadow-lg"
    >
      <span className="text-3xl mb-2">{emoji}</span>
      <span className="font-semibold">{title}</span>

      {/* 🔥 “NEW” badge */}
      {showNew && (
        <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
          NEW
        </span>
      )}

      {/* (Optional) Keep the old numeric badge logic just in case */}
      {badgeCount && badgeCount > 0 && !showNew && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badgeCount}
        </span>
      )}
    </a>
  );
}
