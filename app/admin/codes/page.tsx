"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebaseConfig";
import {
  collection,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

type Codes = {
  staffUnlock: string;
  announcementsUnlock: string;
  reportsUnlock: string;
};

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<Codes>({
    staffUnlock: "",
    announcementsUnlock: "",
    reportsUnlock: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch codes from Firestore
  useEffect(() => {
    const fetchCodes = async () => {
      const snapshot = await getDocs(collection(db, "appCodes"));
      const data: any = {};
      snapshot.forEach((docSnap) => {
        data[docSnap.id] = docSnap.data().value;
      });
      setCodes({
        staffUnlock: data.staffUnlock || "2025",
        announcementsUnlock: data.announcementsUnlock || "5678",
        reportsUnlock: data.reportsUnlock || "5678",
      });
      setLoading(false);
    };
    fetchCodes();
  }, []);

  // Save code changes
  const handleSave = async () => {
    await setDoc(doc(db, "appCodes", "staffUnlock"), { value: codes.staffUnlock });
    await setDoc(doc(db, "appCodes", "announcementsUnlock"), { value: codes.announcementsUnlock });
    await setDoc(doc(db, "appCodes", "reportsUnlock"), { value: codes.reportsUnlock });
    alert("Codes updated!");
  };

  if (loading) return <p className="text-white text-center mt-10">Loading codes...</p>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Change Codes</h1>

      <div className="space-y-6 max-w-md mx-auto">
        <div>
          <label className="block mb-2 font-semibold">Staff Unlock Code</label>
          <input
            type="text"
            value={codes.staffUnlock}
            onChange={(e) => setCodes({ ...codes, staffUnlock: e.target.value })}
            className="w-full p-2 rounded bg-black/50 border border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Announcements Unlock Code</label>
          <input
            type="text"
            value={codes.announcementsUnlock}
            onChange={(e) => setCodes({ ...codes, announcementsUnlock: e.target.value })}
            className="w-full p-2 rounded bg-black/50 border border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Reports Unlock Code</label>
          <input
            type="text"
            value={codes.reportsUnlock}
            onChange={(e) => setCodes({ ...codes, reportsUnlock: e.target.value })}
            className="w-full p-2 rounded bg-black/50 border border-gray-600 text-white"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 bg-red-700 rounded hover:bg-red-600"
        >
          Save Codes
        </button>
      </div>
    </main>
  );
}
