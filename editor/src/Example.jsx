import "./Config.css";
import {useRef, useEffect} from "react";
import {templates} from "./templates";
import {APack} from "./APack";
import {FiX} from "react-icons/fi";
import {paragraph} from "./paragraph";
import {splitWordsWithNewlines, positionWords} from "./text";
import "./Example.css";

function Item({config, onClick}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      const words = splitWordsWithNewlines(config.text);
      positionWords(words);
      const svg = paragraph(words, config);
      const width = svg.getAttribute("width");
      const height = svg.getAttribute("height");
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.style.width = "100%";
      svg.style.height = "100%";
      ref.current.appendChild(svg);
    }
  }, [config]);

  return (
    <div className="example-item" onClick={onClick}>
      <div ref={ref}></div>
    </div>
  );
}

export function Example({style, onClose, updateTemplate, jump}) {
  const onGithub = () => {
    if (jump) {
      window.open("https://github.com/pearmini/apack", "_blank");
    }
  };

  return (
    <div style={style} className="example-panel">
      <div className="example-panel-header">
        <APack text="APack" cellSize={40} onClick={onGithub} style={{cursor: jump ? "pointer" : "default"}} />
        <button onClick={onClose} className="icon-button">
          <FiX size={22} color="#000" />
        </button>
      </div>
      <div className="example-panel-body">
        {Object.entries(templates).map(([key, template]) => (
          <Item key={key} config={template} onClick={() => updateTemplate(key)} />
        ))}
      </div>
    </div>
  );
}
