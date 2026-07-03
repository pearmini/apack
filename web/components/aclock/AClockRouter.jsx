"use client";

import {usePathname} from "next/navigation";
import HomePage from "./HomePage";
import WatchPage from "./WatchPage";

const ACLOCK_BASE = "/aclock";

function getAclockSlug(pathname) {
  if (!pathname.startsWith(ACLOCK_BASE)) return null;
  const rest = pathname.slice(ACLOCK_BASE.length).replace(/^\/+|\/+$/g, "");
  return rest || null;
}

export default function AClockRouter() {
  const pathname = usePathname();
  const slug = getAclockSlug(pathname);

  if (!slug) {
    return <HomePage />;
  }

  return <WatchPage cityName={slug} />;
}
