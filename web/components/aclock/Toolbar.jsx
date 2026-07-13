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
  zoneCount,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="aclock-toolbar">
      <div className="aclock-toolbar-inner">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="aclock-toolbar-menu"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
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

        <div className={`aclock-toolbar-controls${isOpen ? " is-open" : ""}`}>
          <div className="aclock-field aclock-field-search">
            <label htmlFor="aclock-search" className="aclock-sr-only">
              Search
            </label>
            <input
              id="aclock-search"
              type="text"
              placeholder="Search cities or time zones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="aclock-input aclock-search"
            />
          </div>

          <div className="aclock-field aclock-field-inline">
            <label htmlFor="aclock-sort">Sort</label>
            <select
              id="aclock-sort"
              value={sortOption}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "reset") handleReset();
                else setSortOption(value);
              }}
              className="aclock-select"
            >
              <option value="time-asc">By time</option>
              <option value="time-desc">By time ↓</option>
              <option value="alphabet-asc">A–Z</option>
              <option value="alphabet-desc">Z–A</option>
              <option value="random">Random</option>
              <option value="reset">Reset</option>
            </select>
          </div>

          <div className="aclock-field aclock-field-inline">
            <label htmlFor="aclock-digits">Digits</label>
            <select
              id="aclock-digits"
              value={fontOption}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "reset") handleReset();
                else setFontOption(value);
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

          <div className="aclock-field aclock-field-inline">
            <label htmlFor="aclock-color">Color</label>
            <select
              id="aclock-color"
              value={interpolatorOption}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "reset") handleReset();
                else setInterpolatorOption(value);
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
        </div>

        <p className="aclock-zone-count">
          {zoneCount} time zone{zoneCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="aclock-toolbar-rule" aria-hidden="true" />
    </div>
  );
}
