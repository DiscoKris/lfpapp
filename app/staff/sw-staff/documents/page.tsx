"use client";

import DocumentList from "@/components/DocumentList";

const mockDocs = [
  {
    id: "1",
    name: "Snow White Script",
    url: "/docs/sw-script.pdf",
    uploadedAt: "2025-09-18",
  },
  {
    id: "2",
    name: "Rehearsal Pack",
    url: "/docs/sw-pack.pdf",
    uploadedAt: "2025-09-19",
  },
];

export default function DocumentsPage() {
  return (
    <DocumentList
      title="A Snow White Christmas – Documents"
      documents={mockDocs}
    />
  );
}
