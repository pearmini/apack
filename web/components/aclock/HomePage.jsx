import {useState, useMemo, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import Watch from "./Watch.jsx";
import Toolbar from "./Toolbar.jsx";
import {timezoneToCityName} from "./utils.js";
import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import {
  DEFAULT_FONT,
  DEFAULT_INTERPOLATOR,
  DEFAULT_SORT,
  interpolators,
  VALID_FONTS,
} from "./constants.js";

export default function HomePage() {
  const router = useRouter();

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
    // Add assignments for special watches
    assignments["local"] = VALID_FONTS[Math.floor(Math.random() * VALID_FONTS.length)];
    assignments["UTC"] = VALID_FONTS[Math.floor(Math.random() * VALID_FONTS.length)];
    return assignments;
  }, [filteredTimeZones, fontOption]);

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
    <div className="min-h-full w-full overflow-auto">
      <header className="aclock-header">
        <div className="aclock-header-copy">
          <p className="aclock-eyebrow">Time zones, wherever you are</p>
          <h1>
            <a href="https://github.com/pearmini/apack/tree/main/web" target="_blank" rel="noopener noreferrer">
              World Clocks
            </a>{" "}
            <span className="aclock-title-by">
              by <a href="/">APack</a>
            </span>
          </h1>
        </div>
        <div ref={legendRef} className="aclock-legend" />
      </header>
      <Toolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        interpolatorOption={interpolatorOption}
        setInterpolatorOption={setInterpolatorOption}
        fontOption={fontOption}
        setFontOption={setFontOption}
        sortOption={sortOption}
        setSortOption={setSortOption}
        interpolators={interpolators}
        validFonts={VALID_FONTS}
        handleReset={handleReset}
        zoneCount={filteredTimeZones.length}
      />

      {!debouncedSearchQuery.trim() && (
        <div className="aclock-featured-row">
          <Watch
            key="local"
            timeZone={null}
            featured
            interpolator={interpolators[interpolatorOption]}
            font={fontOption === "random" ? fontAssignments["local"] : fontOption}
            onClick={() => router.push("/aclock/local/")}
          />
          <Watch
            key="UTC"
            timeZone="UTC"
            featured
            interpolator={interpolators[interpolatorOption]}
            font={fontOption === "random" ? fontAssignments["UTC"] : fontOption}
            onClick={() => router.push("/aclock/utc/")}
          />
        </div>
      )}

      <div className="aclock-grid">
        {filteredTimeZones.map((tz) => (
          <Watch
            key={tz}
            timeZone={tz}
            interpolator={interpolators[interpolatorOption]}
            font={fontOption === "random" ? fontAssignments[tz] : fontOption}
            onClick={() => router.push(`/aclock/${timezoneToCityName(tz)}/`)}
          />
        ))}
      </div>
    </div>
  );
}
