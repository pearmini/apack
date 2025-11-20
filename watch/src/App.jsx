import {useState, useMemo, useEffect} from "react";
import "./App.css";
import Watch from "./Watch.jsx";
import * as d3 from "d3";
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
  "Cubehelix Default": d3.interpolateCubehelixDefault,
  "Blue-Green": d3.interpolateBuGn,
  "Blue-Purple": d3.interpolateBuPu,
  "Green-Blue": d3.interpolateGnBu,
  "Orange-Red": d3.interpolateOrRd,
  "Purple-Blue-Green": d3.interpolatePuBuGn,
  "Purple-Blue": d3.interpolatePuBu,
  "Purple-Red": d3.interpolatePuRd,
  "Red-Purple": d3.interpolateRdPu,
  "Yellow-Green-Blue": d3.interpolateYlGnBu,
  "Yellow-Green": d3.interpolateYlGn,
  "Yellow-Orange-Brown": d3.interpolateYlOrBr,
  "Yellow-Orange-Red": d3.interpolateYlOrRd,
};

const VALID_FONTS = FONT_FAMILIES.filter((font) => font !== "markers");

function App() {
  const [sortOption, setSortOption] = useState("random");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [interpolatorOption, setInterpolatorOption] = useState("Viridis");
  const [fontOption, setFontOption] = useState("futural");

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

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      <div className="w-full h-full overflow-auto flex flex-col">
        <h1 className="text-4xl font-bold text-center mt-8 mb-8">
          World Clocks by{" "}
          <a href="https://apack.bairui.dev/" target="_blank" rel="noopener noreferrer" className="underline">
            APack
          </a>
        </h1>
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
            <label className="text-xs text-gray-600 mb-1">Sort</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="random">Random</option>
              <option value="alphabet-asc">Alphabet (A-Z)</option>
              <option value="alphabet-desc">Alphabet (Z-A)</option>
              <option value="time-asc">Time (Earliest First)</option>
              <option value="time-desc">Time (Latest First)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Color</label>
            <select
              value={interpolatorOption}
              onChange={(e) => setInterpolatorOption(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(interpolators).map((name) => (
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
              onChange={(e) => setFontOption(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="random">Random</option>
              {VALID_FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 p-6 justify-center">
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
