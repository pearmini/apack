import type {Metadata} from "next";
import "./editor.css";

export const metadata: Metadata = {
  title: "Editor — APack",
  description: "Canvas-like writing surface for packing Latin text into glyphs.",
};

export default function EditorLayout({children}: {children: React.ReactNode}) {
  return <div className="editor-root">{children}</div>;
}
