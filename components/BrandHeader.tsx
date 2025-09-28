"use client";
import Image from "next/image";

export default function BrandHeader() {
  return (
    <header className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <Image
        src="/lfp-logo.svg"
        alt="Lythgoe Family Productions"
        width={200}
        height={200}
        priority
      />
    </header>
  );
}
