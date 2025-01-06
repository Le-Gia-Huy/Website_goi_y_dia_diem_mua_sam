import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/nguoiDungService';
import '../../styles/RegisterForm.css';

const RegisterForm = () => {
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser(userData);
      alert("Đăng ký thành công. Vui lòng kiểm tra email!");
      setTimeout(() => navigate('/verify-code', { state: { username: userData.username } }), 3000); // Điều hướng về trang đăng nhập sau 3 giây
    } catch (error) {
      alert("Đăng ký thất bại");
    }
  };

  return (
    <div className="register-background">
      <Container className="register-box">
        <Form onSubmit={handleRegister}>
          <Form.Group>
            <Form.Label className='register-label'>Tên người dùng</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên người dùng"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className='register-input'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className='register-label'>Tài khoản</Form.Label>
            <Form.Control
              type="email"
              placeholder="Nhập tài khoản"
              value={userData.username}
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
              className='register-input'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className='register-label'>Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập mật khẩu"
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              className='register-input'
              required
            />
          </Form.Group>
          <div className='register-button-container'>
            <Button variant="success" type="submit">Đăng ký</Button>
          </div>
          <p className='login-text'>Bạn đã có tài khoản? <span className='login-link' onClick={() => navigate('/login')}>Đăng nhập</span>.</p>
        </Form>
      </Container>
    </div>
  );
};

export default RegisterForm;
