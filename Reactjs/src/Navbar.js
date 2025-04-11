import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Navbar.css'; // Import the CSS file for styling

const Navbar = () => {
  const navigate = useNavigate(); // Initialize the navigate function
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility

  const handleNavigation = (path) => {
    navigate(path); // Programmatically navigate to the desired path
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState); // Toggle dropdown visibility
  };

  return (
    <nav className="navbar">
      <div className="logo">HealthAxis</div>
      <ul className="nav-links">
        <li className="nav-item" onClick={() => handleNavigation('/')}>
          Home
        </li>
        <li
          className="nav-item"
          onMouseEnter={toggleDropdown}
          onMouseLeave={toggleDropdown}
        >
          Healthcare
          {isDropdownOpen && (
            <ul className="dropdown">
              <li
                className="dropdown-item"
                onClick={() => handleNavigation('/healthcare/medicalsearch')}
              >
                Medical Search
              </li>
              <li
                className="dropdown-item"
                onClick={() => handleNavigation('/healthcare/diseaseprediction')}
              >
                Disease Prediction
              </li>
              <li
                className="dropdown-item"
                onClick={() => handleNavigation('/healthcare/wellness')}
              >
                Report Analysis
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item" onClick={() => handleNavigation('/MapPage')}>
          Hospitals
        </li>
        <li className="nav-item" onClick={() => handleNavigation('/chatbot')}>
          Consultation
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
