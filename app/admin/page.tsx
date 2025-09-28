"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const q = query(
        collection(db, "admins"),
        where("username", "==", username),
        where("password", "==", password)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err: any) {
      console.error("Login failed:", err); // ✅ See console error
      setError(err.message || "Error logging in"); // ✅ Show full error if available
    }
  }

  return (
    <main
      className="relative min-h-screen flex flex-col justify-center items-center px-6 bg-center bg-no-repeat bg-cover"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Container */}
      <div className="relative z-10 w-full max-w-sm mx-auto text-white">
        <h1 className="text-2xl font-bold text-center mb-6">
          Admin Login
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-black/60 p-6 rounded-xl shadow-lg"
        >
          <input
            type="text"
            placeholder="Username"
            className="w-full rounded-lg p-3 bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg p-3 bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-red-800 text-white font-semibold hover:bg-red-700 transition shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}
