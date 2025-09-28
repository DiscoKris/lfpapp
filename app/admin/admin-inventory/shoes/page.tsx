"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import Papa from "papaparse";

type Shoe = {
  id: string;
  description: string;
  location: string;
};

export default function AdminShoesPage() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchShoes = async () => {
      const snapshot = await getDocs(collection(db, "shoes"));
      setShoes(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Shoe[]
      );
    };
    fetchShoes();
  }, []);

  const handleAddShoe = async () => {
    if (!description || !location) return;

    const docRef = await addDoc(collection(db, "shoes"), {
      description,
      location,
      createdAt: serverTimestamp(),
    });

    setShoes((prev) => [...prev, { id: docRef.id, description, location }]);
    setDescription("");
    setLocation("");
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        for (const row of results.data as any[]) {
          if (!row.Description || !row.Location) continue;
          await addDoc(collection(db, "shoes"), {
            description: row.Description,
            location: row.Location,
            createdAt: serverTimestamp(),
          });
        }
        const snapshot = await getDocs(collection(db, "shoes"));
        setShoes(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Shoe[]
        );
      },
    });
  };

  const handleDeleteShoe = async (shoe: Shoe) => {
    await deleteDoc(doc(db, "shoes", shoe.id));
    setShoes((prev) => prev.filter((s) => s.id !== shoe.id));
  };

  const filteredShoes = shoes.filter(
    (s) =>
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Shoes</h1>

      <input
        type="text"
        placeholder="Search shoes..."
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
        <button onClick={handleAddShoe} className="px-4 py-2 bg-red-700 rounded hover:bg-red-600">
          ➕ Add Shoe
        </button>
      </div>

      <div className="mb-6">
        <input type="file" accept=".csv" onChange={handleCSVUpload} className="w-full text-white" />
      </div>

      <div className="space-y-4">
        {filteredShoes.map((shoe) => (
          <div key={shoe.id} className="flex items-center justify-between bg-black/40 p-4 rounded shadow">
            <div>
              <p className="font-semibold">{shoe.description}</p>
              <p className="text-sm text-gray-400">Location: {shoe.location}</p>
            </div>
            <button
              onClick={() => handleDeleteShoe(shoe)}
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
