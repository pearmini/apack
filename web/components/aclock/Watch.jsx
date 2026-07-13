import {useRef, useEffect, useState, useMemo} from "react";
import * as apack from "apackjs";
import * as d3 from "d3";
import {getFlagEmoji, getCountryCodeFromTimezone} from "./flag.js";

function renderWatch(parent, timeZone = null, interpolator = d3.interpolateGreys, font = "futural", size = 150) {
  let timer;
  const strokeWidth = 3;
  const strokeRadius = Math.max(8, size * 0.08);
  const colorScale = d3.scaleSequential(interpolator).domain([0, 24]);

  function getLuminance(color) {
    const rgb = d3.rgb(color);
    return 0.2126 * (rgb.r / 255) + 0.7152 * (rgb.g / 255) + 0.0722 * (rgb.b / 255);
  }

  function formatDigit(digit) {
    return digit.toString().padStart(2, "0");
  }

  function update() {
    let hours;
    let minutes;
    let seconds;
    let hoursNum;

    if (timeZone) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(new Date());
      hoursNum = parseInt(parts.find((p) => p.type === "hour").value, 10) % 24;
      hours = formatDigit(hoursNum);
      minutes = formatDigit(parseInt(parts.find((p) => p.type === "minute").value, 10));
      seconds = formatDigit(parseInt(parts.find((p) => p.type === "second").value, 10));
    } else {
      const now = new Date();
      hoursNum = now.getHours();
      hours = formatDigit(hoursNum);
      minutes = formatDigit(now.getMinutes());
      seconds = formatDigit(now.getSeconds());
    }

    const timeDecimal = hoursNum + parseInt(minutes, 10) / 60 + parseInt(seconds, 10) / 3600;
    const fillColor = colorScale(timeDecimal);
    const strokeColor = getLuminance(fillColor) < 0.5 ? "white" : "black";

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
      .attr("ry", strokeRadius);

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

  return {start, stop};
}

function resolveTimeZone(timeZone) {
  if (timeZone) return timeZone;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function cityLabelFromTimeZone(timeZone) {
  return timeZone.split("/").pop().replace(/_/g, " ");
}

function formatUtcOffset(timeZone) {
  const resolved = resolveTimeZone(timeZone);

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: resolved,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const raw = parts.find((p) => p.type === "timeZoneName")?.value;
    if (raw) {
      const normalized = raw.replace(/^GMT/i, "UTC").replace(/^UTC$/i, "UTC+0");
      return normalized.replace(/UTC([+-])0*(\d+)(?::(\d+))?$/, (_, sign, hours, mins) => {
        if (mins && mins !== "00") return `UTC${sign}${parseInt(hours, 10)}:${mins}`;
        return `UTC${sign}${parseInt(hours, 10)}`;
      });
    }
  } catch {
    // fall through to manual offset
  }

  try {
    const now = new Date();
    const utc = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
    const local = new Date(now.toLocaleString("en-US", {timeZone: resolved}));
    const offsetMin = Math.round((local - utc) / 60000);
    const sign = offsetMin >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMin);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    return mins ? `UTC${sign}${hours}:${String(mins).padStart(2, "0")}` : `UTC${sign}${hours}`;
  } catch {
    return "";
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
  featured = false,
}) {
  const containerRef = useRef(null);
  const watchRef = useRef(null);
  const [size, setSize] = useState(150);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!watchRef.current || size <= 0) return;
    watchRef.current.innerHTML = "";
    const {start, stop} = renderWatch(watchRef.current, timeZone, interpolator, font, size);
    start();
    return () => stop();
  }, [timeZone, interpolator, font, size]);

  const isLocal = !timeZone;
  const isUtc = timeZone === "UTC";

  const timeZoneLabel = useMemo(() => {
    if (featured && isLocal) return "Local time";
    if (featured && isUtc) return "Coordinated Universal";
    if (isUtc) return "UTC";
    if (isLocal) return "Local";
    return cityLabelFromTimeZone(timeZone);
  }, [featured, isLocal, isUtc, timeZone]);

  const eyebrowLabel = isLocal ? "Local" : isUtc ? "UTC" : null;

  const mapsQuery = useMemo(() => {
    if (isLocal) {
      try {
        return cityLabelFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      } catch {
        return "Local";
      }
    }
    if (isUtc) return "UTC";
    return cityLabelFromTimeZone(timeZone);
  }, [isLocal, isUtc, timeZone]);

  const utcOffset = useMemo(() => formatUtcOffset(timeZone), [timeZone]);
  const dateLabel = useMemo(() => formatDateLabel(timeZone), [timeZone]);
  const metaText = featured && dateLabel ? `${dateLabel} · ${utcOffset}` : utcOffset || dateLabel;

  const flagTimezone = useMemo(() => {
    if (isUtc) return null;
    return timeZone || resolveTimeZone(null);
  }, [isUtc, timeZone]);
  const flagEmoji = flagTimezone
    ? getFlagEmoji(getCountryCodeFromTimezone(flagTimezone))
    : "";

  const cardClassName = [
    "aclock-card",
    featured ? "is-featured" : "",
    !onClick ? "is-static" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClassName} onClick={onClick}>
      <div ref={containerRef} className="aclock-card-face">
        <div ref={watchRef} className="aclock-card-face-inner" />
      </div>
      <div className={`aclock-card-meta${featured ? " aclock-card-meta-featured" : ""}`}>
        {featured && eyebrowLabel ? <p className="aclock-card-eyebrow">{eyebrowLabel}</p> : null}
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
        {metaText ? <p className="aclock-card-offset">{metaText}</p> : null}
      </div>
    </div>
  );
}
