"use client";

import Link from "next/link";

export default function AdminStaffPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-10">Admin – Staff</h1>

      <div className="grid grid-cols-2 gap-6 max-w-md w-full">
        <Link
          href="/admin/staff/schedules"
          className="p-6 rounded-xl bg-red-700 hover:bg-red-600 transition text-center shadow-lg"
        >
          📅 Schedules
        </Link>
        <Link
          href="/admin/staff/announcements"
          className="p-6 rounded-xl bg-red-700 hover:bg-red-600 transition text-center shadow-lg"
        >
          📢 Announcements
        </Link>
        <Link
          href="/admin/staff/documents"
          className="p-6 rounded-xl bg-red-700 hover:bg-red-600 transition text-center shadow-lg"
        >
          📄 Documents
        </Link>
        <Link
          href="/admin/staff/technical"
          className="p-6 rounded-xl bg-red-700 hover:bg-red-600 transition text-center shadow-lg"
        >
          ⚙️ Technical
        </Link>
        <Link
          href="/admin/staff/contacts"
          className="p-6 rounded-xl bg-red-700 hover:bg-red-600 transition text-center shadow-lg"
        >
          👥 Contacts
        </Link>
        <Link
          href="/admin/staff/reports"
          className="p-6 rounded-xl bg-red-700 hover:bg-red-600 transition text-center shadow-lg"
        >
          📝 Reports
        </Link>
      </div>
    </main>
  );
}
