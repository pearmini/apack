import {useState, useMemo} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import Watch from "./Watch.jsx";
import {Globe, MapPin} from "lucide-react";
import {cityNameToTimezone} from "./utils.js";
import {getFlagEmoji, getCountryCodeFromTimezone} from "./flag.js";
import * as d3 from "d3";
import {FONT_FAMILIES} from "apackjs";

const VALID_FONTS = FONT_FAMILIES.filter((font) => font !== "markers");

const interpolators = {
  Greys: d3.interpolateGreys,
  Blues: d3.interpolateBlues,
  Reds: d3.interpolateReds,
  Greens: d3.interpolateGreens,
  Oranges: d3.interpolateOranges,
  Purples: d3.interpolatePurples,
  Turbo: d3.interpolateTurbo,
  Viridis: d3.interpolateViridis,
  Inferno: d3.interpolateInferno,
  Magma: d3.interpolateMagma,
  Plasma: d3.interpolatePlasma,
  Cividis: d3.interpolateCividis,
  Warm: d3.interpolateWarm,
  Cool: d3.interpolateCool,
  Cubehelix: d3.interpolateCubehelixDefault,
  BuGn: d3.interpolateBuGn,
  BuPu: d3.interpolateBuPu,
  GnBu: d3.interpolateGnBu,
  OrRd: d3.interpolateOrRd,
  PuBuGn: d3.interpolatePuBuGn,
  PuBu: d3.interpolatePuBu,
  PuRd: d3.interpolatePuRd,
  RdPu: d3.interpolateRdPu,
  YlGnBu: d3.interpolateYlGnBu,
  YlGn: d3.interpolateYlGn,
  YlOrBr: d3.interpolateYlOrBr,
  YlOrRd: d3.interpolateYlOrRd,
  BrBG: d3.interpolateBrBG,
  PRGn: d3.interpolatePRGn,
  PiYG: d3.interpolatePiYG,
  PuOr: d3.interpolatePuOr,
  RdBu: d3.interpolateRdBu,
  RdGy: d3.interpolateRdGy,
  RdYlBu: d3.interpolateRdYlBu,
  RdYlGn: d3.interpolateRdYlGn,
  Spectral: d3.interpolateSpectral,
  Rainbow: d3.interpolateRainbow,
  Sinebow: d3.interpolateSinebow,
};

const DEFAULT_INTERPOLATOR = "BrBG";
const DEFAULT_FONT = "futural";

export default function WatchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get city name from pathname (remove leading slash)
  const pathname = location.pathname;
  const cityName = pathname !== "/" ? pathname.slice(1) : null;

  const [interpolatorOption] = useState(() => {
    return localStorage.getItem("watchInterpolatorOption") || DEFAULT_INTERPOLATOR;
  });
  const [fontOption] = useState(() => {
    return localStorage.getItem("watchFontOption") || DEFAULT_FONT;
  });

  // Get all timezones
  const timeZones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch (e) {
      return ["America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney"];
    }
  }, []);

  // Convert city name to full timezone (handle special cases for "local" and "utc")
  const selectedTimeZone = useMemo(() => {
    if (!cityName) return null;
    
    // Handle special cases
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

  // Generate random font assignment if needed
  const fontAssignment = useMemo(() => {
    if (fontOption !== "random" || !isValidTimeZone) {
      return fontOption;
    }
    return VALID_FONTS[Math.floor(Math.random() * VALID_FONTS.length)];
  }, [fontOption, isValidTimeZone]);

  // Get country info for display
  const countryCode = selectedTimeZone && selectedTimeZone !== "UTC" ? getCountryCodeFromTimezone(selectedTimeZone) : null;
  const flagEmoji = countryCode ? getFlagEmoji(countryCode) : "";
  const countryName = selectedTimeZone 
    ? selectedTimeZone === "UTC" 
      ? "UTC" 
      : selectedTimeZone.split("/").pop().replace(/_/g, " ")
    : "Local";

  if (!isValidTimeZone) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Time zone not found</h1>
          <button onClick={() => navigate("/")} className="text-blue-600 hover:underline">
            Return to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="w-full h-full overflow-auto flex flex-col relative">
        {/* Home button and country info */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-gray-700 hover:bg-gray-100 p-2 rounded-md transition-colors cursor-pointer"
            aria-label="Home"
          >
            <Globe className="w-5 h-5" />
          </button>
          {countryName && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(countryName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
            >
              {flagEmoji && <span className="text-2xl">{flagEmoji}</span>}
              <span className="font-medium">{countryName} Time</span>
              <MapPin className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Watch centered at 150px x 150px */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            minHeight: "150px",
          }}
        >
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
