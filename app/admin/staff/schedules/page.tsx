"use client";

import { useState, useEffect } from "react";
import AdminShowSelect from "../../../../components/AdminShowSelect";
import { db, storage } from "../../../../lib/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

type FileDoc = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  showId: string;
};

export default function AdminSchedulesPage() {
  const [selectedShow, setSelectedShow] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [schedules, setSchedules] = useState<FileDoc[]>([]);
  const [uploading, setUploading] = useState(false);

  // 🔥 Fetch schedules for selected show
  useEffect(() => {
    if (!selectedShow) return;
    const q = query(collection(db, "schedules"), where("showId", "==", selectedShow));
    const unsub = onSnapshot(q, (snapshot) => {
      setSchedules(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<FileDoc, "id">;
          return { ...data, id: docSnap.id };
        })
      );
    });
    return () => unsub();
  }, [selectedShow]);

  const handleUpload = async () => {
    if (!selectedShow || !file) {
      setStatus("⚠️ Please select a show and choose a file.");
      return;
    }

    setUploading(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `staff/${selectedShow}/schedules/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Add Firestore record
      await addDoc(collection(db, "schedules"), {
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
        showId: selectedShow,
      });

      setStatus("✅ Schedule uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setStatus("❌ Error uploading schedule.");
    }
    setUploading(false);
  };

  const handleDelete = async (docId: string, fileName: string) => {
    try {
      // Delete from Storage
      const storageRef = ref(storage, `staff/${selectedShow}/schedules/${fileName}`);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, "schedules", docId));

      setStatus("🗑️ Schedule deleted successfully!");
    } catch (err) {
      console.error("❌ Delete error:", err);
      setStatus("❌ Error deleting schedule.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Schedules</h1>

      {/* Show Dropdown */}
      <AdminShowSelect onSelect={setSelectedShow} />

      {selectedShow && (
        <div className="bg-black/50 p-6 rounded-xl shadow-lg mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Upload Schedule for {selectedShow.toUpperCase()}
          </h2>

          <input
            type="file"
            accept="application/pdf"
            className="w-full mb-4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-2 bg-red-700 hover:bg-red-600 rounded font-semibold"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {status && <p className="mt-4 text-sm">{status}</p>}

          {/* Uploaded schedules list */}
          <div className="mt-6 space-y-3">
            {schedules.length === 0 && (
              <p className="text-sm opacity-70">No schedules uploaded yet.</p>
            )}
            {schedules.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-gray-700"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-gray-400">
                    Uploaded: {new Date(s.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-700 rounded text-sm hover:bg-green-600"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="px-3 py-1 bg-red-700 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
