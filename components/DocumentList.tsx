"use client";

import { useState } from "react";
import Image from "next/image";

type Document = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

type Props = {
  title: string;
  documents: Document[];
};

export default function DocumentList({ title, documents }: Props) {
  const [docs] = useState<Document[]>(documents);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-8">{title}</h1>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-gray-700 shadow-md"
          >
            {/* Left side: icon + name */}
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

            {/* Right side: menu button */}
            <button className="p-2 hover:bg-white/10 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
