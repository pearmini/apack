import {useRef, useEffect, useState, useMemo} from "react";
import * as cm from "charmingjs";
import {measureText} from "./text";
import * as ap from "apackjs";
import "./App.css";

function paragraph(W, {cellWidth = 80, cellHeight = cellWidth} = {}) {
  // Ignore empty words, such as \n.
  const words = W.filter((d) => d.ch.trim() !== "");
  const maxX = Math.max(...words.map((d) => d.x));
  const maxY = Math.max(...words.map((d) => d.y));
  const svg = cm.svg("svg", {
    width: (maxX + 1) * cellWidth,
    height: (maxY + 1) * cellHeight,
    children: cm.svg("g", words, {
      transform: (d) => `translate(${d.x * cellWidth}, ${d.y * cellHeight})`,
      children: (d) => {
        try {
          return ap.text(d.ch, {cellWidth, cellHeight});
        } catch (e) {
          console.error("Error rendering text", e);
          return ap.text("?", {cellWidth, cellHeight});
        }
      },
    }),
  });
  return svg.render();
}

function isPrintable(ch) {
  return ch.length === 1 && ch.match(/^[\u4e00-\u9fa5a-zA-Z0-9]+$/);
}

// Input: "hello world EFG\nAB CD"
// Output: ["hello", "world", "EFG", "\n", "AB", "CD"]
function splitWordsWithNewlines(text) {
  return text.split("\n").flatMap((d, j, lines) => {
    const words = d.split(" ").map((d) => ({ch: d, id: uid()}));
    // Add a newline after each line except the last one.
    if (j < lines.length - 1) {
      words.push({ch: "\n", id: uid()});
    }
    return words;
  });
}

function positionWords(words) {
  let x = 0;
  let y = 0;
  for (const word of words) {
    word.x = x;
    word.y = y;
    x += 1;
    if (word.ch === "\n") {
      y += 1;
      x = 0;
    }
  }
}

function uid() {
  return Math.random().toString(36).substring(2, 15);
}

function App() {
  const gridInputHeight = 20;
  const ch = "中";

  const gridRef = useRef(null);
  const editorRef = useRef(null);
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);

  const [text, setText] = useState("hello world EFG\nAB CD");
  const [style, setStyle] = useState({
    fontSize: "80px",
    fontFamily: "monospace",
  });

  const {width: cellWidth, height: cellHeight} = useMemo(() => measureText(ch, style), [ch, style]);

  const [words, setWords] = useState(splitWordsWithNewlines(text));

  positionWords(words);

  const textareaValue = useMemo(() => {
    // Show \n as is. There is no need to show it as a Chinese character.
    return words.map((d) => (d.ch === "\n" ? "\n" : ch)).join("");
  }, [words]);

  const scale = useMemo(() => {
    return cellWidth / cellHeight;
  }, [cellWidth, cellHeight]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.innerHTML = "";
      canvas.appendChild(paragraph(words, {cellWidth}));
    }
  }, [words, cellWidth]);

  useEffect(() => {
    if (textareaRef.current) {
      // Center the textarea based on the size of the output,
      // not the size of the textarea, because the textarea is not visible.
      const {width, height} = measureText(textareaValue, style);
      editorRef.current.style.left = -width / 2 + "px";
      editorRef.current.style.top = -height / 2 + "px";
    }
  }, [textareaValue, style]);

  useEffect(() => {
    if (textareaRef.current) {
      const maxX = Math.max(...words.map((d) => d.x));
      const maxY = Math.max(...words.map((d) => d.y));
      // Make the size of the textarea a little bit larger than the canvas,
      // so the cursor can move properly.
      textareaRef.current.style.width = `${(maxX + 1) * cellWidth}px`;
      textareaRef.current.style.height = `${(maxY + 2) * cellHeight}px`;
    }
  }, [words, cellWidth, cellHeight]);

  const fire = (callback) => setTimeout(callback, 10);

  const onTextareaKeyDown = (e) => {
    const index = e.target.selectionStart;

    console.log("Textarea keydown", {index, value: e.target.value, key: e.key});

    // Do nothing if the user holds down the meta key.
    if (e.metaKey) return;

    if (e.key === "Backspace") {
      console.log("Textarea keydown backspace");

      // If the previous word is a newline, remove it.
      const prev = words[index - 1];
      if (prev && prev.ch === "\n") {
        console.log("Remove the previous newline");

        const newWords = [...words];
        newWords.splice(index - 1, 1);
        setWords(newWords);

        fire(() => {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(index - 1, index - 1);
        });
      } else {
        console.log("Move the cursor to the previous word");

        // Prevent add the cursor to the end of the textarea.
        textareaRef.current.blur();

        fire(() => {
          const gridInputs = editorRef.current.querySelectorAll(".grid-input");
          gridInputs[index - 1].focus();
        });
      }
    } else if (isPrintable(e.key) || e.key === " ") {
      console.log("Textarea keydown printable", "Insert a empty grid input after the current word");

      const newWords = [...words];
      const key = e.key === " " ? "" : e.key; // For space, insert an empty grid input.
      newWords.splice(index, 0, {ch: key, id: uid()});
      setWords(newWords);

      fire(() => {
        const gridInputs = editorRef.current.querySelectorAll(".grid-input");
        gridInputs[index].focus();
      });
    } else if (e.key === "Enter") {
      console.log("Textarea keydown enter", "Add a newline after the current word");

      const newWords = [...words];
      newWords.splice(index, 0, {ch: "\n", id: uid()});
      setWords(newWords);

      fire(() => {
        textareaRef.current.focus();
        // Move the cursor to the next newline.
        textareaRef.current.setSelectionRange(index + 1, index + 1);
      });
    }
  };

  // Do nothing. Dismiss warning from React.
  const onTextareaChange = (e) => {};

  const onGridInputKeyDown = (e, d, i) => {
    console.log("Grid input keydown", {index: i, value: e.target.value, key: e.key});

    if (e.key === "Backspace" && e.target.value === "") {
      console.log("Grid input backspace", "Remove the current word");

      const newWords = [...words];
      newWords.splice(i, 1);
      setWords(newWords);

      fire(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(i, i);
      });
    } else if (e.key === " ") {
      console.log("Grid input space", "Move the cursor to the next word");

      // If is a space, move the cursor to the next word.
      fire(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(i + 1, i + 1);
      });
    } else if (e.key === "Enter") {
      console.log("Grid input enter", "Add a newline after the current word");

      // Add a newline after the current word.
      const newWords = [...words];
      newWords.splice(i + 1, 0, {ch: "\n", id: uid()});
      setWords(newWords);

      fire(() => {
        // Move the cursor to the next word.
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(i + 2, i + 2);
      });
    }
  };

  const onGridInputChange = (e, d, i) => {
    console.log("Grid input change", "Update current word", {value: e.target.value, index: i});

    const newWords = [...words];
    const newValue = e.target.value;
    newWords[i] = {...newWords[i], ch: newValue};
    setWords(newWords);
  };

  const onGridInputBlur = (e, d, i) => {
    console.log("Grid input blur", "Remove current empty word", {value: e.target.value, index: i});

    // Remove current empty word when blur.
    const newWords = [...words];
    if (newWords[i].ch === "") {
      newWords.splice(i, 1);
      setWords(newWords);
    }
  };

  console.log("\n\n================= Rerendering Editor ==================\n\n", {text, words, textareaValue});

  return (
    <div className="container">
      <div className="editor" ref={editorRef}>
        <div className="canvas" ref={canvasRef}></div>
        <textarea
          className="input"
          style={{...style, transform: `scale(1, ${scale})`}}
          value={textareaValue}
          ref={textareaRef}
          onChange={onTextareaChange}
          onKeyDown={onTextareaKeyDown}
        ></textarea>
        {words.map((d, i) => (
          <input
            key={d.id}
            className="grid-input"
            style={{
              width: cellWidth,
              height: gridInputHeight,
              top: d.y * cellWidth + cellWidth,
              left: d.x * cellWidth,
            }}
            ref={gridRef}
            value={d.ch}
            onKeyDown={(e) => onGridInputKeyDown(e, d, i)}
            onChange={(e) => onGridInputChange(e, d, i)}
            onBlur={(e) => onGridInputBlur(e, d, i)}
          ></input>
        ))}
      </div>
    </div>
  );
}

export default App;
