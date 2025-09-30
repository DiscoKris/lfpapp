"use client";

import DocumentList from "@/components/DocumentList";

const mockTech = [
  {
    id: "1",
    name: "Lighting Plot",
    url: "/docs/sw-lighting.pdf",
    uploadedAt: "2025-09-12",
  },
  {
    id: "2",
    name: "Sound Cues",
    url: "/docs/sw-sound.pdf",
    uploadedAt: "2025-09-14",
  },
];

export default function TechnicalPage() {
  return (
    <DocumentList
      title="A Snow White Christmas – Technical"
      documents={mockTech}
    />
  );
}
