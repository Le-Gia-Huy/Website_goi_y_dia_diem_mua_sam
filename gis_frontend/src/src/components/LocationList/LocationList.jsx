import React, { useState } from "react";
import "./LocationList.css";

const LocationList = ({ locations = [], onLocationClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="location-list-container">
      {/* Button to toggle popup */}
      <button onClick={togglePopup} className="location-list-button">
        Show Locations
      </button>

      {/* Popup containing the list */}
      {isOpen && (
        <div className="location-list-popup">
          <ul className="location-list">
            {locations.map((location, index) => {
              const { toa_do, _id, name } = location;
              if (toa_do && toa_do.length > 0) {
                const { lat, lon } = toa_do[0];
                return (
                  <li
                    key={_id}
                    className="location-list-item"
                    onClick={() => onLocationClick(lat, lon)} // Fly to location on click
                  >
                    <div>
                      <strong>{name || `Location ${index + 1}`}</strong>
                    </div>
                      {location.address && (
                        <div className="location-address">{location.address}</div>
                        )}
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationList;
