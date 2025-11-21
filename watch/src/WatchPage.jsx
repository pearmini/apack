import {useState, useMemo} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import Watch from "./Watch.jsx";
import {Home} from "lucide-react";
import {cityNameToTimezone} from "./utils.js";
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

  // Convert city name to full timezone
  const selectedTimeZone = useMemo(() => {
    if (!cityName) return null;
    return cityNameToTimezone(cityName, timeZones);
  }, [cityName, timeZones]);

  const isValidTimeZone = selectedTimeZone && timeZones.includes(selectedTimeZone);

  // Generate random font assignment if needed
  const fontAssignment = useMemo(() => {
    if (fontOption !== "random" || !isValidTimeZone) {
      return fontOption;
    }
    return VALID_FONTS[Math.floor(Math.random() * VALID_FONTS.length)];
  }, [fontOption, isValidTimeZone]);

  if (!isValidTimeZone) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Time zone not found</h1>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:underline"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="w-full h-full overflow-auto flex flex-col relative">
        {/* Home button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 z-10 text-gray-700 hover:bg-gray-100 p-2 rounded-md transition-colors"
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
        </button>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 md:px-8 lg:px-12">
          World Clocks by{" "}
          <a href="https://apack.bairui.dev/" target="_blank" rel="noopener noreferrer" className="underline">
            APack
          </a>
        </h1>

        <div
          className="px-4 sm:px-6 md:px-8 lg:px-12"
          style={{
            display: "grid",
            gridGap: "0.875rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <Watch
            key={selectedTimeZone}
            timeZone={selectedTimeZone}
            interpolator={interpolators[interpolatorOption]}
            font={fontAssignment}
          />
        </div>
      </div>
    </div>
  );
}

