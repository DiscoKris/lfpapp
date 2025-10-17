"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Tile from "../../../components/Tile";
import Image from "next/image";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

export default function SnowWhiteStaffPage() {
  const router = useRouter();
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);

  useEffect(() => {
    // ✅ Optional auth check
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log("Staff SW Auth check:", user ? "Logged in" : "Not logged in");
    });

    // 🔥 Listen to the latest Snow White announcement
    const q = query(
      collection(db, "announcements"),
      where("showId", "==", "sw"),
      orderBy("createdAtClient", "desc")
    );

    const unsubAnnouncements = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latest = snapshot.docs[0].data() as any;
        const latestTime = new Date(latest.createdAtClient).getTime();

        const lastViewed = localStorage.getItem("lastViewedAnnouncements_sw");
        const lastViewedTime = lastViewed ? new Date(lastViewed).getTime() : 0;

        // Compare latest post to last viewed timestamp
        if (latestTime > lastViewedTime) {
          setHasNewAnnouncement(true);
        } else {
          setHasNewAnnouncement(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubAnnouncements();
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10 flex flex-col items-center">
      {/* Logo + City */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/sw_logo.png"
          alt="A Snow White Christmas"
          width={180}
          height={100}
          className="object-contain mb-2 drop-shadow-lg"
        />
        <p className="text-lg font-medium">Laguna Playhouse</p>
      </div>

      {/* Dashboard Heading */}
      <h1 className="text-2xl font-bold text-center mb-8">Staff Dashboard</h1>

      {/* Tiles Grid */}
      <div className="grid grid-cols-2 gap-6 max-w-md w-full">
        <Tile title="Schedules" emoji="📅" href="/staff/sw/schedules" />
        <Tile
          title="Announcements"
          emoji="📢"
          href="/staff/sw/announcements"
          showNew={hasNewAnnouncement}
        />
        <Tile title="Documents" emoji="📄" href="/staff/sw/documents" />
        <Tile title="Contacts" emoji="📇" href="/staff/sw/contacts" />
        <Tile title="Technical" emoji="⚙️" href="/staff/sw/technical" />
        <Tile title="Stage Reports" emoji="📝" href="/staff/sw/reports" />
      </div>
    </main>
  );
}
