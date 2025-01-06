import React, { useState, useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/nguoiDungService';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/LoginForm.css';

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ username, password }); // Gọi API
      login(data.token, data.userId); // Ghi token vào AuthContext
      alert("Đăng nhập thành công");
      navigate("/");
    } catch (error) {
      if (error.response && error.response.data) {
        // Lấy thông báo lỗi từ backend và hiển thị
        alert(error.response.data.message || "Đăng nhập thất bại");
      } else {
        // Nếu không có phản hồi từ server
        alert("Đăng nhập thất bại");
      }
    }
  };
  

  return (
    <div className="login-background">
      <Container className="login-box">
        <Form onSubmit={handleLogin}>
          <Form.Group>
            <Form.Label className='login-label'>Tài khoản</Form.Label>
            <Form.Control
              type="email"
              placeholder="Nhập tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='login-input'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className='login-label'>Mật khẩu</Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='login-input'
              required
            />
          </Form.Group>
          <div className='login-button-container'>
            <Button variant="success" type="submit">Đăng nhập</Button>
          </div>
          <p className='register-text'>Bạn chưa có tài khoản? <span className='register-link' onClick={() => navigate('/register')}>Đăng ký</span>.</p>
        </Form>
      </Container>
    </div>
  );
};

export default LoginForm;
