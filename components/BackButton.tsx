"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/" || pathname === "/login") return null;

  const handleBack = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 2) {
      // remove the last segment to go up one level
      const parentPath = "/" + parts.slice(0, -1).join("/");
      router.push(parentPath);
    } else {
      // stay on /app/patron if at or above that level
      router.push("/app/patron");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center justify-center text-sm text-white bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full shadow-md"
    >
      ← Back
    </button>
  );
}
