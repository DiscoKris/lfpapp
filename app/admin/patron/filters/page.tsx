"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

type Show = {
  id: string;
  name?: string;
  Name?: string;
  city?: string;
  City?: string;
};

export default function AdminFiltersPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(true);
  const [showsError, setShowsError] = useState("");
  const [selectedShow, setSelectedShow] = useState("");

  // ---- Load shows ----
  const loadShows = async () => {
    setLoadingShows(true);
    setShowsError("");
    try {
      const snap = await getDocs(collection(db, "shows"));
      const data = snap.docs.map((docSnap) => {
        const d = docSnap.data() as any;
        return {
          id: docSnap.id,
          name: d.name ?? d.Name ?? "",
          city: d.city ?? d.City ?? "",
        } as Show;
      });
      data.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
      setShows(data);
      if (snap.size === 0) setShowsError("No shows found in Firestore.");
    } catch (err: any) {
      console.error("Error loading shows:", err);
      setShowsError(err.message || "Error loading shows (check rules/config).");
    } finally {
      setLoadingShows(false);
    }
  };

  useEffect(() => {
    loadShows();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white p-6">
      {/* ✅ Back button */}
      <div className="max-w-md mx-auto mb-4">
        <a
          href="/admin/patron"
          className="inline-block px-4 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm"
        >
          ← Back
        </a>
      </div>

      <h1 className="text-2xl font-bold text-center mb-8">Camera Filters</h1>

      <div className="max-w-md mx-auto">
        {/* Diagnostics */}
        <div className="mb-4 text-xs opacity-80">
          <div>Shows loaded: {loadingShows ? "…" : shows.length}</div>
          {showsError && (
            <div className="text-yellow-300 mt-1">{showsError}</div>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={loadShows}
          className="mb-6 px-3 py-2 bg-white/15 hover:bg-white/25 rounded text-sm"
        >
          Refresh List
        </button>

        {/* ✅ Select Show */}
        <label className="block mb-2 text-sm font-semibold text-white/90">
          Select Show
        </label>
        <div className="relative mb-6">
          <select
            value={selectedShow}
            onChange={(e) => setSelectedShow(e.target.value)}
            className="w-full p-3 rounded-lg bg-transparent text-white border border-white/40 
                       focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
          >
            <option value="" disabled>
              -- Choose a show --
            </option>
            {shows.map((s) => (
              <option
                key={s.id}
                value={s.id}
                className="bg-black text-white"
              >
                {(s.name || s.id)}{s.city ? ` (${s.city})` : ""}
              </option>
            ))}
          </select>

          {/* visible caret */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="text-white/80"
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </div>
        </div>

        {/* Future: upload or manage filters UI here */}
      </div>
    </main>
  );
}
