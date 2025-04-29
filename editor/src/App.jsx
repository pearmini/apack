import {useRef, useEffect, useState, useMemo} from "react";
import * as cm from "charmingjs";
import {measureText} from "./text";
import * as ap from "apackjs";
import "./App.css";

function paragraph(text) {
  const words = text.split(" ");
  const svg = cm.svg("svg", {
    width: words.length * 80,
    children: cm.svg("g", words, {
      transform: (d, i) => `translate(${i * 80}, 0)`,
      children: (d) => ap.text(d),
    }),
  });
  return svg.render();
}

function isPrintable(ch) {
  return ch.length === 1 && ch.match(/^[\u4e00-\u9fa5a-zA-Z0-9]+$/);
}

function App() {
  const gridInputHeight = 20;
  const ch = "中";

  const gridRef = useRef(null);
  const editorRef = useRef(null);
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);

  const [text, setText] = useState("hello world AB CD");
  const [style, setStyle] = useState({
    fontSize: "80px",
    fontFamily: "monospace",
  });

  const {width: cellWidth, height: cellHeight} = useMemo(() => measureText(ch, style), [ch, style]);

  const words = useMemo(() => {
    return text.split(" ").map((d, i) => ({ch: d, x: i, y: 0}));
  }, [text]);

  const textareaValue = useMemo(() => {
    return words
      .map(() => ch)
      .join("")
      .trim(); // Remove the trailing space.
  }, [words]);

  const scale = useMemo(() => {
    return cellWidth / cellHeight;
  }, [cellWidth, cellHeight]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.innerHTML = "";
      canvas.appendChild(paragraph(text));
    }
  }, [text]);

  const join = (words) => words.map((d) => d.ch).join(" ");

  console.log({words, text});

  return (
    <div className="container">
      <div className="editor" ref={editorRef}>
        <div className="canvas" ref={canvasRef}></div>
        <textarea
          className="input"
          style={{...style, transform: `scale(1, ${scale})`}}
          value={textareaValue}
          ref={textareaRef}
          onChange={() => {}} /* Dismiss warning from React. */
          onKeyDown={(e) => {
            const index = e.target.selectionStart;
            if (e.metaKey) return;
            if (e.key === "Backspace") {
              setTimeout(() => {
                const gridInputs = editorRef.current.querySelectorAll(".grid-input");
                gridInputs[index - 1].focus();
              }, 10);
            } else if (isPrintable(e.key)) {
              const newWords = [...words];
              const old = words[index];
              const deleteCount = old && old.ch === "" ? 1 : 0;
              newWords.splice(index, deleteCount, {ch: e.key, x: index, y: 0});
              const newText = join(newWords);
              setText(newText);
              setTimeout(() => {
                const gridInputs = editorRef.current.querySelectorAll(".grid-input");
                gridInputs[index].focus();
              }, 10);
            } else if (e.key === " ") {
              const newWords = [...words];
              newWords.splice(index, 0, {ch: "", x: index, y: 0});
              const newText = join(newWords);
              setText(newText);
              setTimeout(() => {
                const gridInputs = editorRef.current.querySelectorAll(".grid-input");
                gridInputs[index].focus();
              }, 10);
            }
          }}
        ></textarea>
        {words.map((d, i) => (
          <input
            key={i}
            className="grid-input"
            style={{
              width: cellWidth,
              height: gridInputHeight,
              top: d.y * cellWidth + cellWidth,
              left: d.x * cellWidth,
            }}
            ref={gridRef}
            value={d.ch}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && e.target.value === "") {
                const newWords = [...words];
                newWords.splice(i, 1);
                const newText = join(newWords);
                setText(newText);
                setTimeout(() => {
                  textareaRef.current.focus();
                  textareaRef.current.setSelectionRange(i, i);
                }, 10);
              } else if (e.key === " ") {
                // If is a space, move the cursor to the next word.
                setTimeout(() => {
                  textareaRef.current.focus();
                  textareaRef.current.setSelectionRange(i + 1, i + 1);
                }, 10);
              }
            }}
            onChange={(e) => {
              const newWords = [...words];
              const newValue = e.target.value.trim();
              newWords[i] = {...newWords[i], ch: newValue};
              const newText = join(newWords);
              setText(newText);
            }}
          ></input>
        ))}
      </div>
    </div>
  );
}

export default App;
