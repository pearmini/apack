import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APack",
  description:
    "Alphabet-packing writing system — Latin text composed into Chinese-character-like glyphs.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
