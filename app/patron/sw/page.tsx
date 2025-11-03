"use client";
import { useEffect } from "react";
import { auth } from "../../../lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Tile from "../../../components/Tile";
import Image from "next/image";

export default function SnowWhitePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/"); // redirect to login if not logged in
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black text-white px-6 py-10 flex flex-col items-center">
      {/* Logo + City */}
      <div className="flex flex-col items-center mb-8">
        <Image
          src="/sw_logo.png"
          alt="A Snow White Christmas"
          width={300}
          height={300}
          className="object-contain mb-2 drop-shadow-lg"
        />
        <p className="text-lg font-medium">Laguna Playhouse</p>
      </div>

      {/* Dashboard Heading */}
      <h1 className="text-2xl font-bold text-center mb-8">Dashboard</h1>

      {/* Tiles Grid */}
      <div className="grid grid-cols-2 gap-6 max-w-md w-full">
        <Tile title="Program" emoji="🎭" href="/patron/sw/program" />
        <Tile title="Camera" emoji="📸" href="/patron/sw/camera" />
        <Tile title="Games" emoji="🎮" href="/patron/sw/games" />
        <Tile title="Store" emoji="🛍️" href="/patron/sw/store" />
        <Tile title="Social" emoji="💬" href="/patron/sw/social" />
        <Tile title="Shows" emoji="🎟️" href="/patron/sw/shows" />
      </div>
    </main>
  );
}
