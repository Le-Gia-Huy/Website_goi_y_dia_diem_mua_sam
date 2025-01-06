import React from 'react';
import '../../styles/UserOnlyButton.css';

const UserOnlyButton = ({ checked, onChange }) => {
  return (
    <div className="user-only-switch">
      <input
        type="checkbox"
        id="user-only-toggle"
        className="user-only-checkbox"
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor="user-only-toggle" className="user-only-label">
        <span className="user-only-inner">{checked ? 'My Locations' : 'All Locations'}</span>
        <span className="user-only-switch-btn"></span>
      </label>
    </div>
  );
};

export default UserOnlyButton;
