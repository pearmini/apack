"use client";

import dynamic from "next/dynamic";

const AClockRouter = dynamic(() => import("@/components/aclock/AClockRouter"), {
  ssr: false,
});

export default function AClockPageClient() {
  return <AClockRouter />;
}
