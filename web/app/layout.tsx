import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Editor — APack",
  description: "Canvas-like writing surface for packing Latin text into glyphs.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
