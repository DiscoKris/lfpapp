"use client";

import { useEffect } from "react";
import { auth } from "../../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Tile from "../../../components/Tile";
import Image from "next/image";

export default function swStaffPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 🚨 Auth check temporarily disabled for testing
      // if (!user) {
      //   router.push("/"); // redirect to login if not logged in
      // }
      console.log("Staff SW Auth check:", user ? "Logged in" : "Not logged in");
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10 flex flex-col items-center">
      {/* Logo + City */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/sw_logo.png"
          alt="A Snow WHite Christmas"
          width={300}
          height={300}
          className="object-contain mb-2 drop-shadow-lg"
        />
        <p className="text-lg font-medium">The Laguna Playhouse</p>
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
  badgeCount={2} // temporary hardcode until Firestore is hooked up
/>

        <Tile title="Documents" emoji="📄" href="/staff/sw/documents" />
        <Tile title="Contacts" emoji="📇" href="/staff/sw/contacts" />
        <Tile title="Technical" emoji="⚙️" href="/staff/sw/technical" />
        <Tile title="Stage Reports" emoji="📝" href="/staff/sw/reports" />
      </div>
    </main>
  );
}
