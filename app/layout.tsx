import type { Metadata } from "next";
import { Oswald, Bitter } from "next/font/google";
import Nav from "./components/Nav";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});
const bitter = Bitter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-bitter",
});

export const metadata: Metadata = {
  title: "BuddyHub",
  description: "Our league, our crew — since 2012.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${bitter.variable}`}>
      <head>
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen">
        <div className="grain" aria-hidden="true" />
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer
          className="max-w-5xl mx-auto px-4 py-10 mt-10 border-t border-forest/20 text-sm text-muted uppercase tracking-[0.15em]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          🏈 BuddyHub · Est. 2012
        </footer>
      </body>
    </html>
  );
}
