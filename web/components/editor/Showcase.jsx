import {useRef, useEffect} from "react";
import {templates} from "./templates";
import {APack} from "./APack";
import {FiX} from "react-icons/fi";
import {paragraph} from "./paragraph";
import {splitWordsWithNewlines, positionWords} from "./text";
import "./Showcase.css";

const EXTERNAL_EXAMPLES = [
  {text: "Tree", href: "https://tree.bairui.dev/"},
  {text: "AClock", href: "/aclock/"},
  {
    text: "Sticker",
    href: "https://www.typecampus.com/fight-for-kindness-gallery-2025?pgid=maasv5d321-b22ea6e7-6be1-4b74-83e0-33c9d3d25d56",
  },
];

function Item({config, onClick}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      const words = splitWordsWithNewlines(config.text);
      positionWords(words);
      const svg = paragraph(words, {offset: false, ...config});
      const width = svg.getAttribute("width");
      const height = svg.getAttribute("height");
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.style.width = "100%";
      svg.style.height = "auto";
      ref.current.appendChild(svg);
    }
  }, [config]);

  return <div className="showcase-item" onClick={onClick} ref={ref}></div>;
}

export function Showcase({onClose, updateTemplate}) {
  const onSelectTemplate = (key) => {
    updateTemplate(key);
    onClose();
  };

  const onOpenProject = (href) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const onBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="showcase-modal-backdrop" onClick={onBackdropClick}>
      <div className="showcase-modal" role="dialog" aria-modal="true" aria-label="Example">
        <button onClick={onClose} className="showcase-modal-close" aria-label="Close example">
          <FiX size={22} color="#000" />
        </button>

        <div className="showcase-modal-body">
          <section className="showcase-section">
            <h2 className="showcase-section-title">Editor examples</h2>
            <div className="showcase-editor-grid">
              {Object.entries(templates).map(([key, template]) => (
                <Item key={key} config={template} onClick={() => onSelectTemplate(key)} />
              ))}
            </div>
          </section>

          <section className="showcase-section">
            <h2 className="showcase-section-title">External examples</h2>
            <div className="showcase-external-grid">
              {EXTERNAL_EXAMPLES.map((project) => (
                <APack
                  key={project.text}
                  text={project.text}
                  cellSize={40}
                  onClick={() => onOpenProject(project.href)}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
