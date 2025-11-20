import {useState, useMemo} from "react";
import "./App.css";
import Watch from "./Watch.jsx";
import * as d3 from "d3";

function App() {
  const [worldWatchesMode, setWorldWatchesMode] = useState(false);

  const timeZones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch (e) {
      // Fallback for browsers that don't support Intl.supportedValuesOf
      return ["America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney"];
    }
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-4">
      <button
        onClick={() => setWorldWatchesMode(!worldWatchesMode)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        {worldWatchesMode ? "Switch to Single Watch" : "Switch to World Watches"}
      </button>

      {worldWatchesMode ? (
        <div className="w-full h-full overflow-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-4 justify-items-center">
            {d3.shuffle(timeZones).map((tz) => (
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
