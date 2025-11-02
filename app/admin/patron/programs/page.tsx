"use client";

import { useEffect, useState } from "react";
import { db, storage } from "../../../../lib/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

type Show = {
  id: string;
  // Support both capitalized and lowercase Firestore fields
  name?: string;
  Name?: string;
  city?: string;
  City?: string;
  programUrl?: string;
  programurl?: string;
};

export default function AdminProgramsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<string>("");
  const [currentProgramUrl, setCurrentProgramUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  // Load shows from Firestore and normalize field names
  useEffect(() => {
    const fetchShows = async () => {
      const snapshot = await getDocs(collection(db, "shows"));
      const data = snapshot.docs.map((docSnap) => {
        const d = docSnap.data() as any;
        const normalized: Show = {
          id: docSnap.id,
          ...d,
          name: d.name ?? d.Name ?? "",
          city: d.city ?? d.City ?? "",
          programUrl: d.programUrl ?? d.programurl ?? "",
        };
        return normalized;
      });

      // Sort alphabetically by name
      data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setShows(data);
    };
    fetchShows();
  }, []);

  // Load current program URL for the selected show
  useEffect(() => {
    const loadProgram = async () => {
      setCurrentProgramUrl("");
      setMessage("");
      if (!selectedShow) return;

      const snap = await getDoc(doc(db, "shows", selectedShow));
      if (snap.exists()) {
        const d = snap.data() as any;
        const url = (d.programUrl ?? d.programurl ?? "") as string;
        setCurrentProgramUrl(url || "");
      } else {
        setCurrentProgramUrl("");
      }
    };
    loadProgram();
  }, [selectedShow]);

  const handleUpload = async () => {
    if (!file || !selectedShow) {
      setMessage("Please select a show and a PDF file.");
      return;
    }
    if (file.type !== "application/pdf") {
      setMessage("Please upload a PDF file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setMessage("File too large (max 50MB).");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setMessage("");

      // Always overwrite the same file path per show
      const storageRef = ref(storage, `programs/${selectedShow}.pdf`);
      const task = uploadBytesResumable(storageRef, file);

      task.on("state_changed", (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setProgress(pct);
      });

      await task;
      const rawUrl = await getDownloadURL(storageRef);
      // Cache-bust so phones don’t show an old PDF
      const versionedUrl = `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;

      // Save to Firestore
      await updateDoc(doc(db, "shows", selectedShow), { programUrl: versionedUrl });

      setCurrentProgramUrl(versionedUrl);
      setMessage("Program uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Error uploading program.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!selectedShow) return;
    try {
      setMessage("");
      const storageRef = ref(storage, `programs/${selectedShow}.pdf`);
      // Delete file from Storage (ignore if missing)
      await deleteObject(storageRef).catch(() => {});
      // Clear Firestore field
      await updateDoc(doc(db, "shows", selectedShow), { programUrl: "" });
      setCurrentProgramUrl("");
      setMessage("Program deleted successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Error deleting program.");
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

      <h1 className="text-2xl font-bold text-center mb-8">Upload Program</h1>

      <div className="max-w-md mx-auto">
        {/* Select Show */}
        <div className="mb-6">
          <label className="block mb-2">Select Show</label>
          <select
            value={selectedShow}
            onChange={(e) => setSelectedShow(e.target.value)}
            className="w-full p-2 rounded text-white"
          >
            <option value="">-- Choose a show --</option>
            {shows.map((show) => (
              <option key={show.id} value={show.id}>
                {(show.name || show.id)}{show.city ? ` (${show.city})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Current Program (if any) */}
        {selectedShow && (
          <div className="mb-6 bg-white/10 rounded p-4">
            <p className="mb-2">
              Current program:{" "}
              {currentProgramUrl ? (
                <span className="text-green-300">✅ Uploaded</span>
              ) : (
                <span className="text-yellow-300">— none —</span>
              )}
            </p>
            {currentProgramUrl && (
              <>
                <a
                  href={currentProgramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  View current PDF
                </a>
                <button
                  onClick={handleDelete}
                  className="ml-3 px-3 py-1 bg-red-600 hover:bg-red-500 rounded"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}

        {/* Upload PDF */}
        <div className="mb-6">
          <label className="block mb-2">Upload PDF Program</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 bg-white text-black rounded"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-3 bg-red-700 hover:bg-red-600 rounded font-semibold disabled:opacity-50"
        >
          {uploading ? `Uploading… ${progress}%` : "Upload Program"}
        </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </main>
  );
}
