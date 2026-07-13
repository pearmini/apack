import {useRef, useEffect, useState, useMemo} from "react";
import * as apack from "apackjs";
import * as d3 from "d3";
import {getFlagEmoji, getCountryCodeFromTimezone} from "./flag.js";

function renderWatch(parent, timeZone = null, interpolator = d3.interpolateGreys, font = "futural", size = 150) {
  let timer;
  const strokeWidth = 3;
  const strokeRadius = Math.max(8, size * 0.08);

  // Create a sequential color scale: earlier = lighter, later = darker
  // Maps 0-24 hours to light-dark colors
  const colorScale = d3.scaleSequential(interpolator).domain([0, 24]); // 0 hours = light, 24 hours = dark

  // Calculate relative luminance of a color (0-1, where 0 is black and 1 is white)
  function getLuminance(color) {
    // Parse RGB from color string (e.g., "rgb(128, 128, 128)" or "#808080")
    const rgb = d3.rgb(color);
    // Relative luminance formula
    return 0.2126 * (rgb.r / 255) + 0.7152 * (rgb.g / 255) + 0.0722 * (rgb.b / 255);
  }

  function formatDigit(digit) {
    return digit.toString().padStart(2, "0");
  }

  function update() {
    let hours, minutes, seconds;
    let hoursNum;
    if (timeZone) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(new Date());
      hoursNum = parseInt(parts.find((p) => p.type === "hour").value);
      hours = formatDigit(hoursNum);
      minutes = formatDigit(parseInt(parts.find((p) => p.type === "minute").value));
      seconds = formatDigit(parseInt(parts.find((p) => p.type === "second").value));
    } else {
      const now = new Date();
      hoursNum = now.getHours();
      hours = formatDigit(hoursNum);
      minutes = formatDigit(now.getMinutes());
      seconds = formatDigit(now.getSeconds());
    }

    // Calculate time as decimal hours (including minutes and seconds for smooth transition)
    const timeDecimal = hoursNum + parseInt(minutes) / 60 + parseInt(seconds) / 3600;
    const fillColor = colorScale(timeDecimal);

    // Determine stroke color based on background brightness
    const luminance = getLuminance(fillColor);
    const strokeColor = luminance < 0.5 ? "white" : "black";

    const digits = apack
      .text(`${hours}${minutes}${seconds}`, {
        cellSize: size,
        font,
        word: {
          strokeWidth,
          stroke: strokeColor,
        },
      })
      .render();

    const svg = d3
      .create("svg")
      .attr("viewBox", `0 0 ${size} ${size}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%");

    svg
      .append("rect")
      .attr("x", strokeWidth)
      .attr("y", strokeWidth)
      .attr("width", size - strokeWidth * 2)
      .attr("height", size - strokeWidth * 2)
      .attr("fill", fillColor)
      .attr("rx", strokeRadius)
      .attr("ry", strokeRadius)
      .attr("stroke-width", strokeWidth);

    svg.node().appendChild(digits);

    parent.innerHTML = "";
    parent.appendChild(svg.node());
  }

  function start() {
    timer = d3.interval(update, 1000);
    update();
  }

  function stop() {
    if (timer) {
      timer.stop();
      timer = null;
    }
  }

  return {
    start,
    stop,
  };
}

function resolveTimeZone(timeZone) {
  if (timeZone) return timeZone;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function formatUtcOffset(timeZone) {
  const resolved = resolveTimeZone(timeZone);

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: resolved,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const raw = parts.find((p) => p.type === "timeZoneName")?.value || "GMT";
    // Normalize GMT±N / UTC±N → UTC±N, GMT → UTC+0
    const normalized = raw.replace(/^GMT/i, "UTC").replace(/^UTC$/i, "UTC+0");
    return normalized.replace(/UTC([+-])0*(\d+)(?::(\d+))?$/, (_, sign, hours, mins) => {
      if (mins && mins !== "00") return `UTC${sign}${parseInt(hours, 10)}:${mins}`;
      return `UTC${sign}${parseInt(hours, 10)}`;
    });
  } catch {
    return "UTC";
  }
}

function formatDateLabel(timeZone) {
  const resolved = resolveTimeZone(timeZone);
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: resolved,
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date());
  } catch {
    return "";
  }
}

export default function Watch({
  timeZone = null,
  interpolator = d3.interpolateGreys,
  font = "futural",
  onClick,
  fixedSize,
  hideLabel = false,
  featured = false,
}) {
  const containerRef = useRef(null);
  const watchRef = useRef(null);
  const [size, setSize] = useState(fixedSize || 150);

  // If fixedSize is provided, use it directly; otherwise use ResizeObserver
  useEffect(() => {
    if (fixedSize !== undefined) {
      setSize(fixedSize);
      return;
    }

    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setSize(width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [fixedSize]);

  useEffect(() => {
    if (watchRef.current && size > 0) {
      watchRef.current.innerHTML = "";
      const {start, stop} = renderWatch(watchRef.current, timeZone, interpolator, font, size);
      start();
      return () => stop();
    }
  }, [timeZone, interpolator, font, size]);

  const isLocal = !timeZone;
  const isUtc = timeZone === "UTC";

  const timeZoneLabel = useMemo(() => {
    if (featured && isLocal) return "Local time";
    if (featured && isUtc) return "Coordinated Universal";
    if (isUtc) return "UTC";
    if (isLocal) return "Local";
    return timeZone.split("/").pop().replace(/_/g, " ");
  }, [featured, isLocal, isUtc, timeZone]);

  const eyebrowLabel = useMemo(() => {
    if (isLocal) return "Local";
    if (isUtc) return "UTC";
    return null;
  }, [isLocal, isUtc]);

  const mapsQuery = useMemo(() => {
    if (isLocal) {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop().replace(/_/g, " ");
      } catch {
        return "Local";
      }
    }
    if (isUtc) return "UTC";
    return timeZone.split("/").pop().replace(/_/g, " ");
  }, [isLocal, isUtc, timeZone]);

  const utcOffset = useMemo(() => formatUtcOffset(timeZone), [timeZone]);
  const dateLabel = useMemo(() => formatDateLabel(timeZone), [timeZone]);
  const metaLine = dateLabel ? `${dateLabel} · ${utcOffset}` : utcOffset;
  const flagTimezone = useMemo(() => {
    if (isUtc) return null;
    if (timeZone) return timeZone;
    return resolveTimeZone(null);
  }, [isUtc, timeZone]);
  const countryCode = flagTimezone ? getCountryCodeFromTimezone(flagTimezone) : null;
  const flagEmoji = countryCode ? getFlagEmoji(countryCode) : "";

  const faceClassName = ["aclock-card-face", fixedSize !== undefined ? "is-fixed" : ""]
    .filter(Boolean)
    .join(" ");

  const faceStyle =
    fixedSize !== undefined ? {"--aclock-face-size": `${fixedSize}px`} : undefined;

  const face = (
    <div
      ref={fixedSize !== undefined ? null : containerRef}
      className={faceClassName}
      style={hideLabel ? faceStyle : undefined}
    >
      <div ref={watchRef} className="aclock-card-face-inner" />
    </div>
  );

  // Detail / preview: bare face only (parent supplies card chrome)
  if (hideLabel) {
    return face;
  }

  const cardClassName = [
    "aclock-card",
    featured ? "is-featured" : "",
    !onClick ? "is-static" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (featured) {
    return (
      <div className={cardClassName} onClick={onClick} style={faceStyle}>
        {face}
        <div className="aclock-card-meta aclock-card-meta-featured">
          {eyebrowLabel && <p className="aclock-card-eyebrow">{eyebrowLabel}</p>}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="aclock-card-name"
            onClick={(e) => e.stopPropagation()}
          >
            {flagEmoji ? <span className="aclock-card-flag">{flagEmoji}</span> : null}
            <span>{timeZoneLabel}</span>
          </a>
          <p className="aclock-card-offset">{metaLine}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName} onClick={onClick} style={faceStyle}>
      {face}
      <div className="aclock-card-meta">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="aclock-card-name"
          onClick={(e) => e.stopPropagation()}
        >
          {flagEmoji ? <span className="aclock-card-flag">{flagEmoji}</span> : null}
          <span>{timeZoneLabel}</span>
        </a>
        <p className="aclock-card-offset">{utcOffset}</p>
      </div>
    </div>
  );
}
