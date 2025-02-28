import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Meditation from "./pages/Meditation";
import Navbar from "./components/Navbar";
import Questionnaire from "./pages/Questionnaire";
import StartScreen from "./pages/StartScreen";
import ContactUs from "./pages/ContactUs";
import AboutUs from "./pages/AboutUs";
import LoginPage from "./pages/LoginPage";
import PatientSignUp from "./pages/PatientSignUp";
import TheraChat from "./pages/TheraChat";
import EducationMainPage from "./pages/EducationMainPage";
import ArticlesListPage from "./pages/ArticlesListPage";
import PatientStoriesListPage from "./pages/PatientStoriesListPage";
import EducationDetailView from "./pages/EducationDetailView";
import EducationWritePage from "./pages/EducationWritePage";
import SplashScreen from "./pages/SplashScreen";

const App = () => (
  <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/meditation" element={<Meditation />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
      <Route path="/start-screen" element={<StartScreen />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/signup" element={<PatientSignUp />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/therachat" element={<TheraChat />} />
      <Route path="/education-main" element={<EducationMainPage />} />
      <Route path="/articles" element={<ArticlesListPage />} />
      <Route path="/patient-stories" element={<PatientStoriesListPage />} />
      <Route path="/stories/:id" element={<EducationDetailView />} />
      <Route path="/articles/:id" element={<EducationDetailView />} />
      <Route path="/write-education" element={<EducationWritePage />} />
      <Route path="/splash-screen" element={<SplashScreen />} />
    </Routes>
  </div>
);

export default App;
