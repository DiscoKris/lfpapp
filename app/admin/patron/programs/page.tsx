// /app/admin/programs/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../../lib/firebaseConfig";
import {
  collection, getDocs, doc, updateDoc, getDoc,
} from "firebase/firestore";
import {
  ref, uploadBytesResumable, getDownloadURL,
} from "firebase/storage";

type Show = {
  id: string;
  name: string;
  city: string;
  programUrl?: string;
};

export default function AdminProgramsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<string>("");
  const [currentProgramUrl, setCurrentProgramUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  // Load shows
  useEffect(() => {
    const fetchShows = async () => {
      const snapshot = await getDocs(collection(db, "shows"));
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      })) as Show[];
      setShows(data);
    };
    fetchShows();
  }, []);

  // Load current program when show changes
  useEffect(() => {
    const loadProgram = async () => {
      setCurrentProgramUrl("");
      if (!selectedShow) return;
      const showRef = doc(db, "shows", selectedShow);
      const snap = await getDoc(showRef);
      const url = (snap.exists() ? (snap.data().programUrl as string) : "") || "";
      setCurrentProgramUrl(url);
    };
    loadProgram();
  }, [selectedShow]);

  const handleUpload = async () => {
    if (!file || !selectedShow) {
      setMessage("Please select a show and a file.");
      return;
    }

    // Light validation
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

      // Upload as programs/{showId}.pdf
      const storageRef = ref(storage, `programs/${selectedShow}.pdf`);
      const task = uploadBytesResumable(storageRef, file);

      task.on("state_changed", (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setProgress(pct);
      });

      await task;
      const rawUrl = await getDownloadURL(storageRef);

      // Cache-bust param so patrons don't see stale files
      const versionedUrl = `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;

      // Save URL in Firestore
      const showRef = doc(db, "shows", selectedShow);
      await updateDoc(showRef, { programUrl: versionedUrl });

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

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white p-6">
      <h1 className="text-2xl font-bold text-center mb-8">Upload Program</h1>

      {/* Select Show */}
      <div className="mb-6">
        <label className="block mb-2">Select Show</label>
        <select
          value={selectedShow}
          onChange={(e) => setSelectedShow(e.target.value)}
          className="w-full p-2 rounded text-black"
        >
          <option value="">-- Choose a show --</option>
          {shows.map((show) => (
            <option key={show.id} value={show.id}>
              {show.name} ({show.city})
            </option>
          ))}
        </select>
      </div>

      {/* Current Program (if any) */}
      {currentProgramUrl && (
        <div className="mb-6 bg-white/10 rounded p-4">
          <p className="mb-2">Current program:</p>
          <a
            href={currentProgramUrl}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View current PDF
          </a>
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
    </main>
  );
}
