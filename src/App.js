import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Meditation from "./pages/Meditation";
import Navbar from "./components/Navbar";
import Questionnaire from "./pages/Questionnaire";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";

const App = () => (
  <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/Meditation" element={<Meditation />} />
      <Route path="/Questionnaire" element={<Questionnaire />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  </div>
);

export default App;
