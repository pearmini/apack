import {useState, useMemo, useEffect, useRef} from "react";
import "./App.css";
import Watch from "./Watch.jsx";
import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import {FONT_FAMILIES} from "apackjs";

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

const VALID_FONTS = FONT_FAMILIES.filter((font) => font !== "markers");

// Default values
const DEFAULT_SORT = "random";
const DEFAULT_INTERPOLATOR = "BrBG";
const DEFAULT_FONT = "futural";

function App() {
  // Load from localStorage or use defaults
  const [sortOption, setSortOption] = useState(() => {
    return localStorage.getItem("watchSortOption") || DEFAULT_SORT;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [interpolatorOption, setInterpolatorOption] = useState(() => {
    return localStorage.getItem("watchInterpolatorOption") || DEFAULT_INTERPOLATOR;
  });
  const [fontOption, setFontOption] = useState(() => {
    return localStorage.getItem("watchFontOption") || DEFAULT_FONT;
  });

  // Save to localStorage when values change
  useEffect(() => {
    localStorage.setItem("watchSortOption", sortOption);
  }, [sortOption]);

  useEffect(() => {
    localStorage.setItem("watchInterpolatorOption", interpolatorOption);
  }, [interpolatorOption]);

  useEffect(() => {
    localStorage.setItem("watchFontOption", fontOption);
  }, [fontOption]);

  // Reset function
  const handleReset = () => {
    setSortOption(DEFAULT_SORT);
    setInterpolatorOption(DEFAULT_INTERPOLATOR);
    setFontOption(DEFAULT_FONT);
    localStorage.setItem("watchSortOption", DEFAULT_SORT);
    localStorage.setItem("watchInterpolatorOption", DEFAULT_INTERPOLATOR);
    localStorage.setItem("watchFontOption", DEFAULT_FONT);
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const timeZones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch (e) {
      // Fallback for browsers that don't support Intl.supportedValuesOf
      return ["America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney"];
    }
  }, []);

  const sortedTimeZones = useMemo(() => {
    const tzArray = [...timeZones];

    if (sortOption === "random") {
      return d3.shuffle(tzArray);
    } else if (sortOption === "alphabet-asc") {
      return tzArray.sort();
    } else if (sortOption === "alphabet-desc") {
      return tzArray.sort().reverse();
    } else if (sortOption === "time-asc" || sortOption === "time-desc") {
      const now = new Date();
      const sorted = tzArray.sort((a, b) => {
        const timeA = new Intl.DateTimeFormat("en-US", {
          timeZone: a,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);
        const timeB = new Intl.DateTimeFormat("en-US", {
          timeZone: b,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now);
        return timeA.localeCompare(timeB);
      });
      return sortOption === "time-desc" ? sorted.reverse() : sorted;
    }
    return tzArray;
  }, [timeZones, sortOption]);

  const filteredTimeZones = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return sortedTimeZones;
    }
    const query = debouncedSearchQuery.toLowerCase().trim();
    // Normalize query: replace spaces with underscores and also keep spaces for flexible matching
    const normalizedQuery = query.replace(/\s+/g, " ");

    return sortedTimeZones.filter((tz) => {
      const tzLower = tz.toLowerCase();
      // Check if query matches the full timezone string (with underscores)
      if (tzLower.includes(query.replace(/\s+/g, "_"))) {
        return true;
      }
      // Check if query matches the timezone string with spaces normalized
      if (tzLower.replace(/_/g, " ").includes(normalizedQuery)) {
        return true;
      }
      // Check the timezone label (part after last slash) - this is what's displayed
      const label = tz.split("/").pop().toLowerCase().replace(/_/g, " ");
      if (label.includes(normalizedQuery)) {
        return true;
      }
      return false;
    });
  }, [sortedTimeZones, debouncedSearchQuery]);

  // Generate random font assignments for each timezone when fontOption is "random"
  const fontAssignments = useMemo(() => {
    if (fontOption !== "random") {
      return null; // Not using random, will use fontOption directly
    }
    const assignments = {};
    filteredTimeZones.forEach((tz) => {
      assignments[tz] = VALID_FONTS[Math.floor(Math.random() * VALID_FONTS.length)];
    });
    return assignments;
  }, [filteredTimeZones, fontOption]);

  // Generate a stable random font for single watch mode
  const singleWatchFont = useMemo(() => {
    if (fontOption === "random") {
      return VALID_FONTS[Math.floor(Math.random() * VALID_FONTS.length)];
    }
    return fontOption;
  }, [fontOption]);

  // Legend container ref
  const legendRef = useRef(null);

  // Render legend
  useEffect(() => {
    if (!legendRef.current) return;

    // Create legend using Observable Plot
    const legend = Plot.legend({
      color: {
        type: "linear",
        domain: [0, 24],
        scheme: interpolatorOption,
        label: "Time (hours)",
      },
    });

    // Clear and render
    legendRef.current.innerHTML = "";
    legendRef.current.appendChild(legend);
  }, [interpolatorOption]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="w-full h-full overflow-auto flex flex-col">
        <h1 className="text-4xl font-bold text-center mt-8 mb-8">
          World Clocks by{" "}
          <a href="https://apack.bairui.dev/" target="_blank" rel="noopener noreferrer" className="underline">
            APack
          </a>
        </h1>
        <div className="flex justify-between px-12">
          <div className="flex justify-center gap-4 mb-8 flex-wrap items-end">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search timezones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Color</label>
              <select
                value={interpolatorOption}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "reset") {
                    handleReset();
                  } else {
                    setInterpolatorOption(value);
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="reset">Reset</option>
                {Object.keys(interpolators).sort().map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Font</label>
              <select
                value={fontOption}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "reset") {
                    handleReset();
                  } else {
                    setFontOption(value);
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="reset">Reset</option>
                <option value="random">Random</option>
                {VALID_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Sort</label>
              <select
                value={sortOption}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "reset") {
                    handleReset();
                  } else {
                    setSortOption(value);
                  }
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="random">Random</option>
                <option value="alphabet-asc">Alphabet (A-Z)</option>
                <option value="alphabet-desc">Alphabet (Z-A)</option>
                <option value="time-asc">Time (Earliest First)</option>
                <option value="time-desc">Time (Latest First)</option>
                <option value="reset">Reset</option>
              </select>
            </div>
          </div>
          <div ref={legendRef} className="flex justify-start"></div>
        </div>

        <div className="flex flex-wrap gap-6 p-6 px-12 justify-between">
          {filteredTimeZones.map((tz) => (
            <Watch
              key={tz}
              timeZone={tz}
              interpolator={interpolators[interpolatorOption]}
              font={fontOption === "random" ? fontAssignments?.[tz] || "futural" : fontOption}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
