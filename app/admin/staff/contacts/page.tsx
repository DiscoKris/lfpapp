"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

type Contact = {
  role: string;
  name: string;
  phone: string;
};

type FileDoc = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  showId: string;
};

export default function AdminContactsPage() {
  const [selectedShow, setSelectedShow] = useState("oz");
  const [contacts, setContacts] = useState<Contact[]>([
    { role: "Stage Manager", name: "", phone: "" },
    { role: "ASM", name: "", phone: "" },
    { role: "Company Manager", name: "", phone: "" },
    { role: "Producer", name: "", phone: "" },
    { role: "Theatre", name: "", phone: "" },
  ]);

  const [documents, setDocuments] = useState<FileDoc[]>([]);
  const [uploading, setUploading] = useState(false);

  // 🔧 Handle contact changes
  const handleContactChange = (
    index: number,
    field: keyof Contact,
    value: string
  ) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  // 🔧 Handle file upload to Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      // Upload to Storage
      const storageRef = ref(storage, `contactDocs/${selectedShow}/${file.name}`);
      await uploadBytes(storageRef, file);

      // Get public URL
      const url = await getDownloadURL(storageRef);

      // Save metadata to Firestore
      const docRef = await addDoc(collection(db, "contactDocs"), {
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
        showId: selectedShow,
      });

      setDocuments((prev) => [
        ...prev,
        { id: docRef.id, name: file.name, url, uploadedAt: new Date().toISOString(), showId: selectedShow },
      ]);
    } catch (err) {
      console.error("❌ Error uploading file:", err);
      alert("Error uploading file, check console");
    }

    setUploading(false);
  };

  // 🔧 Delete a file from Firestore
  const handleDeleteFile = async (id: string) => {
    try {
      await deleteDoc(doc(db, "contactDocs", id));
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("❌ Error deleting file:", err);
    }
  };

  // 🔧 Save all contacts to Firestore
  const handleSave = async () => {
    try {
      // First clear old contacts for this show
      const q = query(collection(db, "contacts"), where("showId", "==", selectedShow));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (d) => {
        await deleteDoc(doc(db, "contacts", d.id));
      });

      // Add new contacts
      for (const c of contacts) {
        if (c.name.trim() && c.phone.trim()) {
          await addDoc(collection(db, "contacts"), {
            ...c,
            showId: selectedShow,
          });
        }
      }

      alert("✅ Contacts saved!");
    } catch (err) {
      console.error("❌ Error saving contacts:", err);
      alert("Error saving contacts, check console");
    }
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
          <option value="oz">Oz</option>
          <option value="sw">Snow White</option>
          <option value="aladdin">Aladdin</option>
          <option value="peterpan">Peter Pan</option>
          <option value="sb">Sleeping Beauty</option>
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
                  className="w-32 rounded px-2 py-1 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
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
          disabled={uploading}
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
