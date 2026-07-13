import * as apack from "apackjs";
import {useEffect, useRef} from "react";

export function APack({
  text,
  cellSize,
  onClick,
  onMouseEnter,
  onMouseLeave,
  bordered = true,
  style = {},
  className = "",
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      const svg = apack.text(text, {cellSize, word: {strokeWidth: 1.5}}).render();
      svg.style.backgroundColor = "#fefaf1";
      ref.current.appendChild(svg);
    }
  }, [text, cellSize]);

  return (
    <div
      style={{
        padding: bordered ? "2px" : 0,
        cursor: onClick ? "pointer" : "default",
        border: bordered ? "1.5px solid black" : "none",
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
