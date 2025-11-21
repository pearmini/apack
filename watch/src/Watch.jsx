import {useRef, useEffect, useState} from "react";
import * as apack from "apackjs";
import * as d3 from "d3";
import {MapPin} from "lucide-react";
import {getFlagEmoji, getCountryCodeFromTimezone} from "./flag.js";

function renderWatch(parent, timeZone = null, interpolator = d3.interpolateGreys, font = "futural", size = 150) {
  let timer;
  const strokeWidth = 3;
  const strokeRadius = strokeWidth * 0;

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
    const rectStrokeColor = "black";

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
      .attr("stroke", rectStrokeColor)
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

export default function Watch({timeZone = null, interpolator = d3.interpolateGreys, font = "futural", onClick, fixedSize, hideLabel = false}) {
  const containerRef = useRef(null);
  const watchRef = useRef(null);
  const [size, setSize] = useState(fixedSize || 150);
  const [isHovered, setIsHovered] = useState(false);

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

  const timeZoneLabel = timeZone ? timeZone.split("/").pop().replace(/_/g, " ") : null;
  const countryCode = timeZone ? getCountryCodeFromTimezone(timeZone) : null;
  const flagEmoji = countryCode ? getFlagEmoji(countryCode) : "";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "start",
        width: "100%",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        ref={fixedSize ? null : containerRef}
        style={{
          width: fixedSize ? `${fixedSize}px` : "100%",
          height: fixedSize ? `${fixedSize}px` : "auto",
          paddingTop: fixedSize ? 0 : "100%",
          position: "relative",
        }}
      >
        <div
          ref={watchRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        ></div>
      </div>
      {timeZoneLabel && !hideLabel && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(timeZoneLabel)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            textAlign: "center",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            color: "#1b1e23",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.25rem",
            cursor: "pointer",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            setIsHovered(true);
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            setIsHovered(false);
            e.stopPropagation();
          }}
        >
          {isHovered && flagEmoji ? <span>{flagEmoji} </span> : ""}
          <span>{timeZoneLabel}</span>
          {isHovered && (
            <MapPin
              className="inline-block"
              style={{
                width: "0.875rem",
                height: "0.875rem",
                flexShrink: 0,
              }}
            />
          )}
        </a>
      )}
    </div>
  );
}
