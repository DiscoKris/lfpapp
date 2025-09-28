"use client";

import { useState } from "react";

type Contact = {
  role: string;
  name: string;
  phone: string;
};

type FileDoc = {
  id: number;
  name: string;
  url: string;
};

export default function AdminContactsPage() {
  const [selectedShow, setSelectedShow] = useState("Peter Pan");
  const [contacts, setContacts] = useState<Contact[]>([
    { role: "Stage Manager", name: "", phone: "" },
    { role: "ASM", name: "", phone: "" },
    { role: "Company Manager", name: "", phone: "" },
    { role: "Producer", name: "", phone: "" },
    { role: "Theatre", name: "", phone: "" },
  ]);

  const [documents, setDocuments] = useState<FileDoc[]>([]);
  const [fileCounter, setFileCounter] = useState(1);

  const handleContactChange = (
    index: number,
    field: keyof Contact,
    value: string
  ) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFile = e.target.files[0];
      const newDoc: FileDoc = {
        id: fileCounter,
        name: newFile.name,
        url: URL.createObjectURL(newFile),
      };
      setDocuments((prev) => [...prev, newDoc]);
      setFileCounter(fileCounter + 1);
    }
  };

  const handleDeleteFile = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleSave = () => {
    console.log("Saving contacts:", { selectedShow, contacts, documents });
    alert("Contacts and files saved!");
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
          Admin – Contacts
        </h1>

        {/* Show Selection */}
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

        {/* Key Contacts */}
        <h2 className="text-lg font-semibold mb-4">Key Contacts</h2>
        <div className="space-y-3 mb-6">
          {contacts.map((contact, index) => (
            <div
              key={contact.role}
              className="flex flex-col gap-2 bg-black/40 p-3 rounded-lg"
            >
              <p className="font-medium">{contact.role}</p>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) =>
                    handleContactChange(index, "name", e.target.value)
                  }
                  className="flex-1 min-w-0 rounded px-2 py-1 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                />

                <input
                  type="text"
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) =>
                    handleContactChange(index, "phone", e.target.value)
                  }
                  className="w-28 rounded px-2 py-1 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Contact Sheets Upload */}
        <h2 className="text-lg font-semibold mb-2">Contact Sheets (PDF)</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="mb-4 text-white"
        />

        {/* List of Uploaded Files */}
        <div className="space-y-2 mb-6">
          {documents.length === 0 && (
            <p className="text-sm opacity-70">No contact sheets uploaded yet.</p>
          )}
          {documents.map((doc) => (
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
                onClick={() => handleDeleteFile(doc.id)}
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
          Save Contacts
        </button>
      </div>
    </main>
  );
}
