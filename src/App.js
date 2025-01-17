
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import DiagnosticQuestionnaire from './components/DiagnosticQuestionnaire';

const App = () => (
  <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/questionnaire" element={<DiagnosticQuestionnaire />} />
    </Routes>

  </div>
);

export default App;