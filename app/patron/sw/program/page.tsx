"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const SHOW_ID = "sw25"; // Firestore document id for Snow White
const DASHBOARD_PATH = "/patron/sw/dashboard";

export default function ProgramPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "no-program" | "error">("loading");
  const [programUrl, setProgramUrl] = useState<string>("");

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const snap = await getDoc(doc(db, "shows", SHOW_ID));
        if (!snap.exists()) { setStatus("error"); return; }
        const d = snap.data() as any;
        const url = (d?.programUrl ?? d?.programurl ?? "") as string;
        if (!url) { setStatus("no-program"); return; }
        setProgramUrl(url);
        try { window.location.assign(url); } catch {}
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };
    loadProgram();
  }, []);

  const BackBtn = () => (
    <a
      href={DASHBOARD_PATH}
      className="inline-block mb-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-xl font-semibold text-white"
    >
      ← Back to Dashboard
    </a>
  );

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Opening program…</p>
      </main>
    );
  }

  if (status === "error" || status === "no-program") {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center text-center p-6">
        <div>
          <BackBtn />
          <p className="mt-2">
            {status === "no-program" ? "No program uploaded yet for this show." : "Unable to load program."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-sm mx-auto text-center">
        <BackBtn />
        <h1 className="text-xl font-semibold mb-4">Program</h1>
        <a
          href={programUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-white text-black rounded-xl font-semibold"
        >
          Open Program PDF
        </a>
        <div className="mt-6 bg-white rounded-xl overflow-hidden">
          <iframe title="Program" src={programUrl} className="w-full" style={{ height: "70vh" }} />
        </div>
      </div>
    </main>
  );
}
