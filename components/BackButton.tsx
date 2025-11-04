"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    // Split the current path and remove the last segment
    const segments = pathname.split("/").filter(Boolean);
    segments.pop();

    // Join remaining segments back into a valid path
    const parentPath = "/" + segments.join("/");

    // If no parent path remains, go to root (/)
    router.push(parentPath || "/");
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1C1C1C] text-white hover:bg-[#2D2D2D] transition-colors duration-200"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
}
