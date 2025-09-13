"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHome, faHeartbeat, faHospital, faUserMd,faBell } from "@fortawesome/free-solid-svg-icons"
import "./Navbar.css"

const Navbar = () => {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleNavigation = (path) => {
    navigate(path)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState)
  }

  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/mainlogo.png" alt="Main Logo" className="logo-img" />
      </div>
      <ul className="nav-links">
        <li className="nav-item" onClick={() => handleNavigation("/")}>
          <FontAwesomeIcon icon={faHome} className="nav-icon" />
          Home
        </li>
         <li className="nav-item" onClick={() => handleNavigation("/remainder")}>
                    <FontAwesomeIcon icon={faBell} className="nav-icon" />

          Remainder
        </li>
        <li className="nav-item" onMouseEnter={toggleDropdown} onMouseLeave={toggleDropdown}>
          <FontAwesomeIcon icon={faHeartbeat} className="nav-icon" />
          Healthcare
          {isDropdownOpen && (
            <ul className="dropdown">
              <li className="dropdown-item" onClick={() => handleNavigation("/healthcare/medicalsearch")}>
                Medical Search
              </li>
              <li className="dropdown-item" onClick={() => handleNavigation("/healthcare/diseaseprediction")}>
                Disease Prediction
              </li>
              <li className="dropdown-item" onClick={() => handleNavigation("/healthcare/wellness")}>
                Report Analysis
              </li>
            </ul>
          )}
        </li>
        
        <li className="nav-item" onClick={() => handleNavigation("/MapPage")}>
          <FontAwesomeIcon icon={faHospital} className="nav-icon" />
          Hospitals
        </li>
        <li className="nav-item" onClick={() => handleNavigation("/chatbot")}>
          <FontAwesomeIcon icon={faUserMd} className="nav-icon" />
          Consultation
        </li>
        
      </ul>
    </nav>
  )
}

export default Navbar
