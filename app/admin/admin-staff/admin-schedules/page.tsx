"use client";

import { useState } from "react";
import AdminShowSelect from "../../../../components/AdminShowSelect";

export default function AdminSchedulesPage() {
  const [selectedShow, setSelectedShow] = useState("");

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Schedules</h1>

      {/* Show Dropdown */}
      <AdminShowSelect onSelect={setSelectedShow} />

      {selectedShow && (
        <div className="bg-black/50 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">
            Upload Schedule for {selectedShow}
          </h2>
          <input
            type="file"
            accept="application/pdf"
            className="w-full mb-4"
          />
          <button className="px-6 py-2 bg-red-700 hover:bg-red-600 rounded font-semibold">
            Upload
          </button>
        </div>
      )}
    </main>
  );
}
