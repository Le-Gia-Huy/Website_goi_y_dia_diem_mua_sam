import axios from 'axios';

const API_URL = `/api/nguoidung`;

// Đăng ký người dùng mới
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Xác thực email người dùng
export const verifyCode = async ({ username, code }) => {
  try {
    const response = await axios.post(`${API_URL}/verify-code`, { username, code });
    return response.data;
  } catch (error) {
    console.error('Error verifying code:', error.response?.data || error.message);
    throw error;
  }
};

// Gửi lại mã xác nhận
export const resendVerificationCode = async (username) => {
  try {
    const response = await axios.post(`${API_URL}/resend-verification-code`, { username });
    return response.data;
  } catch (error) {
    console.error('Error resending verification code:', error.response?.data || error.message);
    throw error;
  }
};

// Đăng nhập người dùng
export const loginUser = async (loginData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, loginData);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Lấy tất cả người dùng
export const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Lấy thông tin người dùng theo ID
export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// Cập nhật người dùng theo ID
export const updateUser = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Xóa người dùng theo ID
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
