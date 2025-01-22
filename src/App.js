
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Meditation from './pages/Meditation';
import Navbar from './components/Navbar';
import questionnaire from './pages/questionnaire';

const App = () => (
  <div>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/Meditation" element={<Meditation />} />
      <Route path="/questionnaire" element={<questionnaire />}/>
    </Routes>
  </div>
);

export default App;
