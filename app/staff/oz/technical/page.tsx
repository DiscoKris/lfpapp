"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";

type FileDoc = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  showId: string;
};

export default function StaffOzTechnicalPage() {
  const showId = "oz";
  const [files, setFiles] = useState<FileDoc[]>([]);

  useEffect(() => {
    const q = query(collection(db, "technical"), where("showId", "==", showId));
    const unsub = onSnapshot(q, (snapshot) => {
      setFiles(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<FileDoc, "id">;
          return { ...data, id: docSnap.id };
        })
      );
    });
    return () => unsub();
  }, [showId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Technical – The Winter of Oz
      </h1>

      {files.length === 0 ? (
        <p className="text-center text-gray-300">No technical docs uploaded yet.</p>
      ) : (
        <ul className="space-y-4 max-w-md mx-auto">
          {files.map((f) => (
            <li
              key={f.id}
              className="bg-white/10 p-4 rounded-xl flex justify-between items-center"
            >
              <span>{f.name}</span>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-700 px-4 py-2 rounded hover:bg-red-600"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
