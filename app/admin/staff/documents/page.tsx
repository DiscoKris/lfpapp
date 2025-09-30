"use client";

import { useState } from "react";
import AdminShowSelect from "../../../../components/AdminShowSelect";
import { storage } from "../../../../lib/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminSchedulesPage() {
  const [selectedShow, setSelectedShow] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!selectedShow || !file) {
      setStatus("⚠️ Please select a show and choose a file.");
      return;
    }

    const showId = selectedShow; // e.g. "sw", "oz", "aladdin"
    const storageRef = ref(storage, `staff/${showId}/documents/${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      console.log("✅ File uploaded at:", url);
      setStatus("✅ File uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload error:", err);
      setStatus("❌ Error uploading file.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Documents</h1>

      {/* Show Dropdown */}
      <AdminShowSelect onSelect={setSelectedShow} />

      {selectedShow && (
        <div className="bg-black/50 p-6 rounded-xl shadow-lg mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Upload Documents for {selectedShow.toUpperCase()}
          </h2>

          <input
            type="file"
            accept="application/pdf"
            className="w-full mb-4"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <button
            onClick={handleUpload}
            className="px-6 py-2 bg-red-700 hover:bg-red-600 rounded font-semibold"
          >
            Upload
          </button>

          {status && <p className="mt-4 text-sm">{status}</p>}
        </div>
      )}
    </main>
  );
}
