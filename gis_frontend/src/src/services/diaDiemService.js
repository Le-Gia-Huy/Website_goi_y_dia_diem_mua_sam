import axios from 'axios';

const API_URL = `/api/diadiem`;

// Lấy tất cả các địa điểm
export const getAllLocations = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// Lấy thông tin một địa điểm theo ID
export const getLocationById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location by ID:', error);
    throw error;
  }
};

// Tạo mới một địa điểm
export const createLocation = async (locationData) => {
  try {
    const response = await axios.post(API_URL, locationData);
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

// Cập nhật địa điểm theo ID
export const updateLocation = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

// Xóa địa điểm theo ID
export const deleteLocation = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};
