"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../../../lib/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Load shows from Firestore
  useEffect(() => {
    const fetchShows = async () => {
      const snapshot = await getDocs(collection(db, "shows"));
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Show[];
      setShows(data);
    };
    fetchShows();
  }, []);

  const handleUpload = async () => {
    if (!file || !selectedShow) {
      setMessage("Please select a show and a file.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      // Upload to Firebase Storage
      const storageRef = ref(storage, `programs/${selectedShow}.pdf`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Save URL in Firestore
      const showRef = doc(db, "shows", selectedShow);
      await updateDoc(showRef, { programUrl: url });

      setMessage("Program uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Error uploading program.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white p-6">
      <h1 className="text-2xl font-bold text-center mb-8">
        Upload Program
      </h1>

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
        {uploading ? "Uploading..." : "Upload Program"}
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </main>
  );
}
