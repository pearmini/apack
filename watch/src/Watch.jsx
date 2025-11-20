import {useRef, useEffect} from "react";
import * as apack from "apackjs";
import * as d3 from "d3";
import {getFlagEmoji, getCountryCodeFromTimezone} from "./flag.js";

function renderWatch(parent, timeZone = null, interpolator = d3.interpolateGreys, font = "futural") {
  let timer;
  const size = 150;
  const strokeWidth = 3;
  const strokeRadius = strokeWidth * 0;

  // Create a sequential color scale: earlier = lighter, later = darker
  // Maps 0-24 hours to light-dark colors
  // Do not use 24 hours, because it will be too dark
  const colorScale = d3.scaleSequential(interpolator).domain([0, 28]); // 0 hours = light, 24 hours = dark

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

    const svg = d3.create("svg").attr("width", size).attr("height", size);

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

export default function Watch({timeZone = null, interpolator = d3.interpolateGreys, font = "futural"}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      const {start, stop} = renderWatch(ref.current, timeZone, interpolator, font);
      start();
      return () => stop();
    }
  }, [timeZone, interpolator, font]);

  const timeZoneLabel = timeZone ? timeZone.split("/").pop().replace(/_/g, " ") : null;
  const countryCode = timeZone ? getCountryCodeFromTimezone(timeZone) : null;
  const flagEmoji = countryCode ? getFlagEmoji(countryCode) : "";

  return (
    <div className="flex flex-col items-center">
      <div ref={ref}></div>
      {timeZoneLabel && (
        <div className="text-center mt-2 text-sm text-gray-800 max-w-[150px] break-words">
          {/* {flagEmoji} */}
          {timeZoneLabel}
        </div>
      )}
    </div>
  );
}
