import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import QuestionnaireForm from "./pages/questionnaire";
import SignUpPage from "./pages/SignUpPage";

const App = () => (
  <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/questionnaire" element={<QuestionnaireForm />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
  </div>
);

export default App;
