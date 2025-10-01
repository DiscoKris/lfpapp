"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/" || pathname === "/login") return null;

  return (
    <button
      onClick={() => router.push("/dashboard")}
      className="flex items-center gap-2 text-sm text-white bg-red-700 hover:bg-red-800 px-3 py-1 rounded-full shadow-md"
    >
      ← Back
    </button>
  );
}
