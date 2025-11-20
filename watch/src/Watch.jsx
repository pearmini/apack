import {useRef, useEffect} from "react";
import * as apack from "apackjs";
import * as d3 from "d3";

function renderWatch(parent) {
  let timer;
  const size = 150;
  const strokeWidth = 3;
  const strokeRadius = strokeWidth * 2;

  function formatDigit(digit) {
    return digit.toString().padStart(2, "0");
  }

  function update() {
    const now = new Date();
    // const hours = formatDigit(now.getUTCHours());
    // const minutes = formatDigit(now.getUTCMinutes());
    // const seconds = formatDigit(now.getUTCSeconds());
    const hours = formatDigit(now.getHours());
    const minutes = formatDigit(now.getMinutes());
    const seconds = formatDigit(now.getSeconds());

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

export default function Watch() {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      const {start, stop} = renderWatch(ref.current);
      start();
      return () => stop();
    }
  }, []);

  return <div ref={ref}></div>;
}
