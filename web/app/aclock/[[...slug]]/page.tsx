import AClockPageClient from "./AClockPageClient";
import {timezoneToCityName} from "../../../components/aclock/utils.js";

export function generateStaticParams() {
  const params: {slug: string[]}[] = [{slug: []}, {slug: ["local"]}, {slug: ["utc"]}];
  const seen = new Set(["local", "utc"]);

  try {
    for (const tz of Intl.supportedValuesOf("timeZone")) {
      const city = timezoneToCityName(tz);
      if (!city || seen.has(city)) continue;
      seen.add(city);
      params.push({slug: [city]});
    }
  } catch {
    // Intl.supportedValuesOf may be unavailable in some environments
  }

  return params;
}

export default function AClockPage() {
  return <AClockPageClient />;
}
