"use client";

import Link from "next/link";

type ComingSoonProps = {
  backHref?: string;
  backLabel?: string;
};

export default function ComingSoon({
  backHref = "/patron/oz",
  backLabel = "← Back",
}: ComingSoonProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <h1 className="mb-3 text-3xl font-bold text-[#FACC15] drop-shadow-sm md:text-4xl">
        Coming Soon
      </h1>
      <p className="mb-10 max-w-sm text-sm text-white/70 md:text-base">
        This feature is still in the works. Please check back soon!
      </p>
      <Link
        href={backHref}
        className="inline-flex items-center justify-center rounded-full bg-[#B91C1C] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#7F1D1D]"
      >
        {backLabel}
      </Link>
    </main>
  );
}
