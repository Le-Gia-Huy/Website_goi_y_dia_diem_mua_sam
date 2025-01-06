import React, { useState } from "react";
import "./LocationList.css";

const LocationList = ({ locations = [], onLocationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State để lưu nội dung tìm kiếm

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  // Hàm để lọc các địa điểm dựa trên nội dung tìm kiếm
  const filteredLocations = locations.filter(
    (location) =>
      location.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="location-list-container">
      {/* Button to toggle popup */}
      <button onClick={togglePopup} className="location-list-button">
        {/* Chấm tròn đại diện cho nút */}
      </button>

      {/* Popup containing the list */}
      {isOpen && (
        <div className="location-list-popup">
          {/* Thanh tìm kiếm */}
          <input
            type="text"
            className="location-search-input"
            placeholder="Tìm kiếm địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ul className="location-list">
            {filteredLocations.map((location, index) => {
              const { toa_do, _id, name, address } = location;
              if (toa_do && toa_do.length > 0) {
                const { lat, lon } = toa_do[0];
                return (
                  <li
                    key={_id}
                    className="location-list-item"
                    onClick={() => {
                      onLocationClick(lat, lon, location);
                      togglePopup();
                    }}
                  >
                    <div>
                      <strong className="location-name">
                        {name || `Location ${index + 1}`}
                      </strong>
                    </div>
                    {address && (
                      <div className="location-address">{address}</div>
                    )}
                  </li>
                );
              }
              return null;
            })}
          </ul>
          {/* Hiển thị thông báo nếu không tìm thấy địa điểm nào */}
          {filteredLocations.length === 0 && (
            <p className="no-results-message">Không tìm thấy địa điểm nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationList;
