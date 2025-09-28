"use client";

import Image from "next/image";

type KeyContact = {
  role: string;
  name: string;
  phone: string;
};

const keyContacts: KeyContact[] = [
  { role: "Stage Manager", name: "Alice Brown", phone: "555-111-2222" },
  { role: "ASM", name: "David Green", phone: "555-333-4444" },
  { role: "Company Manager", name: "Sarah Lee", phone: "555-555-6666" },
  { role: "Producer", name: "Kris Lythgoe", phone: "555-777-8888" },
  { role: "Theatre", name: "Laguna Playhouse", phone: "555-999-0000" },
];

const contactDocs = [
  {
    id: "1",
    name: "Snow White Contact Sheet",
    url: "/docs/sw-contacts.pdf",
    uploadedAt: "2025-09-22",
  },
];

export default function ContactsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        A Snow White Christmas – Contacts
      </h1>

      {/* Key Contacts */}
      <div className="max-w-md mx-auto mb-8 bg-black/40 rounded-lg border border-gray-700 shadow-md p-4 space-y-2">
        {keyContacts.map((c, index) => (
          <div
            key={index}
            className="flex justify-between text-sm border-b border-gray-700 pb-1 last:border-0"
          >
            <span className="font-semibold">{c.role}:</span>
            <span>
              {c.name}{" "}
              <a href={`tel:${c.phone}`} className="text-blue-400 underline">
                {c.phone}
              </a>
            </span>
          </div>
        ))}
      </div>

      {/* Full PDF */}
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
                <p className="text-xs text-gray-400">
                  Uploaded: {doc.uploadedAt}
                </p>
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
