import {useState, useMemo} from "react";
import {useRouter} from "next/navigation";
import Watch from "./Watch.jsx";
import {Globe, MapPin} from "lucide-react";
import {cityNameToTimezone} from "./utils.js";
import {getFlagEmoji, getCountryCodeFromTimezone} from "./flag.js";
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

  const selectedTimeZone = useMemo(() => {
    if (!cityName) return null;

    if (cityName.toLowerCase() === "local") {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (e) {
        return null;
      }
    }
    if (cityName.toLowerCase() === "utc") {
      return "UTC";
    }

    return cityNameToTimezone(cityName, timeZones);
  }, [cityName, timeZones]);

  const isValidTimeZone = selectedTimeZone && (selectedTimeZone === "UTC" || timeZones.includes(selectedTimeZone));

  const fontAssignment = useMemo(() => {
    if (fontOption !== "random" || !isValidTimeZone) {
      return fontOption;
    }
    return VALID_FONTS[Math.floor(Math.random() * VALID_FONTS.length)];
  }, [fontOption, isValidTimeZone]);

  const countryCode = selectedTimeZone && selectedTimeZone !== "UTC" ? getCountryCodeFromTimezone(selectedTimeZone) : null;
  const flagEmoji = countryCode ? getFlagEmoji(countryCode) : "";
  const countryName = selectedTimeZone
    ? selectedTimeZone === "UTC"
      ? "UTC"
      : selectedTimeZone.split("/").pop().replace(/_/g, " ")
    : "Local";

  const localTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return null;
    }
  }, []);

  const localFontAssignment = useMemo(() => {
    if (fontOption !== "random" || !localTimeZone) {
      return fontOption;
    }
    return VALID_FONTS[Math.floor(Math.random() * VALID_FONTS.length)];
  }, [fontOption, localTimeZone]);

  const goHome = () => router.push("/aclock/");

  if (!isValidTimeZone) {
    return (
      <div className="aclock-watch-page">
        <div className="aclock-watch-inner">
          <button onClick={goHome} className="aclock-icon-button" aria-label="Home">
            <Globe className="h-5 w-5" />
          </button>

          {localTimeZone && (
            <div className="aclock-watch-preview">
              <div style={{width: "150px", height: "150px"}}>
                <Watch
                  key={localTimeZone}
                  timeZone={localTimeZone}
                  interpolator={interpolators[interpolatorOption]}
                  font={localFontAssignment}
                  fixedSize={150}
                  hideLabel={true}
                />
              </div>
            </div>
          )}

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

  return (
    <div className="aclock-watch-page">
      <div className="aclock-watch-inner">
        <div className="aclock-watch-header">
          <button onClick={goHome} className="aclock-icon-button" aria-label="Home">
            <Globe className="h-5 w-5" />
          </button>
          {countryName && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(countryName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="aclock-watch-location"
            >
              {flagEmoji && <span className="text-2xl">{flagEmoji}</span>}
              <span className="font-medium">{countryName} Time</span>
              <MapPin className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="aclock-watch-center">
          <div style={{width: "150px", height: "150px"}}>
            <Watch
              key={selectedTimeZone}
              timeZone={selectedTimeZone}
              interpolator={interpolators[interpolatorOption]}
              font={fontAssignment}
              fixedSize={150}
              hideLabel={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
