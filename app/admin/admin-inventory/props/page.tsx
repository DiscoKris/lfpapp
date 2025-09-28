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

type PropItem = {
  id: string;
  description: string;
  location: string;
  photoUrl?: string;
};

export default function AdminPropsPage() {
  const [propsItems, setPropsItems] = useState<PropItem[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProps = async () => {
      const snapshot = await getDocs(collection(db, "props"));
      setPropsItems(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as PropItem[]
      );
    };
    fetchProps();
  }, []);

  const handleAddProp = async () => {
    if (!description || !location) return;

    let photoUrl = "";
    if (photo) {
      const storageRef = ref(storage, `props/${Date.now()}-${photo.name}`);
      await uploadBytes(storageRef, photo);
      photoUrl = await getDownloadURL(storageRef);
    }

    const docRef = await addDoc(collection(db, "props"), {
      description,
      location,
      photoUrl,
      createdAt: serverTimestamp(),
    });

    setPropsItems((prev) => [...prev, { id: docRef.id, description, location, photoUrl }]);
    setDescription("");
    setLocation("");
    setPhoto(null);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        for (const row of results.data as any[]) {
          if (!row.Description || !row.Location) continue;
          await addDoc(collection(db, "props"), {
            description: row.Description,
            location: row.Location,
            photoUrl: row.Photo || "",
            createdAt: serverTimestamp(),
          });
        }
        const snapshot = await getDocs(collection(db, "props"));
        setPropsItems(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as PropItem[]
        );
      },
    });
  };

  const handleDeleteProp = async (prop: PropItem) => {
    await deleteDoc(doc(db, "props", prop.id));
    if (prop.photoUrl) {
      try {
        const storageRef = ref(storage, prop.photoUrl);
        await deleteObject(storageRef);
      } catch (err) {
        console.warn("Could not delete photo:", err);
      }
    }
    setPropsItems((prev) => prev.filter((p) => p.id !== prop.id));
  };

  const filteredProps = propsItems.filter(
    (p) =>
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Props</h1>

      <input
        type="text"
        placeholder="Search props..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-2 bg-black/50 rounded border border-gray-600 text-white"
      />

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
        <button onClick={handleAddProp} className="px-4 py-2 bg-red-700 rounded hover:bg-red-600">
          ➕ Add Prop
        </button>
      </div>

      <div className="mb-6">
        <input type="file" accept=".csv" onChange={handleCSVUpload} className="w-full text-white" />
      </div>

      <div className="space-y-4">
        {filteredProps.map((prop) => (
          <div key={prop.id} className="flex items-center justify-between bg-black/40 p-4 rounded shadow">
            <div>
              <p className="font-semibold">{prop.description}</p>
              <p className="text-sm text-gray-400">Location: {prop.location}</p>
            </div>
            {prop.photoUrl && (
              <img src={prop.photoUrl} alt={prop.description} className="w-16 h-16 object-cover rounded ml-4" />
            )}
            <button
              onClick={() => handleDeleteProp(prop)}
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
