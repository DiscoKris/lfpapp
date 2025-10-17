"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

type Announcement = {
  id: string;
  message: string;
  createdAt?: any;
  createdAtClient?: any;
  showId: string;
};

// 🔗 Turns URLs in messages into clickable links
function renderMessage(msg: string) {
  const urlRegex = /((https?:\/\/[^\s]+)|(www\.[^\s]+))/g;
  return msg.split(urlRegex).map((part, i) => {
    if (!part) return null;
    if (urlRegex.test(part)) {
      const href = part.startsWith("www.") ? `https://${part}` : part;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-400 underline hover:text-red-300"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function AnnouncementsPage() {
  const showId = "sw"; // 👈 Snow White show ID

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [code, setCode] = useState("");
  const [canPost, setCanPost] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  // 🔥 Fetch announcements live + mark as viewed
  useEffect(() => {
    let q;
    try {
      q = query(
        collection(db, "announcements"),
        where("showId", "==", showId),
        orderBy("createdAtClient", "desc")
      );
    } catch {
      q = query(collection(db, "announcements"), where("showId", "==", showId));
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Announcement, "id">),
      }));
      setAnnouncements(docs as Announcement[]);

      // ✅ Update localStorage so “NEW” badge disappears immediately
      localStorage.setItem(`lastViewedAnnouncements_${showId}`, new Date().toISOString());
    });

    return () => unsub();
  }, [showId]);

  // 🔓 Unlock posting
  const handleCodeSubmit = () => {
    if (code === "5678") {
      setCanPost(true);
      setCode("");
    } else {
      alert("❌ Wrong code");
    }
  };

  // 📝 Post new announcement
  const handlePost = async () => {
    if (!newMsg.trim()) return;
    try {
      await addDoc(collection(db, "announcements"), {
        message: newMsg,
        createdAt: serverTimestamp(),
        createdAtClient: new Date().toISOString(),
        showId,
      });
      setNewMsg("");
    } catch (err) {
      console.error("❌ Error posting announcement:", err);
      alert("Error posting announcement.");
    }
  };

  // 🗑️ Delete announcement
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("❌ Error deleting:", err);
      alert("Error deleting announcement.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Announcements – A Snow White Christmas
      </h1>

      {/* Unlock + Post Section */}
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
              className="w-full bg-green-700 py-2 rounded hover:bg-green-600 text-sm mb-2"
            >
              Post Announcement
            </button>
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-4 max-w-md mx-auto">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-black/40 p-4 rounded-lg border border-gray-700"
          >
            <p className="text-sm break-words">{renderMessage(a.message)}</p>
            <p className="text-xs text-gray-400 mt-2">
              {a.createdAt?.toDate
                ? a.createdAt.toDate().toLocaleString()
                : a.createdAtClient
                ? new Date(a.createdAtClient).toLocaleString()
                : "Just now"}
            </p>

            {canPost && (
              <button
                onClick={() => handleDelete(a.id)}
                className="mt-3 w-full bg-red-700 hover:bg-red-600 text-sm py-1 rounded"
              >
                🗑️ Delete this announcement
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
