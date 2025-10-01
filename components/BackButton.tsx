"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/" || pathname === "/login") return null;

  return (
    <button
            onClick={() => router.back()}   // 👈 go to previous page
      className="flex items-center justify-center text-sm text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full shadow-md"
    >
      ← Back
    </button>
  );
}
