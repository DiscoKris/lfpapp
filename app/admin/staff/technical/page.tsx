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

const pageType = "technical"; // used for consistency

export default function AdminTechnicalPage() {
  const [selectedShow, setSelectedShow] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [files, setFiles] = useState<FileDoc[]>([]);
  const [uploading, setUploading] = useState(false);

  // Auto-clear status
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 3000);
    return () => clearTimeout(t);
  }, [status]);

  // Fetch technical docs for selected show
  useEffect(() => {
    if (!selectedShow) return;
    const q = query(collection(db, pageType), where("showId", "==", selectedShow));
    const unsub = onSnapshot(q, (snapshot) => {
      setFiles(
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

    if (file.type !== "application/pdf") {
      setStatus("❌ Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    try {
      const storagePath = `staff/${selectedShow}/${pageType}/${file.name}`;
      const storageRef = ref(storage, storagePath);
      console.log("[UPLOAD] →", storagePath);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, pageType), {
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
        showId: selectedShow,
      });

      setStatus("✅ File uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setStatus("❌ Error uploading file.");
    }
    setUploading(false);
  };

  const handleDelete = async (docId: string, fileName: string) => {
    try {
      // ensure .pdf extension exists in path
      let storagePath = `staff/${selectedShow}/${pageType}/${fileName}`;
      if (!fileName.toLowerCase().endsWith(".pdf")) {
        storagePath += ".pdf";
      }

      const storageRef = ref(storage, storagePath);
      console.log("[DELETE] →", storagePath);

      // try deleting file; if missing, still remove Firestore doc
      await deleteObject(storageRef).catch((err: any) => {
        if (err.code === "storage/object-not-found") {
          console.warn("⚠️ File not found in Storage, skipping delete.");
        } else {
          throw err;
        }
      });

      // delete Firestore record regardless
      await deleteDoc(doc(db, pageType, docId));

      setStatus("🗑️ File deleted successfully!");
    } catch (err) {
      console.error("❌ Delete error:", err);
      setStatus("❌ Error deleting file. Check console for details.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Technical</h1>

      {/* Show Selector */}
      <AdminShowSelect onSelect={setSelectedShow} />

      {selectedShow && (
        <div className="bg-black/50 p-6 rounded-xl shadow-lg mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Upload Technical Docs for {selectedShow.toUpperCase()}
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

          {/* Uploaded files */}
          <div className="mt-6 space-y-3">
            {files.length === 0 && (
              <p className="text-sm opacity-70">No technical files uploaded yet.</p>
            )}
            {files.map((f) => (
              <div
                key={f.id}
                className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-gray-700"
              >
                <div>
                  <p className="font-medium">{f.name}</p>
                  <p className="text-xs text-gray-400">
                    Uploaded: {new Date(f.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-700 rounded text-sm hover:bg-green-600"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(f.id, f.name)}
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
