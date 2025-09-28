"use client";

import Link from "next/link";

export default function AdminPatronPage() {
  return (
    <main
      className="relative min-h-screen flex flex-col justify-center items-center px-6 bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Container */}
      <div className="relative z-10 w-full max-w-md mx-auto text-white">
        <h1 className="text-2xl font-bold text-center mb-10 drop-shadow-lg">
          Admin – Patron
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Programs */}
          <Link
            href="/admin/admin-patron/programs"
            className="p-6 rounded-xl bg-gradient-to-r from-red-700 to-red-500 shadow-lg hover:scale-105 transform transition text-center"
          >
            <h2 className="text-xl font-semibold">📖 Programs</h2>
            <p className="text-sm opacity-80">Upload & manage show programs</p>
          </Link>

          {/* Games */}
          <Link
            href="/admin/admin-patron/games"
            className="p-6 rounded-xl bg-gradient-to-r from-red-700 to-red-500 shadow-lg hover:scale-105 transform transition text-center"
          >
            <h2 className="text-xl font-semibold">🎮 Games</h2>
            <p className="text-sm opacity-80">Enable and edit fun intermission games</p>
          </Link>

          {/* Filters */}
          <Link
            href="/admin/admin-patron/filters"
            className="p-6 rounded-xl bg-gradient-to-r from-red-700 to-red-500 shadow-lg hover:scale-105 transform transition text-center"
          >
            <h2 className="text-xl font-semibold">📸 Filters</h2>
            <p className="text-sm opacity-80">Upload and manage photo filters</p>
          </Link>

          {/* Upcoming Shows */}
          <Link
            href="/admin/admin-patron/upcoming"
            className="p-6 rounded-xl bg-gradient-to-r from-red-700 to-red-500 shadow-lg hover:scale-105 transform transition text-center"
          >
            <h2 className="text-xl font-semibold">🎟️ Upcoming Shows</h2>
            <p className="text-sm opacity-80">Add/edit titles, dates, cities & ticket links</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
