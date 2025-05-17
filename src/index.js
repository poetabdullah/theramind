import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js//bootstrap.bundle.min.js';
import emailjs from '@emailjs/browser';

// Dynamically inject the Google API script
const loadGapiScript = () => {
  const existingScript = document.getElementById("gapiScript");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.id = "gapiScript";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
};

loadGapiScript(); // Load script before React app initializes


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);


emailjs.init({
  publicKey: 'qSC9QChymUGrSFCY5',
  blockHeadless: true                // prevents headless‑browser abuse
});
