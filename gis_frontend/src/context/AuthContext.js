import React, { createContext, useState, useEffect } from 'react';

// Tạo context cho Auth
export const AuthContext = createContext();

// Provider cho Auth
const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  // Kiểm tra xem có token trong localStorage không khi ứng dụng khởi động
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token) {
      setAuth({ token, userId });
    }
  }, []);

  // Hàm đăng nhập: lưu token vào state và localStorage
  const login = (token, userId) => {
    const authData = { token, userId };
    setAuth(authData);
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
  };

  // Hàm đăng xuất: xóa token khỏi state và localStorage
  const logout = () => {
    setAuth(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
