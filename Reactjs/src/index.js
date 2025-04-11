// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import App from './App'; // Home Page
import ChatBot from './chatbot/ChatBot'; // ChatBot Page
import Search from './Healthcare/medicalsearch/Search'; // Medical Search Page
import DiseasePrediction from './Healthcare/diseaseprediction/DiseasePrediction'
import Report from './Healthcare/reportanalysis/ReportAnalysis'

import MapPage from './MapPage/Map'

import './index.css'; // Optional, if you have global styles

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/healthcare/medicalsearch" element={<Search />} /> {/* Medical Search route */}
        <Route path="/healthcare/diseaseprediction" element={<DiseasePrediction />} /> {/* Medical Search route */}
        <Route path="/healthcare/wellness" element={<Report />} /> {/* Medical Search route */}
        <Route path="/MapPage" element={<MapPage />} /> {/* Medical Search route */}


      </Routes>
    </Router>
  </React.StrictMode>
);
