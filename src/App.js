import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Meditation from "./pages/Meditation";
import Navbar from "./components/Navbar";
import QuestionnairePage from "./pages/QuestionnairePage";
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
import Testimonial from "./pages/Testimonial";
import PatientDashboard from "./pages/PatientDashboard";
import AppointmentBooking from './components/AppointmentBooking';
import AppointmentCancelReschedule from './components/AppointmentCancelReschedule';
import DoctorSignUp from "./pages/DoctorSignUp";
import SignUpLandingPage from "./pages/SignUpLandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import CreateTreatmentPlan from "./pages/CreateTreatmentPlan"
import ManagePatients from "./pages/ManagePatients";
const App = () => (
  <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/meditation" element={<Meditation />} />
      <Route path="/questionnaire" element={<QuestionnairePage />} />
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
      <Route path="/testimonial" element={<Testimonial />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/doctor-signup" element={<DoctorSignUp />} />
      <Route path="/signup-landing" element={<SignUpLandingPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      <Route path="/appointment-booking" element={<AppointmentBooking />} />
      <Route path="/appointment-cancel-reschedule" element={<AppointmentCancelReschedule />} />
      <Route path="/create-treatment" element={<CreateTreatmentPlan />} />
      <Route path="/manage-patients" element={<ManagePatients />} />
    </Routes>
  </div>
);

export default App;