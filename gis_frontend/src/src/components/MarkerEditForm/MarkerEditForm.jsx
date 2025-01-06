// src/components/EditLocationForm.js
import React from "react";
import "./MarkerEditForm.css"

const EditLocationForm = ({
  editingData,
  handleInputChange,
  handleSave,
  handleCancel,
}) => {
  return (
    <div className="edit-location-form"> {/* Apply the CSS class for form */}
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={editingData.name}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Latitude:
        <input
          type="text"
          name="lat"
          value={editingData.lat}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Longitude:
        <input
          type="text"
          name="lon"
          value={editingData.lon}
          onChange={handleInputChange}
        />
      </label>
      <button className="save-button" onClick={handleSave}>Save</button>
      <button className="cancel-button" onClick={handleCancel}>Cancel</button>
    </div>
  );
};

export default EditLocationForm;
