"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Create account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save extra data (city) to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email,
        city,
        createdAt: serverTimestamp(),
      });

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

      {/* Register form */}
      <form
        onSubmit={handleRegister}
        className="relative z-10 w-full max-w-sm mb-28 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-white">Are you ready for some fun?</h2>

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

        <input
          type="text"
          placeholder="City"
          className="w-full rounded-lg p-3 bg-white/90 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-red-800 text-white font-semibold hover:bg-red-700 transition shadow-md"
        >
          Create Account
        </button>

        <p className="text-sm text-center text-white">
          Already have an account?{" "}
          <a href="/" className="underline">
            Login
          </a>
        </p>
      </form>

      {/* Staff link */}
      <div className="relative z-10 mb-8 text-white text-sm opacity-80">
        Staff?{" "}
        <a href="/staff-gate" className="underline font-medium">
          Tap here
        </a>
      </div>
    </main>
  );
}
