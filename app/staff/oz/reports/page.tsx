"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

type ReportDoc = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  showId: string;
};

export default function ReportsPage() {
  const showId = "oz"; // 👈 per show
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [code, setCode] = useState("");
  const [canPost, setCanPost] = useState(false);

  // 🔥 Listen for reports
  useEffect(() => {
    const q = query(collection(db, "reports"), where("showId", "==", showId));
    const unsub = onSnapshot(q, (snapshot) => {
      setReports(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as Omit<ReportDoc, "id">;
          return { ...data, id: docSnap.id };
        })
      );
    });
    return () => unsub();
  }, [showId]);

  const handleCodeSubmit = () => {
    if (code === "5678") {
      setCanPost(true);
      setCode("");
    } else {
      alert("❌ Wrong code");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("⚠️ Please select a file.");
      return;
    }
    try {
      const storageRef = ref(storage, `staff/${showId}/reports/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "reports"), {
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
        showId,
      });

      setStatus("✅ Report uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setStatus("❌ Error uploading report.");
    }
  };

  const handleDelete = async (report: ReportDoc) => {
    try {
      // Delete from Storage
      const storageRef = ref(storage, `staff/${showId}/reports/${report.name}`);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, "reports", report.id));

      setStatus("🗑️ Report deleted.");
    } catch (err) {
      console.error("❌ Error deleting report:", err);
      setStatus("❌ Error deleting report.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Reports – The Winter of Oz
      </h1>

      {/* Upload (code protected) */}
      <div className="max-w-md mx-auto bg-black/40 p-3 rounded-lg border border-gray-700 mb-6">
        {!canPost ? (
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-2 rounded text-white text-sm"
              placeholder="Enter code"
            />
            <button
              onClick={handleCodeSubmit}
              className="bg-red-700 px-3 py-2 rounded text-sm hover:bg-red-600"
            >
              Unlock
            </button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full mb-2 text-sm"
            />
            <button
              onClick={handleUpload}
              className="w-full bg-green-700 py-2 rounded hover:bg-green-600 text-sm"
            >
              Upload Report
            </button>
            {status && <p className="mt-2 text-xs">{status}</p>}
          </div>
        )}
      </div>

      {/* List of Reports */}
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {reports.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">
            No reports uploaded yet.
          </p>
        ) : (
          reports.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700 shadow-md"
            >
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-gray-400">
                  Uploaded: {new Date(r.uploadedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-red-700 rounded text-sm hover:bg-red-600"
                >
                  View
                </a>
                {canPost && (
                  <button
                    onClick={() => handleDelete(r)}
                    className="px-3 py-1 bg-gray-700 rounded text-sm hover:bg-gray-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
