"use client";

import { useEffect, useState } from "react";
import { db, storage } from "../../../../lib/firebaseConfig";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

type Show = {
  id: string;
  name?: string;   // normalized from name/Name
  Name?: string;
  city?: string;   // normalized from city/City
  City?: string;
};

export default function AdminFiltersPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loadingShows, setLoadingShows] = useState(true);
  const [showsError, setShowsError] = useState("");
  const [selectedShow, setSelectedShow] = useState("");

  const [currentFilterUrl, setCurrentFilterUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  // ---- Load shows and normalize fields ----
  const loadShows = async () => {
    setLoadingShows(true);
    setShowsError("");
    try {
      const snap = await getDocs(collection(db, "shows"));
      const data = snap.docs.map((d) => {
        const raw = d.data() as any;
        return {
          id: d.id,
          name: raw?.name ?? raw?.Name ?? "",
          city: raw?.city ?? raw?.City ?? "",
        } as Show;
      });
      data.sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
      setShows(data);
      if (snap.size === 0) setShowsError("No docs found in collection 'shows'.");
    } catch (err: any) {
      console.error("Error loading shows:", err);
      setShowsError(err?.message || "Error loading shows (rules/config?).");
    } finally {
      setLoadingShows(false);
    }
  };

  useEffect(() => { loadShows(); }, []);

  // ---- Load current filter when show changes ----
  useEffect(() => {
    const run = async () => {
      setCurrentFilterUrl("");
      setMessage("");
      if (!selectedShow) return;
      try {
        const snap = await getDoc(doc(db, "shows", selectedShow));
        if (snap.exists()) {
          const d = snap.data() as any;
          const url = (d?.filterUrl ?? d?.cameraFilterUrl ?? "") as string;
          setCurrentFilterUrl(url || "");
        }
      } catch (e) {
        console.error(e);
      }
    };
    run();
  }, [selectedShow]);

  // ---- Upload PNG filter (overwrites per show) ----
  const handleUpload = async () => {
    if (!selectedShow) { setMessage("Please select a show."); return; }
    if (!file) { setMessage("Please choose a PNG file."); return; }
    if (file.type !== "image/png") { setMessage("Filter must be a PNG (with transparency)."); return; }
    if (file.size > 10 * 1024 * 1024) { setMessage("File too large (max 10MB)."); return; }

    try {
      setUploading(true);
      setProgress(0);
      setMessage("");

      const storageRef = ref(storage, `filters/${selectedShow}.png`);
      const task = uploadBytesResumable(storageRef, file);

      task.on("state_changed", (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setProgress(pct);
      });

      await task;
      const rawUrl = await getDownloadURL(storageRef);
      const versionedUrl = `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;

      await updateDoc(doc(db, "shows", selectedShow), { filterUrl: versionedUrl });

      setCurrentFilterUrl(versionedUrl);
      setMessage("Filter uploaded successfully!");
      setFile(null);
    } catch (e) {
      console.error(e);
      setMessage("Error uploading filter.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // ---- Delete existing filter ----
  const handleDelete = async () => {
    if (!selectedShow) return;
    try {
      setMessage("");
      const storageRef = ref(storage, `filters/${selectedShow}.png`);
      await deleteObject(storageRef).catch(() => {}); // ignore if not found
      await updateDoc(doc(db, "shows", selectedShow), { filterUrl: "" });
      setCurrentFilterUrl("");
      setMessage("Filter deleted.");
    } catch (e) {
      console.error(e);
      setMessage("Error deleting filter.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white p-6">
      {/* Back button */}
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
          {showsError && <div className="text-yellow-300 mt-1">{showsError}</div>}
        </div>

        {/* Refresh */}
        <button
          onClick={loadShows}
          className="mb-6 px-3 py-2 bg-white/15 hover:bg-white/25 rounded text-sm"
        >
          Refresh List
        </button>

        {/* Select Show */}
        <label className="block mb-2 text-sm font-semibold text-white/90">Select Show</label>
        <div className="relative mb-6">
          <select
            value={selectedShow}
            onChange={(e) => setSelectedShow(e.target.value)}
            className="w-full p-3 rounded-lg bg-transparent text-white border border-white/40
                       focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
          >
            <option value="" disabled>-- Choose a show --</option>
            {shows.map((s) => (
              <option key={s.id} value={s.id} className="bg-black text-white">
                {(s.name || s.id)}{s.city ? ` (${s.city})` : ""}
              </option>
            ))}
          </select>
          {/* visible caret */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-white/80">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </div>
        </div>

        {/* Current Filter */}
        {selectedShow && (
          <div className="mb-6 bg-white/10 rounded p-4">
            <p className="mb-2">
              Current filter:{" "}
              {currentFilterUrl ? (
                <span className="text-green-300">✅ Uploaded</span>
              ) : (
                <span className="text-yellow-300">— none —</span>
              )}
            </p>

            {currentFilterUrl && (
              <>
                {/* checkerboard preview behind PNG */}
                <div className="mt-2 rounded overflow-hidden">
                  <div
                    className="w-full"
                    style={{
                      height: "240px",
                      backgroundImage:
                        "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                      backgroundSize: "24px 24px",
                      backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
                      position: "relative",
                    }}
                  >
                    <img
                      src={currentFilterUrl}
                      alt="Current filter"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDelete}
                  className="mt-3 px-3 py-2 bg-red-600 hover:bg-red-500 rounded"
                >
                  Delete Filter
                </button>
              </>
            )}
          </div>
        )}

        {/* Upload PNG */}
        <div className="mb-2">
          <label className="block mb-2 text-sm font-semibold text-white/90">
            Upload PNG Filter (recommended 1080×1920, transparent background)
          </label>
          <input
            type="file"
            accept="image/png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 bg-white text-black rounded"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedShow}
          className="w-full py-3 bg-red-700 hover:bg-red-600 rounded font-semibold disabled:opacity-50"
        >
          {uploading ? `Uploading… ${progress}%` : "Upload Filter"}
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </main>
  );
}
