"use client";

import dynamic from "next/dynamic";

const EditorApp = dynamic(() => import("@/components/editor/App"), {
  ssr: false,
});

export default function Home() {
  return <EditorApp />;
}
