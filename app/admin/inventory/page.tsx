"use client";

import Link from "next/link";

export default function AdminInventoryPage() {
  const categories = [
    { id: "costumes", title: "Costumes", emoji: "👗" },
    { id: "set-pieces", title: "Set Pieces", emoji: "🎭" },
    { id: "props", title: "Props", emoji: "🪄" },
    { id: "drops", title: "Drops", emoji: "🖼️" },
    { id: "shoes", title: "Shoes", emoji: "👞" },
    { id: "wigs", title: "Wigs", emoji: "💇‍♀️" },
  ];

  return (
    <main
      className="relative min-h-screen flex flex-col justify-start items-center px-6 py-10 bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Container */}
      <div className="relative z-10 w-full max-w-md mx-auto text-white">
        <h1 className="text-2xl font-bold text-center mb-8 drop-shadow-lg">
          Admin – Inventory
        </h1>

        {/* Grid of Categories */}
        <div className="grid grid-cols-2 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/admin/admin-inventory/${cat.id}`}
              className="flex flex-col items-center justify-center h-32 p-4 border-2 border-red-600 rounded-xl shadow-lg bg-black/50 hover:scale-105 transition"
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <p className="text-lg font-semibold">{cat.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
