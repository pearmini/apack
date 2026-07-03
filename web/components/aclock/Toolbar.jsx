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
    <div className="aclock-toolbar">
      <div className="flex justify-between items-start lg:flex-row flex-col">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-gray-700 hover:bg-gray-100 transition-colors"
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <div
          className={`${
            isOpen ? "flex" : "hidden"
          } lg:flex flex-wrap items-end gap-4 sm:gap-6 w-full lg:w-auto mt-4 lg:mt-0`}
        >
          <div className="aclock-field">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search timezones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="aclock-input aclock-search"
            />
          </div>
          <div className="aclock-field">
            <label>Color</label>
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
              className="aclock-select"
            >
              <option value="reset">Reset</option>
              {Object.keys(interpolators)
                .sort()
                .map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
          </div>
          <div className="aclock-field">
            <label>Font</label>
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
              className="aclock-select"
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
          <div className="aclock-field">
            <label>Sort</label>
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
              className="aclock-select"
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

        <div ref={legendRef} className="hidden lg:flex justify-start"></div>
      </div>
    </div>
  );
}
