
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Questionnaire from './pages/Questionnaire';
import Navbar from './components/Navbar';

const App = () => (
  <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
    <Routes>
      <Route path="/" element={<Questionnaire />} />
    </Routes>
  </div>
);

export default App;