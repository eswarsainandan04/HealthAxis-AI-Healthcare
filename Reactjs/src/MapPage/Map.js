import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Import hospital data
import vijayawadaData from './hospitals_vij.json';

const MapPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null); // Start with no selection
  const [selectedType, setSelectedType] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Predefined locations
  const locations = {
    Vijayawada: { lat: 16.5061, lon: 80.6480 },
  };

  // Default view: India
  const defaultLocation = { lat: 20.5937, lon: 78.9629 };

  // Extract unique hospital types
  const hospitalTypes = Array.from(new Set(vijayawadaData.map((hospital) => hospital.type)));

  const handleLocationChange = (event) => {
    const city = event.target.value;
    setSelectedLocation(city);

    if (locations[city] && mapRef.current) {
      mapRef.current.flyTo([locations[city].lat, locations[city].lon], 13, {
        animate: true,
        duration: 1.5,
      });
    }
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleViewButtonClick = (hospitalLocation, markerIndex) => {
    if (hospitalLocation?.lat && hospitalLocation?.lon) {
      if (mapRef.current) {
        mapRef.current.flyTo([hospitalLocation.lat, hospitalLocation.lon], 17, {
          animate: true,
          duration: 1.5,
        });

        const marker = markersRef.current[markerIndex];
        if (marker) {
          marker.openPopup();
        }
      }
    } else {
      console.log("Latitude and Longitude not found in hospital location data.");
    }
  };

  // Fix for marker icon issue
  const defaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  L.Marker.prototype.options.icon = defaultIcon;

  // Filter hospitals based on search, type, and location
  const filteredHospitals = vijayawadaData.filter((hospital) => {
    const matchesSearchQuery =
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital['phone number'].toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.rating.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.availability.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !selectedType || hospital.type === selectedType;
    const matchesLocation = selectedLocation === 'Vijayawada';

    return matchesSearchQuery && matchesType && matchesLocation;
  });

  return (
    <div>
      {/* Sidebar Toggle Button */}
      <button className={`sidebar-toggle ${isSidebarOpen ? 'move' : ''}`} onClick={toggleSidebar}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2>Hospital Details</h2>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search hospitals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
        />

        {/* Hospital List */}
        {selectedLocation === 'Vijayawada' && filteredHospitals.length > 0 ? (
          <ul>
            {filteredHospitals.map((hospital, index) => (
              <li key={index}>
                <h3>{hospital.name}</h3>
                <p>{hospital.address}</p>
                <p>Type: {hospital.type}</p>
                <p>Phone: {hospital['phone number']}</p>
                <p>Rating: {hospital.rating}</p>
                <p>Availability: {hospital.availability}</p>
                <button onClick={() => handleViewButtonClick(hospital.location, index)}>
                  View
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hospital data available. Please select a location.</p>
        )}
      </div>

      {/* Main Content */}
      <div className={`main-content ${isSidebarOpen ? 'shrink' : ''}`}>
        <div className="selection-container">
          {/* Type Selection */}
          <select onChange={handleTypeChange} defaultValue="">
            <option value="">Select Type</option>
            {hospitalTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Location Selection */}
          <select onChange={handleLocationChange} defaultValue="">
            <option value="" disabled>
              Select Location
            </option>
            {Object.keys(locations).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Map */}
        <div className="map-container">
          <MapContainer
            center={[defaultLocation.lat, defaultLocation.lon]} // Default: India
            zoom={5} // Wide view for India
            style={{ height: '100%', width: isSidebarOpen ? '75%' : '100%' }}
            ref={mapRef}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {selectedLocation === 'Vijayawada' &&
              filteredHospitals.map((hospital, index) => (
                <Marker
                  key={index}
                  position={[hospital.location.lat, hospital.location.lon]}
                  ref={(el) => (markersRef.current[index] = el)}
                >
                  <Popup>
                    <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '2px' }}>
                          <img
                            src={`/vijayawada/${hospital.name}.jpg`}
                            alt={hospital.name}
                            style={{
                              width: '120px',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                            }}
                            onError={(e) => (e.target.style.display = 'none')}
                          />
                        </div>
                        <h3>{hospital.name}</h3>
                        <p><strong>Address:</strong> {hospital.address}</p>
                        <p><strong>Type:</strong> {hospital.type}</p>
                        <p><strong>Phone No:</strong> {hospital['phone number']}</p>
                        <p><strong>Rating:</strong> {hospital.rating}</p>
                        <p><strong>Availability:</strong> {hospital.availability}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
