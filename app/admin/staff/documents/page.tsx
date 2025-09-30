"use client";

import { useState } from "react";
import AdminShowSelect from "../../../../components/AdminShowSelect";

type Document = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export default function AdminDocumentsPage() {
  const [selectedShow, setSelectedShow] = useState("");
  const [docs, setDocs] = useState<Document[]>([]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file), // ⚡ placeholder until Firebase hookup
      uploadedAt: new Date().toLocaleDateString(),
    };

    setDocs([...docs, newDoc]);
  }

  function handleDelete(id: string) {
    setDocs((prev) => prev.filter((doc) => doc.id !== id));
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Admin – Documents</h1>

      {/* Show Dropdown */}
      <AdminShowSelect onSelect={setSelectedShow} />

      {selectedShow && (
        <div className="bg-black/50 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">
            Upload Documents for {selectedShow}
          </h2>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="w-full mb-4"
          />

          {/* Documents List */}
          {docs.length > 0 ? (
            <ul className="space-y-3">
              {docs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black/40 p-3 rounded-lg"
                >
                  {/* Doc Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs opacity-70">
                      Uploaded {doc.uploadedAt}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-red-700 rounded text-sm hover:bg-red-600"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-3 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-70">No documents uploaded yet.</p>
          )}
        </div>
      )}
    </main>
  );
}
