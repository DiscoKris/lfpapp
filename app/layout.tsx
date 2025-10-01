import "./globals.css";
import type { Metadata } from "next";
import BackButton from "../components/BackButton"; // add this line

export const metadata: Metadata = {
  title: "Lythgoe Family Productions",
  description: "Patron & Staff App",
  icons: {
    icon: "/lfp-favicon.png", // for browsers
    shortcut: "/lfp-favicon.png",
    apple: "/lfp-favicon.png", // iOS add-to-home
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Extra favicon/meta for mobile & iOS */}
        <link rel="icon" href="/lfp-favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/lfp-favicon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body className="bg-black text-white">
        {/* Universal mobile container */}
        <div className="w-full max-w-md mx-auto min-h-screen p-4">
          <BackButton />   {/* 👈 back button added here */}
          {children}
        </div>
      </body>
    </html>
  );
}
