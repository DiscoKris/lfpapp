import "./globals.css";
import type { Metadata } from "next";
import BackButton from "../components/BackButton";

export const metadata: Metadata = {
  title: "Lythgoe Family Productions",
  description: "Patron & Staff App",
  icons: {
    icon: "/lfp-favicon.png",
    shortcut: "/lfp-favicon.png",
    apple: "/lfp-favicon.png",
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
        <link rel="icon" href="/lfp-favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/lfp-favicon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body className="bg-black text-white min-h-screen flex flex-col">
        {/* Page content centered */}
        <div className="flex-grow w-full max-w-md mx-auto">{children}</div>

        {/* Back button on background, full width */}
        <div className="p-4">
          <div className="w-full max-w-md mx-auto"></div>
          <BackButton />
        </div>
      </body>
    </html>
  );
}
