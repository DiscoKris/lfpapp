"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function StaffCodePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === "2525") {
      router.push("/staff/select-show");
    } else {
      setError("Invalid code. Please try again.");
    }
  };

  return (
    <main
      className="relative min-h-screen flex flex-col justify-between items-center px-6 bg-center bg-no-repeat bg-contain"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-white/5" />

      {/* Logo */}
      <div className="relative z-10 mt-12">
        <Image
          src="/lfp-logo.png"
          alt="Lythgoe Family Productions"
          width={300}
          height={300}
          priority
          className="mx-auto drop-shadow-lg"
        />
      </div>

      {/* Code form */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm mb-28 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-white">
          Staff Access
        </h2>

        <input
          type="password"
          placeholder="Enter Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-lg p-3 bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-red-800 text-white font-semibold hover:bg-red-700 transition shadow-md"
        >
          Enter
        </button>
      </form>
    </main>
  );
}
