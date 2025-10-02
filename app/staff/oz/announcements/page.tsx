"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

type Announcement = {
  id: string;
  message: string;
  createdAt: any;
  showId: string;
};

function renderMessage(msg: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return msg.split(urlRegex).map((part, i) =>
    urlRegex.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-red-400 underline hover:text-red-300"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

export default function AnnouncementsPage() {
  const showId = "oz"; // 🔥 static for Snow White

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [code, setCode] = useState("");
  const [canPost, setCanPost] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "announcements"),
      where("showId", "==", showId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Announcement, "id">),
      }));
      setAnnouncements(docs as Announcement[]);
    });
    return () => unsub();
  }, []);

  const handleCodeSubmit = () => {
    if (code === "5678") {
      setCanPost(true);
      setCode("");
    } else {
      alert("❌ Wrong code");
    }
  };

  const handlePost = async () => {
    if (!newMsg.trim()) return;
    await addDoc(collection(db, "announcements"), {
      message: newMsg,
      createdAt: serverTimestamp(),
      showId,
    });
    setNewMsg("");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Announcements – The Winter of Oz
      </h1>

      <div className="max-w-md mx-auto bg-black/40 p-3 rounded-lg border border-gray-700 mb-6">
        {!canPost ? (
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-2 rounded text-white text-sm"
              placeholder="Enter code"
            />
            <button
              onClick={handleCodeSubmit}
              className="bg-red-700 px-3 py-2 rounded text-sm hover:bg-red-600"
            >
              Unlock
            </button>
          </div>
        ) : (
          <div>
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type your announcement..."
              className="w-full p-2 rounded text-white text-sm mb-2"
              rows={2}
            />
            <button
              onClick={handlePost}
              className="w-full bg-green-700 py-2 rounded hover:bg-green-600 text-sm"
            >
              Post Announcement
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-black/40 p-4 rounded-lg border border-gray-700"
          >
            <p className="text-sm">{renderMessage(a.message)}</p>
            <p className="text-xs text-gray-400 mt-2">
              {a.createdAt?.toDate
                ? a.createdAt.toDate().toLocaleString()
                : "…"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
