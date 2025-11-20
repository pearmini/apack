import {useRef, useEffect} from "react";
import * as apack from "apackjs";
import * as d3 from "d3";
import {getFlagEmoji, getCountryCodeFromTimezone} from "./flag.js";

function renderWatch(parent, timeZone = null) {
  let timer;
  const size = 150;
  const strokeWidth = 3;
  const strokeRadius = strokeWidth * 0;

  function formatDigit(digit) {
    return digit.toString().padStart(2, "0");
  }

  function update() {
    let hours, minutes, seconds;
    if (timeZone) {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(new Date());
      hours = formatDigit(parseInt(parts.find((p) => p.type === "hour").value));
      minutes = formatDigit(parseInt(parts.find((p) => p.type === "minute").value));
      seconds = formatDigit(parseInt(parts.find((p) => p.type === "second").value));
    } else {
      const now = new Date();
      hours = formatDigit(now.getHours());
      minutes = formatDigit(now.getMinutes());
      seconds = formatDigit(now.getSeconds());
    }

    const digits = apack
      .text(`${hours}${minutes}${seconds}`, {
        cellSize: size,
        word: {
          strokeWidth,
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
      .attr("fill", "transparent")
      .attr("stroke", "black")
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

export default function Watch({timeZone = null}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      const {start, stop} = renderWatch(ref.current, timeZone);
      start();
      return () => stop();
    }
  }, [timeZone]);

  const timeZoneLabel = timeZone ? timeZone.split("/").pop().replace(/_/g, " ") : null;
  const countryCode = timeZone ? getCountryCodeFromTimezone(timeZone) : null;
  const flagEmoji = countryCode ? getFlagEmoji(countryCode) : "";

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <div ref={ref}></div>
      {timeZoneLabel && (
        <div
          style={{
            textAlign: "center",
            marginTop: "8px",
            fontSize: "12px",
            color: "#333",
            maxWidth: "150px",
            wordWrap: "break-word",
          }}
        >
          {flagEmoji} {timeZoneLabel}
        </div>
      )}
    </div>
  );
}
