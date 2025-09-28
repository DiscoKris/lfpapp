"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

type Show = {
  id: string;
  name: string;
  logo: string;
  city: string;
  status: "active" | "inactive";
  order: number;
};

const shows: Show[] = [
  { id: "oz", name: "The Winter of Oz", logo: "oz_logo.png", city: "Thousand Oaks", status: "active", order: 1 },
  { id: "sw", name: "A Snow White Christmas", logo: "sw_logo.png", city: "Laguna Playhouse", status: "active", order: 2 },
  { id: "aladdin", name: "Aladdin", logo: "al_logo.png", city: "Los Angeles", status: "inactive", order: 3 },
  { id: "peter-pan", name: "Peter Pan", logo: "pp_logo.png", city: "San Diego", status: "inactive", order: 4 },
  { id: "cinderella", name: "Cinderella", logo: "cin_logo.png", city: "Orange County", status: "inactive", order: 5 },
  { id: "sleeping-beauty", name: "Sleeping Beauty", logo: "sb_logo.png", city: "Sacramento", status: "inactive", order: 6 },
];

export default function StaffSelectShowPage() {
  const [showTopFade, setShowTopFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      // ✅ Add null check here
      if (el) {
        setShowTopFade(el.scrollTop > 0);
      }
    }

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const sortedShows = [...shows].sort((a, b) => a.order - b.order);

  return (
    <main
      className="relative min-h-screen flex flex-col justify-center items-center px-4 bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/5" />

      {/* Container */}
      <div className="relative z-10 w-full max-w-md mx-auto text-white flex flex-col h-screen">
        {/* Logo */}
        <div className="flex justify-center mt-6 mb-4">
          <Image
            src="/lfp-logo.png"
            alt="Lythgoe Family Productions"
            width={160}
            height={50}
            priority
            className="drop-shadow-md"
          />
        </div>

        {/* Heading */}
        <h1 className="text-lg font-bold text-center mb-4">
          Select Your Show (Staff)
        </h1>

        {/* Scrollable grid */}
        <div ref={scrollRef} className="relative flex-1 overflow-y-auto pb-6">
          <div className="grid grid-cols-2 gap-4">
            {sortedShows.map((show) => (
              <Link
                key={show.id}
                href={`/staff/${show.id}`}
                className={`flex flex-col items-center justify-between h-36 p-3 border-2 rounded-xl shadow-lg transition ${
                  show.status === "inactive"
                    ? "opacity-40 pointer-events-none border-gray-500"
                    : "hover:scale-105 border-red-500"
                } bg-black/40`}
              >
                {/* Centered logo */}
                <div className="flex-grow flex items-center justify-center">
                  <Image
                    src={`/${show.logo}`}
                    alt={show.name}
                    width={100}
                    height={70}
                    className="object-contain"
                  />
                </div>

                {/* City anchored at bottom */}
                <p className="text-xs font-medium mt-2">{show.city}</p>
              </Link>
            ))}
          </div>

          {/* Scroll fades */}
          {showTopFade && (
            <div className="absolute top-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-b from-black/70 to-transparent" />
          )}
          <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* Inventory button */}
        <div className="mt-4 mb-6 flex justify-center">
          <Link
            href="/staff/inventory"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-white font-semibold shadow-md hover:from-red-600 hover:to-red-400 transition"
          >
            LFP INVENTORY
          </Link>
        </div>
      </div>
    </main>
  );
}
