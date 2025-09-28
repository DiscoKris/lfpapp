"use client";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/patron")}
      className="mt-6 px-4 py-2 rounded-lg bg-red-800 text-white font-semibold hover:bg-red-700 transition shadow-md"
    >
      ← Back to Dashboard
    </button>
  );
}
