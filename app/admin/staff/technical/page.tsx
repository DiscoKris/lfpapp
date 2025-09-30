"use client";

import { useState } from "react";

type TechnicalDoc = {
  id: number;
  name: string;
  url: string;
};

export default function AdminTechnicalPage() {
  const [selectedShow, setSelectedShow] = useState("Peter Pan");
  const [docs, setDocs] = useState<TechnicalDoc[]>([]);
  const [counter, setCounter] = useState(1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFile = e.target.files[0];
      const newDoc: TechnicalDoc = {
        id: counter,
        name: newFile.name,
        url: URL.createObjectURL(newFile), // ⚡ placeholder until Firebase integration
      };
      setDocs((prev) => [...prev, newDoc]);
      setCounter(counter + 1);
    }
  };

  const handleDelete = (id: number) => {
    setDocs((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleSave = () => {
    console.log("Saving technical docs:", { selectedShow, docs });
    alert("Technical documents saved!");
  };

  return (
    <main
      className="relative min-h-screen flex flex-col justify-start items-center px-6 py-10 bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Container */}
      <div className="relative z-10 w-full max-w-md mx-auto text-white">
        <h1 className="text-2xl font-bold text-center mb-8 drop-shadow-lg">
          Admin – Technical
        </h1>

        {/* Show Selector */}
        <label className="block mb-2 font-medium">Select Show</label>
        <select
          value={selectedShow}
          onChange={(e) => setSelectedShow(e.target.value)}
          className="w-full mb-6 p-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option>Peter Pan</option>
          <option>Snow White</option>
          <option>Aladdin</option>
          <option>Sleeping Beauty</option>
        </select>

        {/* Upload Technical Docs */}
        <h2 className="text-lg font-semibold mb-2">Upload Technical File (PDF)</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="mb-4 text-white"
        />

        {/* List of Uploaded Files */}
        <div className="space-y-2 mb-6">
          {docs.length === 0 && (
            <p className="text-sm opacity-70">No technical documents uploaded yet.</p>
          )}
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between items-center bg-black/40 p-2 rounded"
            >
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-sm truncate max-w-[70%]"
              >
                {doc.name}
              </a>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-red-400 hover:text-red-600 text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-lg bg-red-700 hover:bg-red-600 transition font-semibold shadow-lg"
        >
          Save Technical Docs
        </button>
      </div>
    </main>
  );
}
