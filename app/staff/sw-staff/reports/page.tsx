"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";

type Report = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

const sampleReports: Report[] = [
  {
    id: "1",
    name: "Report – Sept 15",
    url: "/docs/sw-report-sept15.pdf",
    uploadedAt: "2025-09-15",
  },
];

export default function ReportsPage() {
  const [reports] = useState<Report[]>(sampleReports);
  const [code, setCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [canUpload, setCanUpload] = useState(false);
  const [message, setMessage] = useState("");

  const handleCodeSubmit = () => {
    if (code === "5678") {
      setCanUpload(true);
      setCode("");
      setMessage("");
    } else {
      setMessage("❌ Wrong code");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const storageRef = ref(storage, `sw-reports/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "sw-reports"), {
        name: file.name,
        url,
        uploadedAt: serverTimestamp(),
      });

      setMessage("✅ Report uploaded successfully!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Reports – Snow White</h1>

      {/* Unlock + Upload (compact version) */}
      <div className="max-w-md mx-auto bg-black/40 p-3 rounded-lg border border-gray-700 mb-6">
        {!canUpload ? (
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-2 rounded text-black text-sm"
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
          <div className="flex flex-col gap-2">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <button
              onClick={handleUpload}
              className="w-full bg-green-700 py-2 rounded hover:bg-green-600 text-sm"
            >
              Upload Report
            </button>
            {message && <p className="text-sm mt-1">{message}</p>}
          </div>
        )}
      </div>

      {/* Existing Reports */}
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700 shadow-md"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/pdf-image.png"
                alt="PDF"
                width={32}
                height={32}
                className="object-contain"
              />
              <div>
                <p className="font-medium">{report.name}</p>
                <p className="text-xs text-gray-400">
                  Uploaded: {report.uploadedAt}
                </p>
              </div>
            </div>
            <a
              href={report.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-red-700 rounded text-sm hover:bg-red-600"
            >
              View
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
