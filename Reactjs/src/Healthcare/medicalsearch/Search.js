"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./Search.css"

const Search = () => {
  const [column, setColumn] = useState("")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [error, setError] = useState(null)

  // Updated columns array to only include "name" and "use0"
  const columns = [
    "name",
    "use0",
  ]

  const columnHeaders = {
    name: "Medicine Name",
    price: "Price",
    manufacturer_name: "Manufacturer",
    pack_size_label: "Pack Size",
    short_composition: "Composition",
    substitute0: "Substitute 1",
    substitute1: "Substitute 2",
    sideEffect0: "Side Effects",
    sideEffect1: "Side Effect 2",
    sideEffect2: "Side Effect 3",
    use0: "Usage",
    use1: "Secondary Usage",
    "Chemical Class": "Chemical Class",
    "Therapeutic Class": "Therapeutic Class",
    "Action Class": "Action Class",
    type: "Type",
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:5000/defaultRows")
        setResults(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        setError("Failed to load initial data. Please try again later.")
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  const handleSearch = async () => {
    if (!column || !query) {
      alert("Please select a column and enter a search query.")
      return
    }

    try {
      setLoading(true)
      setSearchPerformed(true)
      setError(null)

      const response = await axios.post("http://localhost:5000/search", { column, query })
      setResults(response.data)
      setLoading(false)
    } catch (error) {
      console.error("Error during search:", error)
      setError("An error occurred while searching. Please try again.")
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const renderMedicineType = (type) => {
    if (!type) return null

    const typeColors = {
      tablet: "#3b82f6",
      capsule: "#8b5cf6",
      syrup: "#ec4899",
      injection: "#ef4444",
      cream: "#10b981",
      drops: "#06b6d4",
      powder: "#f59e0b",
      inhaler: "#6366f1",
      default: "#6b7280",
    }

    return (
      <span
        className="card-type-badge"
        style={{ backgroundColor: typeColors[type.toLowerCase()] || typeColors.default }}
      >
        {type}
      </span>
    )
  }

  return (
    <div className="search-engine-container">
      <div className="header">
        <div>
        <br></br><br></br>
          <h1 className="title">Medicine Search Engine</h1>
          <p className="subtitle">Search through our database of over 200,000 medicines</p>
        </div>
        
      </div>

      <div className="search-bar-container">
        <div className="search-bar">
          <select className="dropdown2" value={column} onChange={(e) => setColumn(e.target.value)}>
            <option value="">Select Column</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {columnHeaders[col] || col}
              </option>
            ))}
          </select>
          <input
            className="search-input"
            type="text"
            placeholder="Search up to 200,000 medicines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-button" onClick={handleSearch}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="search-stats">
            {searchPerformed ? `Found ${results.length} results` : "Showing popular medicines"}
          </div>
          <div className="card-container">
            {results.map((row, index) => (
              <div key={index} className="data-card1">
                <div className="card-image-container">
                  <img
                    src={row.type ? `/medicons/${row.type}.jpg` : "/placeholder.svg?height=160&width=300"}
                    alt={row.type || "Medicine"}
                    className="card-image"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=160&width=300"
                    }}
                  />
                  {renderMedicineType(row.type)}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{row.name || "Unknown Medicine"}</h3>
                  <div className="card-price">₹{row.price}</div>
                  <div className="card-info">
                    <div className="info-item">
                      <span className="info-label">Manufacturer:</span>
                      <span className="info-value">{row.manufacturer_name || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Pack Size:</span>
                      <span className="info-value">{row.pack_size_label || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Composition:</span>
                      <span className="info-value">{row.short_composition || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Primary Use:</span>
                      <span className="info-value">{row.use0 || "N/A"}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Side Effects:</span>
                      <span className="info-value">{row.sideEffect0 || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : searchPerformed ? (
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3>No Results Found</h3>
          <p>Try adjusting your search criteria or try a different search term.</p>
        </div>
      ) : null}
    </div>
  )
}

export default Search