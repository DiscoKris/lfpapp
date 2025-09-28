"use client";

import Link from "next/link";

type TileProps = {
  title: string;
  emoji?: string;
  href: string;
  badgeCount?: number; // NEW
};

export default function Tile({ title, emoji, href, badgeCount }: TileProps) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center justify-center h-36 p-4 border-2 rounded-xl shadow-lg bg-black/40 hover:scale-105 transition"
    >
      <div className="text-3xl">{emoji ?? "🎟️"}</div>
      <p className="mt-2 text-sm font-medium">{title}</p>

      {/* Badge */}
      {badgeCount && badgeCount > 0 && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badgeCount}
        </span>
      )}
    </Link>
  );
}
