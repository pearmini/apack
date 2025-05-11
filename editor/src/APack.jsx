import * as apack from "apackjs";
import {useEffect, useRef} from "react";

export function APack({text, cellSize, onClick, onMouseEnter, onMouseLeave, style = {}, className = ""}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      const svg = apack.text(text, {cellSize, word: {strokeWidth: 1.5}}).render();
      svg.style.backgroundColor = '#fefaf1';
      ref.current.appendChild(svg);
    }
  }, [text]);

  return (
    <div
      style={{
        padding: "2px",
        cursor: "pointer",
        border: "1.5px solid black",
        ...style,
      }}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span ref={ref}></span>
    </div>
  );
}
