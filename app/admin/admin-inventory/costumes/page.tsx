"use client";

import { useEffect, useState } from "react";
import { db, storage } from "../../../../lib/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import Papa from "papaparse";

type Costume = {
  id: string;
  description: string;
  location: string;
  photoUrl?: string;
  createdAt?: any;
};

export default function AdminCostumesPage() {
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  // Load costumes from Firestore
  useEffect(() => {
    const fetchCostumes = async () => {
      const snapshot = await getDocs(collection(db, "costumes"));
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Costume[];
      setCostumes(data);
    };
    fetchCostumes();
  }, []);

  // Add new costume
  const handleAddCostume = async () => {
    if (!description || !location) return;

    let photoUrl = "";
    if (photo) {
      const storageRef = ref(storage, `costumes/${Date.now()}-${photo.name}`);
      await uploadBytes(storageRef, photo);
      photoUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(collection(db, "costumes"), {
      description,
      location,
      photoUrl,
      createdAt: serverTimestamp(),
    });

    setCostumes((prev) => [
      ...prev,
      { id: docRef.id, description, location, photoUrl },
    ]);

    setDescription("");
    setLocation("");
    setPhoto(null);
  };

  // Bulk upload CSV
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        for (const row of results.data as any[]) {
          if (!row.Description || !row.Location) continue;

          await addDoc(collection(db, "costumes"), {
            description: row.Description,
            location: row.Location,
            photoUrl: row.Photo || "",
            createdAt: serverTimestamp(),
          });
        }
        const snapshot = await getDocs(collection(db, "costumes"));
        setCostumes(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Costume[]
        );
      },
    });
  };

  // Delete costume
  const handleDeleteCostume = async (costume: Costume) => {
    await deleteDoc(doc(db, "costumes", costume.id));
    if (costume.photoUrl) {
      try {
        const storageRef = ref(storage, costume.photoUrl);
        await deleteObject(storageRef);
      } catch (err) {
        console.warn("Could not delete photo:", err);
      }
    }
    setCostumes((prev) => prev.filter((c) => c.id !== costume.id));
  };

  // Filtered list
  const filteredCostumes = costumes.filter(
    (c) =>
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Costumes</h1>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search costumes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-2 bg-black/50 rounded border border-gray-600 text-white"
      />

      {/* Add new costume form */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 bg-black/50 rounded border border-gray-600 text-white"
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 bg-black/50 rounded border border-gray-600 text-white"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          className="w-full p-2 text-white"
        />
        <button
          onClick={handleAddCostume}
          className="px-4 py-2 bg-red-700 rounded hover:bg-red-600"
        >
          ➕ Add Costume
        </button>
      </div>

      {/* CSV Upload */}
      <div className="mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="w-full text-white"
        />
      </div>

      {/* List of Costumes */}
      <div className="space-y-4">
        {filteredCostumes.map((costume) => (
          <div
            key={costume.id}
            className="flex items-center justify-between bg-black/40 p-4 rounded shadow"
          >
            <div>
              <p className="font-semibold">{costume.description}</p>
              <p className="text-sm text-gray-400">
                Location: {costume.location}
              </p>
            </div>
            {costume.photoUrl && (
              <img
                src={costume.photoUrl}
                alt={costume.description}
                className="w-16 h-16 object-cover rounded ml-4"
              />
            )}
            <button
              onClick={() => handleDeleteCostume(costume)}
              className="ml-4 px-3 py-1 bg-red-700 rounded hover:bg-red-600"
            >
              ❌ Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
