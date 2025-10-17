"use client";

import { useState, useEffect } from "react";
import AdminShowSelect from "@/components/AdminShowSelect";
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

type Announcements = {
  id: string;
  message: string;
  createdAt?: any;
  createdAtClient?: any;
  showId: string;
};

export default function AdminAnnouncementsPage() {
  const [selectedShow, setSelectedShow] = useState("");
  const [announcements, setAnnouncements] = useState<Announcements[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [status, setStatus] = useState("");

  // 🔥 Fetch announcements for selected show
  useEffect(() => {
    if (!selectedShow) return;
    const q = query(
      collection(db, "announcements"),
      where("showId", "==", selectedShow),
      orderBy("createdAtClient", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setAnnouncements(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Announcements, "id">),
        }))
      );
    });
    return () => unsub();
  }, [selectedShow]);

  // 📝 Post new announcement
  const handlePost = async () => {
    if (!selectedShow || !newMsg.trim()) {
      setStatus("⚠️ Please select a show and enter a message.");
      return;
    }

    try {
      await addDoc(collection(db, "announcements"), {
        message: newMsg,
        showId: selectedShow,
        createdAt: serverTimestamp(),
        createdAtClient: new Date().toISOString(),
      });
      setNewMsg("");
      setStatus("✅ Announcement posted successfully!");
    } catch (err) {
      console.error("❌ Error posting announcement:", err);
      setStatus("❌ Error posting announcement.");
    }
  };

  // 🗑️ Delete announcement
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      setStatus("🗑️ Announcement deleted.");
    } catch (err) {
      console.error("❌ Error deleting announcement:", err);
      setStatus("❌ Error deleting announcement.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Admin – Announcements
      </h1>

      {/* Show selector */}
      <AdminShowSelect onSelect={setSelectedShow} />

      {selectedShow && (
        <div className="bg-black/50 p-6 rounded-xl shadow-lg mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Manage Announcements for {selectedShow.toUpperCase()}
          </h2>

          {/* Post new announcement */}
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your announcement..."
            className="w-full p-3 rounded text-black mb-3 text-sm"
            rows={2}
          />
          <button
            onClick={handlePost}
            className="px-6 py-2 bg-green-700 hover:bg-green-600 rounded font-semibold"
          >
            Post Announcement
          </button>

          {status && <p className="mt-3 text-sm">{status}</p>}

          {/* List existing announcements */}
          <div className="mt-6 space-y-3">
            {announcements.length === 0 && (
              <p className="text-sm opacity-70">No announcements yet.</p>
            )}
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex flex-col bg-black/40 p-3 rounded-lg border border-gray-700"
              >
                <p className="text-sm mb-2">{a.message}</p>
                <p className="text-xs text-gray-400 mb-2">
                  {a.createdAt?.toDate
                    ? a.createdAt.toDate().toLocaleString()
                    : a.createdAtClient
                    ? new Date(a.createdAtClient).toLocaleString()
                    : "Just now"}
                </p>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="self-start text-xs bg-red-700 hover:bg-red-600 px-3 py-1 rounded font-semibold"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
