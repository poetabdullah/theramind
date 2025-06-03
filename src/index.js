// src/index.js

import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// 1) CSS imports
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./App.css";

// 2) JS imports
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import emailjs from "@emailjs/browser";
import App from "./App";

// ---------------------------------
// Initialize EmailJS as early as possible.
// You can pass { blockHeadless: true } as the second argument if you need to block headless browsers.
emailjs.init("qSC9QChymUGrSFCY5", { blockHeadless: true });
// ---------------------------------

// ---------------------------------
// Dynamically inject the Google API script into <body>
// (You could also move this into a `useEffect` inside App.jsx if you prefer
//  to load it after React mounts)
const loadGapiScript = () => {
  if (!document.getElementById("gapiScript")) {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.id = "gapiScript";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
};
loadGapiScript();
// ---------------------------------

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
