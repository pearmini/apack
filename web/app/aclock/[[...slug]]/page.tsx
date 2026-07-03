import AClockPageClient from "./AClockPageClient";

export function generateStaticParams() {
  return [{slug: []}];
}

export default function AClockPage() {
  return <AClockPageClient />;
}
