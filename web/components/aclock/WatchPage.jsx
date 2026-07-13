import {useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import Watch from "./Watch.jsx";
import {Globe} from "lucide-react";
import {cityNameToTimezone} from "./utils.js";
import {DEFAULT_FONT, DEFAULT_INTERPOLATOR, interpolators, VALID_FONTS} from "./constants.js";

export default function WatchPage({cityName}) {
  const router = useRouter();

  const [interpolatorOption] = useState(() => {
    return localStorage.getItem("watchInterpolatorOption") || DEFAULT_INTERPOLATOR;
  });
  const [fontOption] = useState(() => {
    return localStorage.getItem("watchFontOption") || DEFAULT_FONT;
  });

  const timeZones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch (e) {
      return ["America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney"];
    }
  }, []);

  const isLocalPage = cityName?.toLowerCase() === "local";
  const isUtcPage = cityName?.toLowerCase() === "utc";

  const selectedTimeZone = useMemo(() => {
    if (!cityName) return null;

    if (isLocalPage) {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (e) {
        return null;
      }
    }
    if (isUtcPage) {
      return "UTC";
    }

    return cityNameToTimezone(cityName, timeZones);
  }, [cityName, timeZones, isLocalPage, isUtcPage]);

  const isValidTimeZone =
    isLocalPage ||
    (selectedTimeZone && (selectedTimeZone === "UTC" || timeZones.includes(selectedTimeZone)));

  const fontAssignment = useMemo(() => {
    if (fontOption !== "random" || !isValidTimeZone) {
      return fontOption;
    }
    return VALID_FONTS[Math.floor(Math.random() * VALID_FONTS.length)];
  }, [fontOption, isValidTimeZone]);

  const goHome = () => router.push("/aclock/");

  if (!isValidTimeZone) {
    return (
      <div className="aclock-watch-page">
        <div className="aclock-watch-detail">
          <button type="button" onClick={goHome} className="aclock-icon-button" aria-label="Back to world clocks">
            <Globe className="h-5 w-5" />
          </button>
          <div className="aclock-watch-error">
            <h1>Time zone not found</h1>
            <button type="button" onClick={goHome} className="aclock-text-button">
              Return to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const watchTimeZone = isLocalPage ? null : selectedTimeZone;

  return (
    <div className="aclock-watch-page">
      <div className="aclock-watch-detail">
        <button type="button" onClick={goHome} className="aclock-icon-button" aria-label="Back to world clocks">
          <Globe className="h-5 w-5" />
        </button>
        <div className="aclock-watch-detail-card">
          <Watch
            key={watchTimeZone || "local"}
            timeZone={watchTimeZone}
            featured
            interpolator={interpolators[interpolatorOption]}
            font={fontAssignment}
          />
        </div>
      </div>
    </div>
  );
}
