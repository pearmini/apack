import {Routes, Route} from "react-router-dom";
import "./App.css";
import HomePage from "./HomePage.jsx";
import WatchPage from "./WatchPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/*" element={<WatchPage />} />
    </Routes>
  );
}

export default App;
