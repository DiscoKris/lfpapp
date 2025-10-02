"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Image from "next/image";

type KeyContact = {
  id: string;
  role: string;
  name: string;
  phone: string;   // stored as +15551112222 ideally
  showId: string;
};

type ContactDoc = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  showId: string;
};

function formatPhone(phone?: string): string {
  if (!phone) return ""; // <- no crash if undefined/null
  if (phone.startsWith("+1") && phone.length === 12) {
    return `(${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
  }
  return phone;
}

export default function ContactsPage() {
  const showId = "oz"; // 👈 change per show

  const [keyContacts, setKeyContacts] = useState<KeyContact[]>([]);
  const [contactDocs, setContactDocs] = useState<ContactDoc[]>([]);

  useEffect(() => {
    // Listen for contacts
    const q1 = query(collection(db, "contacts"), where("showId", "==", showId));
    const unsub1 = onSnapshot(q1, (snapshot) => {
      setKeyContacts(
        snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<KeyContact, "id">;
          return { ...data, id: doc.id };
        })
      );
    });

    // Listen for contact PDFs
    const q2 = query(collection(db, "contactDocs"), where("showId", "==", showId));
    const unsub2 = onSnapshot(q2, (snapshot) => {
      setContactDocs(
        snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<ContactDoc, "id">;
          return { ...data, id: doc.id };
        })
      );
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [showId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        The Wonderful Winter of Oz – Contacts
      </h1>

      {/* Key Contacts */}
      <div className="max-w-md mx-auto mb-8 bg-black/40 rounded-lg border border-gray-700 shadow-md p-4 space-y-2">
        {keyContacts.map((c) => (
          <div
            key={c.id}
            className="flex justify-between text-sm border-b border-gray-700 pb-1 last:border-0"
          >
            <span className="font-semibold">{c.role}:</span>
            <span>
              {c.name}{" "}
              <a href={`tel:${c.phone}`} className="text-blue-400 underline">
                {formatPhone(c.phone)}
              </a>
            </span>
          </div>
        ))}
      </div>

      {/* Contact Sheets (PDFs) */}
      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {contactDocs.map((doc) => (
          <div
            key={doc.id}
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
                <p className="font-medium">{doc.name}</p>
                <p className="text-xs text-gray-400">Uploaded: {doc.uploadedAt}</p>
              </div>
            </div>
            <a
              href={doc.url}
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
