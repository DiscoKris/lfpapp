"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const SHOW_ID = "sw"; // 👈 change this to "snow" or your show’s ID when duplicating

export default function ProgramPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "no-program" | "error">("loading");
  const [programUrl, setProgramUrl] = useState<string>("");

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const snap = await getDoc(doc(db, "shows", SHOW_ID));
        if (!snap.exists()) {
          setStatus("error");
          return;
        }
        const url = (snap.data().programUrl as string) || "";
        if (!url) {
          setStatus("no-program");
          return;
        }

        setProgramUrl(url);

        // Try to open automatically in a new tab or native viewer
        try {
          window.location.assign(url);
        } catch {
          // If blocked, user can click manually
        }
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    loadProgram();
  }, []);

  // ----- RENDER -----
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Opening program…</p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center text-center p-6">
        <div>
          <p className="mb-4">Unable to load program information.</p>
          <a href={`/patron/${SHOW_ID}/dashboard`} className="underline">
            ← Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  if (status === "no-program") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center text-center p-6">
        <div>
          <p className="mb-4">No program uploaded yet for this show.</p>
          <a
            href={`/patron/${SHOW_ID}/dashboard`}
            className="inline-block px-4 py-2 bg-red-700 hover:bg-red-600 rounded-xl font-semibold"
          >
            ← Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  // ----- READY -----
  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-sm mx-auto text-center">
        {/* Back button */}
        <a
          href={`/patron/${SHOW_ID}/dashboard`}
          className="inline-block mb-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-xl font-semibold text-white"
        >
          ← Back to Dashboard
        </a>

        <h1 className="text-xl font-semibold mb-4">Program</h1>

        {/* Manual open button */}
        <a
          href={programUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-white text-black rounded-xl font-semibold"
        >
          Open Program PDF
        </a>

        {/* Inline PDF preview fallback */}
        <div className="mt-6 bg-white rounded-xl overflow-hidden">
          <iframe
            title="Program"
            src={programUrl}
            className="w-full"
            style={{ height: "70vh" }}
          />
        </div>
      </div>
    </main>
  );
}
