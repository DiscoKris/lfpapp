"use client";
import { useState } from "react";
import { auth } from "../lib/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      // “Remember me” means persist session, otherwise clear after tab close
      auth.setPersistence(
        remember
          ? (await import("firebase/auth")).browserLocalPersistence
          : (await import("firebase/auth")).browserSessionPersistence
      );

      router.push("/patron");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/80 backdrop-blur p-6 rounded-xl shadow max-w-sm mx-auto">
      <h2 className="text-xl font-bold text-center">
        {isRegister ? "Register" : "Login"}
      </h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full border rounded p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border rounded p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        Remember me
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" className="w-full bg-black text-white py-2 rounded">
        {isRegister ? "Create Account" : "Login"}
      </button>

      <p className="text-sm text-center">
        {isRegister ? "Already have an account?" : "New here?"}{" "}
        <button
          type="button"
          onClick={() => setIsRegister(!isRegister)}
          className="underline"
        >
          {isRegister ? "Login" : "Register"}
        </button>
      </p>
    </form>
  );
}
