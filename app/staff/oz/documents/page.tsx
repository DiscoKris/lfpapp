"use client";

import { useEffect, useState } from "react";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseConfig";
import DocumentList from "@/components/DocumentList";

type Document = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const folderRef = ref(storage, "staff/oz/documents");
        const res = await listAll(folderRef);

        const files = await Promise.all(
          res.items.map(async (itemRef) => ({
            id: itemRef.name,
            name: itemRef.name,
            url: await getDownloadURL(itemRef),
            uploadedAt: new Date().toLocaleDateString(), // simple placeholder
          }))
        );

        setDocs(files);
      } catch (err) {
        console.error("Error loading documents:", err);
      }
    }

    fetchDocuments();
  }, []);

  return (
    <DocumentList
      title="A Snow White Christmas – Documents"
      documents={docs}
    />
  );
}
