"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Tile from "../../../components/Tile";
import Image from "next/image";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

export default function OzStaffPage() {
  const router = useRouter();
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);

  useEffect(() => {
    // ✅ Optional auth check (you can re-enable later if needed)
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log("Staff OZ Auth check:", user ? "Logged in" : "Not logged in");
    });

    // 🔥 Listen to the *latest* announcement for this show
    const q = query(
      collection(db, "announcements"),
      where("showId", "==", "oz"),
      orderBy("createdAtClient", "desc")
    );

    const unsubAnnouncements = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latest = snapshot.docs[0].data() as any;
        const latestTime = new Date(latest.createdAtClient).getTime();

        const lastViewed = localStorage.getItem("lastViewedAnnouncements_oz");
        const lastViewedTime = lastViewed ? new Date(lastViewed).getTime() : 0;

        // If the latest announcement is newer than the last viewed, show “NEW”
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
          src="/oz_logo.png"
          alt="The Wonderful Winter of Oz"
          width={180}
          height={100}
          className="object-contain mb-2 drop-shadow-lg"
        />
        <p className="text-lg font-medium">Thousand Oaks</p>
      </div>

      {/* Dashboard Heading */}
      <h1 className="text-2xl font-bold text-center mb-8">Staff Dashboard</h1>

      {/* Tiles Grid */}
      <div className="grid grid-cols-2 gap-6 max-w-md w-full">
        <Tile title="Schedules" emoji="📅" href="/staff/oz/schedules" />
        <Tile
          title="Announcements"
          emoji="📢"
          href="/staff/oz/announcements"
          showNew={hasNewAnnouncement}
        />
        <Tile title="Documents" emoji="📄" href="/staff/oz/documents" />
        <Tile title="Contacts" emoji="📇" href="/staff/oz/contacts" />
        <Tile title="Technical" emoji="⚙️" href="/staff/oz/technical" />
        <Tile title="Stage Reports" emoji="📝" href="/staff/oz/reports" />
      </div>
    </main>
  );
}