import {useRef, useEffect, useState, useMemo} from "react";
import {measureText, splitWordsWithNewlines, uid, positionWords} from "./text";
import {logEditor} from "./log";
import {templates} from "./templates";
import {Config} from "./Config";
import {Showcase} from "./Showcase";
import {APack} from "./APack";
import {paragraph} from "./paragraph";
import {downloadPNG, downloadSVG} from "./download";
import "./App.css";

function isPrintable(ch) {
  return ch.length === 1 && ch.match(/^[\u4e00-\u9fa5a-zA-Z0-9]+$/);
}

function deepMerge(a, b) {
  const result = {...a};
  for (const key in b) {
    if (typeof b[key] === "object" && b[key] !== null) {
      result[key] = deepMerge(a[key], b[key]);
    } else {
      result[key] = b[key];
    }
  }
  return result;
}

function createDefaultConfig() {
  return {
    text: "",
    fontSize: "80",
    font: "futural",
    padding: 0,
    canvas: "transparent",
    cursive: false,
    autoWrap: true,
    wrapWidth: 1000,
    word: {
      fill: "transparent",
      strokeWidth: 1.5,
      stroke: "#000000",
    },
    grid: {
      stroke: "transparent",
    },
    background: {
      fill: "transparent",
    },
  };
}

function getConfig() {
  const apack = localStorage.getItem("apack");
  return apack ? JSON.parse(apack) : createDefaultConfig();
}

function isDarkColor(color) {
  // Handle transparent and named colors
  if (color === "transparent" || !color) return false;

  // Convert hex to RGB
  let r, g, b;
  if (color.startsWith("#")) {
    const hex = color.substring(1);
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (color.startsWith("rgb")) {
    const rgb = color.match(/\d+/g);
    [r, g, b] = rgb.map(Number);
  } else {
    return false; // For other color formats, default to light
  }

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function App() {
  const hideConfig = new URLSearchParams(window.location.search).get("hide") === "true";
  const placeHolder = new URLSearchParams(window.location.search).get("placeholder") || "How are you ?";

  const gridInputHeight = 20;
  const ch = "中";
  const panelWidth = 300;

  const gridRef = useRef(null);
  const editorRef = useRef(null);
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);
  const editorContainerRef = useRef(null);

  const [showConfig, setShowConfig] = useState(false);
  const [showShowcase, setShowShowcase] = useState(false);
  const [config, setConfig] = useState(getConfig());
  const [containerWidth, setContainerWidth] = useState(Infinity);

  const text = config.text;

  const style = useMemo(() => {
    const isDark = isDarkColor(config.canvas);
    return {
      fontSize: `${config.fontSize}px`,
      fontFamily: "monospace",
      caretColor: isDark ? "white" : "black",
    };
  }, [config.fontSize, config.canvas]);

  const {width: cellWidth, height: cellHeight} = useMemo(() => measureText(ch, style), [ch, style]);

  const cols = config.autoWrap ? Math.floor(Math.min(containerWidth, +config.wrapWidth) / cellWidth) : Infinity;

  const placeholderWords = useMemo(
    () => positionWords(splitWordsWithNewlines(placeHolder), {cols}),
    [placeHolder, cols],
  );

  const [words, setWords] = useState(splitWordsWithNewlines(text));

  const historyRef = useRef([splitWordsWithNewlines(text)]);
  const historyIndexRef = useRef(0);
  const isUndoingRef = useRef(false);

  positionWords(words, {cols});

  const textareaValue = useMemo(() => {
    // Show \n as is. There is no need to show it as a Chinese character.
    return words.map((d) => (d.ch === "\n" ? "\n" : ch)).join("");
  }, [words]);

  const scale = useMemo(() => {
    return cellWidth / cellHeight;
  }, [cellWidth, cellHeight]);

  const computeEditorPosition = () => {
    if (!textareaRef.current || !editorContainerRef.current) return;

    const isEmpty = words.length === 0;
    const W = isEmpty ? placeholderWords : words;
    if (W.length === 0) return;

    // Match paragraph.js: ignore empty words / newlines so centering uses the
    // painted SVG bounds. Counting \n cells made examples look left and high.
    const content = W.filter((d) => d.ch.trim() !== "");
    const bounds = content.length > 0 ? content : W;
    const maxX = Math.max(...bounds.map((d) => d.x));
    const maxY = Math.max(...bounds.map((d) => d.y));
    const lastWord = W[W.length - 1];
    const offset = lastWord && lastWord.ch === "\n" ? 1 : 0;

    const visualWidth = (maxX + 1) * cellWidth;
    const visualHeight = (maxY + 1) * cellHeight * scale;
    // Extra row for the caret after a trailing newline (not part of the SVG).
    const height = visualHeight + (offset ? cellHeight * scale : 0);

    const container = editorContainerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const marginLeft = visualWidth < containerWidth ? (containerWidth - visualWidth) / 2 : 10;
    const marginTop = Math.max(
      visualHeight < containerHeight ? (containerHeight - visualHeight) / 2 : 100,
      100,
    );

    editorRef.current.style.top = "0px";
    editorRef.current.style.left = "0px";
    editorRef.current.style.marginLeft = marginLeft + "px";
    editorRef.current.style.marginTop = marginTop + "px";
    editorRef.current.style.marginBottom = "200px";
    editorRef.current.style.marginRight = "200px";
    editorRef.current.style.width = visualWidth + "px";
    editorRef.current.style.height = height + "px";
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.innerHTML = "";
      const isEmpty = words.length === 0;
      canvas.appendChild(
        paragraph(isEmpty ? placeholderWords : words, {
          ...config,
          cellWidth,
          ...(isEmpty ? {word: {stroke: "#757575", strokeWidth: 1.5}} : {}),
        }),
      );
    }
  }, [words, cellWidth, config, cols]);

  // When enter the page, focus on the textarea.
  useEffect(() => {
    if (textareaRef.current) {
      // Move the cursor to the end of the textarea.
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaValue.length, textareaValue.length);
    }
  }, []);

  useEffect(() => {
    computeEditorPosition();
  }, [words, cellWidth, cellHeight, cols, containerWidth]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Track container width so cols (and centering) react to window resize.
  useEffect(() => {
    if (!editorContainerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    resizeObserver.observe(editorContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (showShowcase) setShowShowcase(false);
      else if (showConfig) setShowConfig(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showShowcase, showConfig]);

  useEffect(() => {
    if (textareaRef.current) {
      const isEmpty = words.length === 0;
      const W = isEmpty ? placeholderWords : words;
      const maxX = Math.max(...W.map((d) => d.x));
      const maxY = Math.max(...W.map((d) => d.y));
      const lastWord = W[W.length - 1];

      // If the last word is a newline, add an offset to the height.
      const offset = lastWord && lastWord.ch === "\n" ? 1 : 0;

      // Make the size of the textarea a little bit larger than the canvas,
      // so the cursor can move properly.
      textareaRef.current.style.width = `${(maxX + 1) * cellWidth}px`;
      textareaRef.current.style.height = `${(maxY + 1 + offset) * cellHeight}px`;
    }
  }, [words, cellWidth, cellHeight, cols]);

  const fire = (callback) => setTimeout(callback, 10);

  const setWordsWithHistory = (newWords) => {
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(newWords);
    historyIndexRef.current = historyRef.current.length - 1;
    setWords(newWords);
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      isUndoingRef.current = true;
      historyIndexRef.current--;
      setWords(historyRef.current[historyIndexRef.current]);
      fire(() => {
        isUndoingRef.current = false;
        textareaRef.current.focus();
        const len = historyRef.current[historyIndexRef.current].length;
        textareaRef.current.setSelectionRange(len, len);
      });
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoingRef.current = true;
      historyIndexRef.current++;
      setWords(historyRef.current[historyIndexRef.current]);
      fire(() => {
        isUndoingRef.current = false;
        textareaRef.current.focus();
        const len = historyRef.current[historyIndexRef.current].length;
        textareaRef.current.setSelectionRange(len, len);
      });
    }
  };

  // word.fill => {word: {fill: value}}
  const updateConfig = (key, value) => {
    const keys = key.split(".");
    const obj = {};
    let current = obj;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      current[key] = i === keys.length - 1 ? value : {};
      current = current[key];
    }
    setConfig(deepMerge(config, obj));
  };

  // word.fill => {word: {fill: value}}
  const getValue = (key) => {
    try {
      const keys = key.split(".");
      const value = keys.reduce((acc, key) => acc[key], config);
      return value;
    } catch (e) {
      return undefined;
    }
  };

  const updateTemplate = (value) => {
    if (value !== "None" && templates[value]) {
      loadConfig(templates[value]);
    }
  };

  const joinWords = (W) => {
    const words = W.filter((d) => d.ch !== "").map((d) => (d.ch !== "\n" && d.ch !== " " ? d.ch.trim() : d.ch));
    let text = "";
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prev = words[i - 1];
      if (i === 0 || word === "\n" || (prev && prev === "\n")) text += word;
      else text += " " + word;
    }
    return text;
  };

  const loadConfig = (config) => {
    setConfig(config);
    const newWords = splitWordsWithNewlines(config.text);
    setWords(newWords);
    historyRef.current = [newWords];
    historyIndexRef.current = 0;
  };

  const onSave = () => {
    const text = joinWords(words);
    const configString = JSON.stringify({...config, text});
    localStorage.setItem("apack", configString);
  };

  const onNew = () => {
    const config = createDefaultConfig();
    loadConfig(config);
  };

  const onUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      file.text().then((text) => {
        try {
          loadConfig(JSON.parse(text));
        } catch {
          // Ignore invalid JSON uploads.
        }
      });
    };
    input.click();
  };

  const onDownload = () => {
    const text = joinWords(words);
    const configString = JSON.stringify({...config, text});
    const blob = new Blob([configString], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const time = new Date().toISOString().replace(/[-:Z]/g, "");
    a.href = url;
    a.download = `apack-${time}.json`;
    a.click();
  };

  // If the target is not the editor, focus on the textarea.
  const onClickEditorContainer = (e) => {
    if (editorRef.current && !editorRef.current.contains(e.target)) {
      textareaRef.current.focus();
    }
  };

  const onTextareaKeyDown = (e) => {
    const index = e.target.selectionStart;
    const endSelection = e.target.selectionEnd;

    logEditor("Textarea keydown", {index, endSelection, value: e.target.value, key: e.key});

    if ((e.metaKey || e.ctrlKey) && e.key === "c") {
      e.preventDefault();
      const selected = endSelection > index ? words.slice(index, endSelection) : words;
      navigator.clipboard.writeText(joinWords(selected));
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "x") {
      e.preventDefault();
      if (endSelection > index) {
        navigator.clipboard.writeText(joinWords(words.slice(index, endSelection)));
        const newWords = [...words];
        newWords.splice(index, endSelection - index);
        setWordsWithHistory(newWords);
        fire(() => {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(index, index);
        });
      }
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key === "v") {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const pasted = splitWordsWithNewlines(text);
        const newWords = [...words];
        const deleteCount = endSelection > index ? endSelection - index : 0;
        newWords.splice(index, deleteCount, ...pasted);
        setWordsWithHistory(newWords);
        fire(() => {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(index + pasted.length, index + pasted.length);
        });
      });
      return;
    }

    // Do nothing if the user holds down the meta key.
    if (e.metaKey) return;

    // Ignore non-content keys (arrows, Tab, Escape, Alt/Option, Shift, F-keys, etc.)
    // so that a selection is never accidentally wiped by a key that doesn't type anything.
    if (!isPrintable(e.key) && e.key !== " " && e.key !== "Backspace" && e.key !== "Enter") return;

    const newWords = [...words];

    // If the user selects a part of the text, remove it.
    if (endSelection > index) {
      newWords.splice(index, endSelection - index);

      fire(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(index, index);
      });

      // Only remove the current word when backspace, do not enter the delete mode.
      if (e.key === "Backspace") {
        setWordsWithHistory(newWords);
        return;
      }
    }

    if (e.key === "Backspace") {
      logEditor("Textarea keydown backspace");

      // If the previous word is a newline, remove it.
      const prev = words[index - 1];
      if (prev && prev.ch === "\n") {
        logEditor("Remove the previous newline");

        newWords.splice(index - 1, 1);

        fire(() => {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(index - 1, index - 1);
        });
      } else {
        logEditor("Move the cursor to the previous word");

        // Prevent add the cursor to the end of the textarea.
        textareaRef.current.blur();

        fire(() => {
          const gridInputs = editorRef.current.querySelectorAll(".grid-input");
          const prev = gridInputs[index - 1];
          if (prev) prev.focus();
          else textareaRef.current.focus();
        });
      }
    } else if (isPrintable(e.key) || e.key === " ") {
      logEditor("Textarea keydown printable", "Insert a empty grid input after the current word");

      const key = e.key === " " ? "" : e.key; // For space, insert an empty grid input.
      newWords.splice(index, 0, {ch: key, id: uid()});

      fire(() => {
        const gridInputs = editorRef.current.querySelectorAll(".grid-input");
        gridInputs[index].focus();
      });
    } else if (e.key === "Enter") {
      logEditor("Textarea keydown enter", "Add a newline after the current word");

      newWords.splice(index, 0, {ch: "\n", id: uid()});

      fire(() => {
        textareaRef.current.focus();
        // Move the cursor to the next newline.
        textareaRef.current.setSelectionRange(index + 1, index + 1);
      });
    }

    setWordsWithHistory(newWords);
  };

  // Do nothing. Dismiss warning from React.
  const onTextareaChange = (e) => {};

  const onGridInputKeyDown = (e, d, i) => {
    logEditor("Grid input keydown", {index: i, value: e.target.value, key: e.key});

    if (e.key === "Backspace" && e.target.value === "") {
      logEditor("Grid input backspace", "Remove the current word");

      const newWords = [...words];
      newWords.splice(i, 1);
      setWordsWithHistory(newWords);

      fire(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(i, i);
      });
    } else if (e.key === " ") {
      logEditor("Grid input space", "Move the cursor to the next word");

      // If is a space, move the cursor to the next word.
      fire(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(i + 1, i + 1);
      });
    } else if (e.key === "Enter") {
      logEditor("Grid input enter", "Add a newline after the current word");

      // Add a newline after the current word.
      const newWords = [...words];
      newWords.splice(i + 1, 0, {ch: "\n", id: uid()});
      setWordsWithHistory(newWords);

      fire(() => {
        // Move the cursor to the next word.
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(i + 2, i + 2);
      });
    }
  };

  const onGridInputChange = (e, d, i) => {
    logEditor("Grid input change", "Update current word", {value: e.target.value, index: i});

    const newWords = [...words];
    const newValue = e.target.value;
    newWords[i] = {...newWords[i], ch: newValue};
    setWordsWithHistory(newWords);
  };

  const onGridInputBlur = (e, d, i) => {
    logEditor("Grid input blur", "Remove current empty word", {value: e.target.value, index: i});

    if (isUndoingRef.current) return;

    // Remove current empty word when blur.
    const newWords = [...words];
    if (newWords[i].ch === "") {
      newWords.splice(i, 1);
      setWordsWithHistory(newWords);
    }
  };

  const onDownloadPNG = () => {
    const svg = canvasRef.current?.querySelector("svg");
    if (!svg) return;
    const time = new Date().toISOString().replace(/[-:Z]/g, "");
    downloadPNG(`apack-${time}`, svg);
  };

  const onDownloadSVG = () => {
    const svg = canvasRef.current?.querySelector("svg");
    if (!svg) return;
    const time = new Date().toISOString().replace(/[-:Z]/g, "");
    downloadSVG(`apack-${time}`, svg);
  };

  const onOpenGithub = () => {
    window.open("https://github.com/pearmini/apack", "_blank");
  };

  logEditor("\n\n================= Rerendering Editor ==================\n\n", {text, words, textareaValue});

  return (
    <div className="editor-app">
      <div className="editor-top-bar">
        <div className="editor-top-bar-brand">
          <APack text="APack" cellSize={52} bordered={false} />
          <div className="editor-top-bar-tagline">
            <div className="editor-top-bar-divider" aria-hidden="true" />
            <APack text="Write English like Chinese" cellSize={52} bordered={false} />
          </div>
        </div>

        <div className="editor-top-bar-actions">
          {!hideConfig && (
            <div className="editor-top-bar-tools">
              <div className="editor-top-bar-group">
                <APack text="Config" cellSize={40} onClick={() => setShowConfig(true)} />
                <APack text="Save" cellSize={40} onClick={onSave} />
                <APack text="New" cellSize={40} onClick={onNew} />
                <APack text="Upload" cellSize={40} onClick={onUpload} />
                <APack text="Download" cellSize={40} onClick={onDownload} />
                {textareaValue && (
                  <>
                    <APack text="PNG" cellSize={40} onClick={onDownloadPNG} />
                    <APack text="SVG" cellSize={40} onClick={onDownloadSVG} />
                  </>
                )}
              </div>
              <div className="editor-top-bar-divider" aria-hidden="true" />
            </div>
          )}
          <div className="editor-top-bar-group">
            <APack text="Example" cellSize={40} onClick={() => setShowShowcase(true)} />
            {!hideConfig && <APack text="Github" cellSize={40} onClick={onOpenGithub} />}
          </div>
        </div>
      </div>

      <div className="editor-body">
        {showConfig && (
          <Config
            style={{width: panelWidth, height: "100%"}}
            onClose={() => setShowConfig(false)}
            updateValue={updateConfig}
            getValue={getValue}
          />
        )}
        <div
          className="editor-container"
          ref={editorContainerRef}
          onClick={onClickEditorContainer}
        >
          <div className="editor" ref={editorRef}>
            <div className="canvas" ref={canvasRef}></div>
            <textarea
              className="input"
              style={{
                ...style,
                lineHeight: `${cellHeight}px`,
                padding: 0,
                transform: `scale(1, ${scale})`,
              }}
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
      </div>

      {showShowcase && (
        <Showcase onClose={() => setShowShowcase(false)} updateTemplate={updateTemplate} />
      )}
    </div>
  );
}

export default App;
