import "./App.css";
import { useEffect, useState } from "react";
import Main from "./Components/Main";
import Resource from "./Components/Resource";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import FileContainer from "./Components/FileContainer";

// import Captcha from "captcha-image";

function useAudio() {
  // const [audio, setAudio] = useState({
  //   sound: ctx.createBufferSource(),
  //   ctx: ctx,
  // });
  const [audio] = useState(new Audio());
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing]);

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  });

  return [toggle];
}

function App() {
  // getFile();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/resource" element={<Resource />} />
      </Routes>
    </Router>
  );
}

export default App;
