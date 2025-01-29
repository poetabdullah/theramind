import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Meditation from "./pages/Meditation";
import Navbar from "./components/Navbar";
import Questionnaire from "./pages/Questionnaire";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import PatientSignUp from "./pages/PatientSignUp";
import TheraChat from "./pages/TheraChat";
import EducationMainPage from "./pages/EducationMainPage";
import ArticlesListPage from "./pages/ArticlesListPage";
import PatientStoriesListPage from "./pages/PatientStoriesListPage";
import EducationDetailView from "./pages/EducationDetailView";
import EducationWritePage from "./pages/EducationWritePage";

const App = () => (
  <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/Meditation" element={<Meditation />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
      <Route path="/signup" element={<PatientSignUp />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/therachat" element={<TheraChat />} />
      <Route path="/EducationMain" element={<EducationMainPage />} />
      <Route path="/articles" element={<ArticlesListPage />} />
      <Route path="/patient-stories" element={<PatientStoriesListPage />} />
      <Route path="/view-education" element={<EducationDetailView />} />
      <Route path="/write-education" element={<EducationWritePage />} />
    </Routes>
  </div>
);

export default App;
