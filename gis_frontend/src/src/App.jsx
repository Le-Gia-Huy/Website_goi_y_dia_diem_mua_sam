import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import AddLocation from './pages/AddLocation';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import VerifyEmail from './components/Auth/VerifyEmail';
import UserAccount from './components/Auth/UserAccount';
import AuthProvider from './context/AuthContext'; // Thêm AuthProvider
import './styles/custom.css';

function App() {
  return (
    <AuthProvider> {/* Đảm bảo AuthProvider bao bọc Router */}
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/verify-code" element={<VerifyEmail />} />
          <Route path="/add-location" element={<AddLocation />} />
          <Route path="/user" element={<UserAccount />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
