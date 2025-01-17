
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import Questionnaire from './pages/Questionnaire';

const App = () => (
  <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
    </Routes>

  </div>
);

export default App;