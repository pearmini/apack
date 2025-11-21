import {useState} from "react";

export default function Toolbar({
  searchQuery,
  setSearchQuery,
  interpolatorOption,
  setInterpolatorOption,
  fontOption,
  setFontOption,
  sortOption,
  setSortOption,
  interpolators,
  validFonts,
  handleReset,
  legendRef,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="px-12 mb-4">
      <div className="flex justify-between items-start">
        {/* Hamburger button for small and medium screens */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Toolbar controls */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } lg:flex lg:justify-center gap-4 mb-8 flex-wrap items-end w-full md:w-auto`}
        >
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
              {validFonts.map((font) => (
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

        {/* Legend - hidden on small and medium screens, visible on larger screens */}
        <div ref={legendRef} className="hidden lg:flex justify-start"></div>
      </div>
    </div>
  );
}

