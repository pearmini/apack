import "./Config.css";
import {FONT_FAMILIES} from "apackjs";
import {SketchPicker} from "react-color";
import {useState, useRef, useEffect} from "react";
import {templates} from "./templates";
import {APack} from "./APack";
import {FiX, FiSave, FiFile, FiUpload, FiDownload} from "react-icons/fi";

const templateSchema = {
  key: "template",
  name: "Template",
  type: "select",
  options: ["None", ...Object.keys(templates)],
};

const schemas = [
  {
    key: "font",
    name: "Font",
    type: "select",
    options: FONT_FAMILIES,
  },
  {key: "fontSize", name: "Font Size", type: "number"},
  {key: "cursive", name: "Cursive", type: "boolean"},
  {key: "padding", name: "Padding", type: "number"},
  {key: "word.strokeWidth", name: "Text Stroke Width", type: "number"},
  {key: "word.stroke", name: "Text Stroke", type: "color"},
  {key: "word.fill", name: "Text Fill", type: "color"},
  {key: "background.fill", name: "Grid Fill", type: "color"},
  {key: "canvas", name: "Background Fill", type: "color"},
];

function ColorInput({value, onChange}) {
  const [showPicker, setShowPicker] = useState(false);
  const [position, setPosition] = useState({x: 0, y: 0});
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    setPosition({
      x: rect.left,
      y: rect.bottom,
    });
    setShowPicker(true);
  };

  return (
    <div style={{position: "relative"}}>
      <div style={{backgroundColor: value}} onClick={handleClick} className="color-input" />
      {showPicker && (
        <div
          ref={pickerRef}
          style={{
            position: "fixed",
            left: position.x,
            top: position.y,
            zIndex: 1000,
          }}
        >
          <SketchPicker
            color={value}
            onChangeComplete={(color) => {
              onChange(color.hex);
            }}
          />
        </div>
      )}
    </div>
  );
}

function Input({type, value, onChange, options}) {
  if (type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (type === "color") {
    return <ColorInput value={value} onChange={onChange} />;
  }

  if (type === "boolean") {
    return (
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        style={{width: 20, height: 20}}
      />
    );
  }

  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />;
}

export function Config({
  style,
  onClose,
  updateValue,
  getValue,
  updateTemplate,
  getTemplate,
  onSave,
  onNew,
  onUpload,
  onDownload,
}) {
  const onGithub = () => {
    window.open("https://github.com/pearmini/apack", "_blank");
  };

  return (
    <div style={style} className="config-panel">
      <div className="config-panel-header">
        <APack text="APack" cellSize={40} onClick={onGithub} />
        <button onClick={onClose} className="icon-button">
          <FiX size={22} color="#000" />
        </button>
      </div>

      <div className="config-panel-body">
        {/* <div className="config-panel-item">
          <span>{templateSchema.name}</span>
          <Input
            type={templateSchema.type}
            key={templateSchema.key}
            options={templateSchema.options}
            value={getTemplate()}
            onChange={(value) => updateTemplate(value)}
          />
        </div> */}
        {schemas.map((schema) => (
          <div key={schema.key} className="config-panel-item">
            <span>{schema.name}</span>
            <Input
              type={schema.type}
              key={schema.key}
              value={getValue(schema.key)}
              onChange={(value) => updateValue(schema.key, value)}
              options={schema.options}
            />
          </div>
        ))}
      </div>

      <div className="config-panel-toolbar">
        <button onClick={onSave} className="icon-button">
          <FiSave size={22} color="#000" />
        </button>
        <button onClick={onNew} className="icon-button">
          <FiFile size={22} color="#000" />
        </button>
        <button onClick={onUpload} className="icon-button">
          <FiUpload size={22} color="#000" />
        </button>
        <button onClick={onDownload} className="icon-button">
          <FiDownload size={22} color="#000" />
        </button>
      </div>
    </div>
  );
}
