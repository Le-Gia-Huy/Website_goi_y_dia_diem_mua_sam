import React, { useState } from "react";
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { verifyCode, resendVerificationCode } from "../../services/nguoiDungService";
import { useLocation } from 'react-router-dom';
import '../../styles/VerifyEmail.css'

const VerifyCodeForm = () => {
  const location = useLocation();
  const username = location.state?.username; // Lấy username từ state
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await verifyCode({ username, code });
      alert(response.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      alert(error.response?.data?.message || "Mã xác thực không hợp lệ hoặc đã hết hạn.");
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await resendVerificationCode(username); // Sử dụng username từ props hoặc state
      alert(response.message);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi khi gửi lại mã xác nhận");
    }
  };

  return (
      <div className="verified-background">
        <Container className="verified-box">
          <Form onSubmit={handleVerify}>
            <Form.Group>
              <Form.Label className='verified-label'>Mã xác thực</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập mã xác thực"
                value={code}
                onChange={(e) => setCode(e.target.value )}
                className='verified-input'
                required
              />
            </Form.Group>
            <div className='verified-button-container'>
              <Button variant="success" type="submit">Xác nhận</Button>
            </div>
            <p className='resend-text' onClick={handleResendCode}>Gửi lại mã xác nhận.</p>
          </Form>
        </Container>
      </div>
    );
};

export default VerifyCodeForm;
