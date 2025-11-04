"use client";

import { usePathname, useRouter } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/" || pathname === "/login") return null;

  const handleBack = () => {
    const parts = pathname.split("/").filter(Boolean);

    if (pathname === "/app/patron") {
      // if on the Patron dashboard, go to the main app homepage
      window.location.href = "https://app.lythgoefamily.com";
      return;
    }

    if (parts.length > 2) {
      // go up one level
      const parentPath = "/" + parts.slice(0, -1).join("/");
      router.push(parentPath);
    } else {
      // stop at /app/patron
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
