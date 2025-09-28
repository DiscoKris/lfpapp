"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <main
      className="relative min-h-screen flex flex-col justify-center items-center px-6 bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-white/05" />

      {/* Container */}
      <div className="relative z-10 w-full max-w-md mx-auto text-white">
        <h1 className="text-3xl font-bold text-center mb-10 drop-shadow-lg">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-6">
          {/* Patrons */}
          <Link
            href="/admin/admin-patron"
            className="p-6 rounded-xl bg-gradient-to-r from-red-700 to-red-500 shadow-lg hover:scale-105 transform transition text-center"
          >
            <h2 className="text-xl font-semibold">🎭 Patrons</h2>
            <p className="text-sm opacity-80">Manage programs, games, filters, shows</p>
          </Link>

          {/* Staff */}
          <Link
            href="/admin/admin-staff"
            className="p-6 rounded-xl bg-gradient-to-r from-red-700 to-red-500 shadow-lg hover:scale-105 transform transition text-center"
          >
            <h2 className="text-xl font-semibold">👩‍💼 Staff</h2>
            <p className="text-sm opacity-80">Upload schedules, docs, reports, contacts</p>
          </Link>

          {/* Inventory */}
          <Link
            href="/admin/inventory"
            className="p-6 rounded-xl bg-gradient-to-r from-red-700 to-red-500 shadow-lg hover:scale-105 transform transition text-center"
          >
            <h2 className="text-xl font-semibold">📦 Inventory</h2>
            <p className="text-sm opacity-80">Upload Costumes, props, sets, wigs, shoes, drops</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
