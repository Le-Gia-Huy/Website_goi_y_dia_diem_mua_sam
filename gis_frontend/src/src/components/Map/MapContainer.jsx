// src/components/MapComponent.js
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { getAllLocations, updateLocation, deleteLocation } from "../../services/diaDiemService";
import "leaflet/dist/leaflet.css";
import EditLocationForm from "../MarkerEditForm/MarkerEditForm"; // Import the new EditLocationForm component
import "./EditLocationForm.css"; // Import the MapComponent CSS
import LocationList from "../LocationList/LocationList";

// Custom shopping icon
const shoppingIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1170/1170678.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30],
});

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [editingData, setEditingData] = useState({
    _id: null,
    name: "",
    lat: "",
    lon: "",
  });
  const mapRef = useRef(null);

  const handleFlyToLocation = (lat, lon) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 15, { duration: 1.5 });
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      const data = await getAllLocations();
      setLocations(data);
    };
    fetchLocations();
  }, []);

  const handleEditClick = (location, event) => {
    event.stopPropagation(); // Prevent the popup from closing
    const { _id, name, toa_do } = location;
    setEditingData({
      _id,
      name: name || "",
      lat: toa_do[0]?.lat || "",
      lon: toa_do[0]?.lon || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const updatedData = {
      name: editingData.name,
      toa_do: [
        {
          lat: parseFloat(editingData.lat),
          lon: parseFloat(editingData.lon),
        },
      ],
    };

    try {
      await updateLocation(editingData._id, updatedData);

      setLocations((prevLocations) =>
        prevLocations.map((loc) =>
          loc._id === editingData._id ? { ...loc, ...updatedData } : loc
        )
      );
      setEditingData({ _id: null, name: "", lat: "", lon: "" }); // Reset the form
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const handleCancel = () => {
    setEditingData({ _id: null, name: "", lat: "", lon: "" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await deleteLocation(id);

        setLocations((prevLocations) => prevLocations.filter((loc) => loc._id !== id));
        if (editingData._id === id) {
          setEditingData({ _id: null, name: "", lat: "", lon: "" }); // Reset form if the deleted location was being edited
        }
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  return (
    <MapContainer
      center={[10.8305, 106.7689]}
      zoom={12}
      ref={mapRef}
      className="map-container" // Apply the CSS class for map
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {locations.map((location) => {
        const { _id, name, toa_do } = location;
        if (toa_do && toa_do.length > 0) {
          const { lat, lon } = toa_do[0];
          return (
            <Marker key={_id} position={[lat, lon]} icon={shoppingIcon}>
              <Popup>
                {_id === editingData._id ? (
                  <EditLocationForm
                    editingData={editingData}
                    handleInputChange={handleInputChange}
                    handleSave={handleSave}
                    handleCancel={handleCancel}
                  />
                ) : (
                  <div>
                    <strong>{name || "Unnamed Location"}</strong>
                    <div className="popup-buttons"> {/* Apply the CSS class for buttons */}
                      <button
                        onClick={(event) => handleEditClick(location, event)}
                        className="popup-button popup-edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(_id)}
                        className="popup-button popup-delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
      <LocationList
        locations={locations}
        onLocationClick={handleFlyToLocation}
      />
    </MapContainer>
  );
};

export default MapComponent;
