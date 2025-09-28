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
  listAll,
  deleteObject,
} from "firebase/storage";
import Image from "next/image";

type Show = {
  id: string;
  name: string;
  city: string;
  filters?: string[];
};

export default function AdminFiltersPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  // Load shows
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

  // Load filters when show selected
  useEffect(() => {
    const fetchFilters = async () => {
      if (!selectedShow) return;
      const folderRef = ref(storage, `filters/${selectedShow}`);
      const result = await listAll(folderRef);
      const urls = await Promise.all(
        result.items.map((item) => getDownloadURL(item))
      );
      setFilters(urls);
    };
    fetchFilters();
  }, [selectedShow]);

  const handleUpload = async () => {
    if (!file || !selectedShow) {
      setMessage("Please select a show and a file.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      // If already 5 filters, delete the first one
      if (filters.length >= 5) {
        const firstRef = ref(storage, `filters/${selectedShow}/filter0.png`);
        await deleteObject(firstRef).catch(() => {});
      }

      // Create new filename
      const newIndex = Date.now(); // timestamp to avoid clashes
      const storageRef = ref(
        storage,
        `filters/${selectedShow}/filter-${newIndex}.png`
      );

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Update Firestore with new array
      const newFilters = [...filters, url].slice(-5); // keep last 5
      const showRef = doc(db, "shows", selectedShow);
      await updateDoc(showRef, { filters: newFilters });

      setMessage("Filter uploaded successfully!");
      setFile(null);
      setFilters(newFilters);
    } catch (err) {
      console.error(err);
      setMessage("Error uploading filter.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white p-6">
      <h1 className="text-2xl font-bold text-center mb-8">Upload Filters</h1>

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

      {/* Upload */}
      <div className="mb-6">
        <label className="block mb-2">Upload Filter (PNG)</label>
        <input
          type="file"
          accept="image/png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-2 bg-white text-black rounded"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="w-full py-3 bg-red-700 hover:bg-red-600 rounded font-semibold disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Filter"}
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}

      {/* Preview Filters */}
      {filters.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Current Filters</h2>
          <div className="grid grid-cols-2 gap-4">
            {filters.map((url, i) => (
              <div
                key={i}
                className="bg-black/40 p-2 rounded-lg flex justify-center items-center"
              >
                <Image
                  src={url}
                  alt={`Filter ${i + 1}`}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
