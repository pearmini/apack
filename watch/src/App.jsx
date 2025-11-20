import {useState, useMemo} from "react";
import "./App.css";
import Watch from "./Watch.jsx";
import * as d3 from "d3";

function App() {
  const [worldWatchesMode, setWorldWatchesMode] = useState(true);
  const [sortOption, setSortOption] = useState("random");

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

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-4">
      {/* <button
        onClick={() => setWorldWatchesMode(!worldWatchesMode)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {worldWatchesMode ? "Switch to Single Watch" : "Switch to World Watches"}
      </button> */}

      {worldWatchesMode ? (
        <div className="w-full h-full overflow-auto flex flex-col">
          <h1 className="text-4xl font-bold text-center mt-6 mb-4">
            World Clocks by{" "}
            <a href="https://apack.bairui.dev/" target="_blank" rel="noopener noreferrer" className="underline">
              APack
            </a>
          </h1>
          <div className="flex justify-center mb-4">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="random">Random</option>
              <option value="alphabet-asc">Alphabet (A-Z)</option>
              <option value="alphabet-desc">Alphabet (Z-A)</option>
              <option value="time-asc">Time (Earliest First)</option>
              <option value="time-desc">Time (Latest First)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-4 justify-items-center">
            {sortedTimeZones.map((tz) => (
              <Watch key={tz} timeZone={tz} />
            ))}
          </div>
        </div>
      ) : (
        <Watch />
      )}
    </div>
  );
}

export default App;
