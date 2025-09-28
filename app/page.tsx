"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebaseConfig";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import Image from "next/image";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, email, password);

      router.push("/patron");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main
      className="relative min-h-screen flex flex-col justify-between items-center px-6 bg-center bg-no-repeat bg-contain"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Bright overlay */}
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

      {/* Login form */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-sm mb-28 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-white">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg p-3 bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <label className="flex items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Remember me
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-red-800 text-white font-semibold hover:bg-red-700 transition shadow-md"
        >
          Login
        </button>

        <p className="text-sm text-center text-white">
          New here?{" "}
          <a href="/register" className="underline">
            Register
          </a>
        </p>
      </form>

      {/* Staff link */}
      <div className="relative z-10 mb-8 text-white text-sm opacity-80">
        Staff?{" "}
        <a href="/staff" className="underline font-medium">
          Tap here
        </a>
      </div>
    </main>
  );
}
