import axios from 'axios';

const API_URL = `/api/diadiem`;
const USER_API_URL = `/api/nguoidung`;

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

// Lấy top 10 địa điểm gần nhất và có rating cao nhất
export const getTopNearbyLocations = async (lat, lon) => {
  try {
    const response = await axios.get(`${API_URL}/top-nearby`, {
      params: { lat, lon },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top nearby locations:', error);
    throw error;
  }
};

// Thêm bình luận vào địa điểm
export const addCommentToLocation = async ({ locationId, userId, rating, noi_dung }) => {
  try {
    const response = await axios.post(`${API_URL}/comment`, {
      locationId,
      userId,
      rating,
      noi_dung,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment to location:', error);
    throw error;
  }
};

// Chỉnh sửa bình luận
export const editCommentOnLocation = async ({ locationId, userId, rating, noi_dung }) => {
  try {
    const response = await axios.put(`${API_URL}/comment`, {
      locationId,
      userId,
      rating,
      noi_dung,
    });
    return response.data;
  } catch (error) {
    console.error("Error editing comment on location:", error);
    throw error;
  }
};

// Xóa bình luận
export const deleteCommentOnLocation = async ({ locationId, userId }) => {
  try {
    const response = await axios.delete(`${API_URL}/comment`, {
      data: { locationId, userId }, // Truyền payload vào `data`
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting comment on location:", error);
    throw error;
  }
};

// Tạo mới một địa điểm
export const createLocation = async (locationData, userId) => {
  try {
    const response = await axios.post(API_URL, locationData, userId);
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

// Lấy địa điểm theo userId
export const getLocationByUserId = async (userId) => {
  try {
    const response = await axios.get(`${USER_API_URL}/dia-diem/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "Network error" };
  }
};
