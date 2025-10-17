"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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
  const [status, setStatus] = useState("");

  // 🧭 Load existing contact PDFs in real time
  useEffect(() => {
    if (!selectedShow) return;
    const q = query(collection(db, "contactDocs"), where("showId", "==", selectedShow));
    const unsub = onSnapshot(q, (snapshot) => {
      setDocuments(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<FileDoc, "id">),
        }))
      );
    });
    return () => unsub();
  }, [selectedShow]);

  // 🧭 Load existing contacts from Firestore
  useEffect(() => {
    if (!selectedShow) return;
    const fetchContacts = async () => {
      const q = query(collection(db, "contacts"), where("showId", "==", selectedShow));
      const snapshot = await getDocs(q);

      // Keep base structure with empty fields, but merge data
      const defaultContacts = [
        { role: "Stage Manager", name: "", phone: "" },
        { role: "ASM", name: "", phone: "" },
        { role: "Company Manager", name: "", phone: "" },
        { role: "Producer", name: "", phone: "" },
        { role: "Theatre", name: "", phone: "" },
      ];

      snapshot.forEach((d) => {
        const data = d.data() as Contact;
        const i = defaultContacts.findIndex((c) => c.role === data.role);
        if (i !== -1) defaultContacts[i] = { ...defaultContacts[i], ...data };
      });

      setContacts(defaultContacts);
    };
    fetchContacts();
  }, [selectedShow]);

  // ✏️ Handle input edits
  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  // 📄 Upload PDF
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      alert("Only PDF files allowed.");
      return;
    }

    setUploading(true);
    try {
      const storagePath = `staff/${selectedShow}/contactDocs/${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const docRef = await addDoc(collection(db, "contactDocs"), {
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
        showId: selectedShow,
      });

      setDocuments((prev) => [
        ...prev,
        {
          id: docRef.id,
          name: file.name,
          url,
          uploadedAt: new Date().toISOString(),
          showId: selectedShow,
        },
      ]);
      setStatus("✅ File uploaded successfully!");
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert("Error uploading file — check console");
    }
    setUploading(false);
  };

  // 🗑️ Delete PDF safely
  const handleDeleteFile = async (id: string, fileName: string) => {
    try {
      const storagePath = `staff/${selectedShow}/contactDocs/${fileName}`;
      const storageRef = ref(storage, storagePath);

      await deleteObject(storageRef).catch((err: any) => {
        if (err.code === "storage/object-not-found") {
          console.warn("⚠️ File missing in Storage — skipping delete.");
        } else throw err;
      });

      await deleteDoc(doc(db, "contactDocs", id));
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setStatus("🗑️ File deleted successfully!");
    } catch (err) {
      console.error("❌ Delete error:", err);
      setStatus("❌ Error deleting file.");
    }
  };

  // 💾 Save contacts (non-destructive)
  const handleSave = async () => {
    try {
      for (const c of contacts) {
        const contactRef = doc(db, "contacts", `${selectedShow}_${c.role.replace(/\s+/g, "_")}`);
        await setDoc(contactRef, {
          role: c.role,
          name: c.name,
          phone: c.phone,
          showId: selectedShow,
        });
      }
      alert("✅ Contacts saved successfully!");
    } catch (err) {
      console.error("❌ Error saving contacts:", err);
      alert("Error saving contacts — check console");
    }
  };

  return (
    <main
      className="relative min-h-screen flex flex-col justify-start items-center px-6 py-10 bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 w-full max-w-md mx-auto text-white">
        <h1 className="text-2xl font-bold text-center mb-8 drop-shadow-lg">
          Admin – Contacts
        </h1>

        {/* Show Select */}
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

        {/* Contacts */}
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
                  onChange={(e) => handleContactChange(index, "name", e.target.value)}
                  className="flex-1 rounded px-2 py-1 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                  className="w-32 rounded px-2 py-1 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Contact Sheet Uploads */}
        <h2 className="text-lg font-semibold mb-2">Contact Sheets (PDF)</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          disabled={uploading}
          className="mb-4 text-white"
        />
        {status && <p className="text-sm mb-3">{status}</p>}

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
                onClick={() => handleDeleteFile(doc.id, doc.name)}
                className="text-red-400 hover:text-red-600 text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Save */}
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
