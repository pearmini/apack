import type {Metadata} from "next";
import "./aclock.css";

export const metadata: Metadata = {
  title: "AClocks — APack",
  description: "World clocks with packed digit glyphs across time zones.",
};

export default function AClockLayout({children}: {children: React.ReactNode}) {
  return <div className="aclock-root">{children}</div>;
}
