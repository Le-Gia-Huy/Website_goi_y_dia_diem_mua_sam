import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { AuthContext } from '../../context/AuthContext';
import { getUserById, updateUser } from "../../services/nguoiDungService";
import { useNavigate } from 'react-router-dom';
import "../../styles/UserAccount.css";

const UserAccount = () => {
  const { auth } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [reputation, setReputation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const navigate = useNavigate();

  // Gọi API lấy thông tin người dùng
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserById(auth.userId);
        setName(response.name);
        setUsername(response.username);
        setReputation(response.do_uy_tin);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        alert("Không thể lấy thông tin người dùng");
      }
    };
    if (!auth) {
      navigate('/');
    }
    else {
      fetchUserInfo();
    }
  }, [auth]);

  const handleChangeName = async (e) => {
    e.preventDefault(); // Ngăn chặn hành động mặc định của form
    try {
      // Gọi API updateUser
      const updatedData = { name }; // Chỉ cập nhật trường name
      await updateUser(auth.userId, updatedData);

      // Hiển thị thông báo thành công
      alert("Thông tin đã được cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      alert("Cập nhật thông tin thất bại. Vui lòng thử lại.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      await updateUser(auth.userId, {
        currentPassword: currentPassword,
        newPassword: newPassword,
      });
      alert("Mật khẩu đã được thay đổi thành công!");
    } catch (error) {
      console.error("Lỗi khi thay đổi mật khẩu:", error);
      alert(error.response?.data?.message || "Thay đổi mật khẩu thất bại");
    }
  };

  return (
    <div>
      <Container className="user-box">
        <Form onSubmit={handleChangeName} style={{ marginBottom: '10px' }}>
          <Form.Group>
            <Form.Label className="user-label">Tên người dùng</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên người dùng"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="user-input"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="user-label">Tài khoản</Form.Label>
            <Form.Control
              type="email"
              placeholder="Nhập tài khoản"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              className="user-input"
              required
              disabled
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="user-label">Uy tín</Form.Label>
            <Form.Control
              type="email"
              placeholder="Uy tín"
              value={reputation}
              onChange={(e) =>
                setReputation(e.target.value)
              }
              className="user-input"
              required
              disabled
            />
          </Form.Group>
          <div className="user-button-container">
            <Button variant="success" type="submit">
              Lưu thông tin
            </Button>
          </div>
        </Form>
        <Form onSubmit={handleChangePassword}>
          <Form.Group>
            <Form.Label className="user-label">Mật khẩu hiện tại</Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              className="user-input"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="user-label">Mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              className="user-input"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="user-label">Nhập lại mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmNewPassword}
              onChange={(e) =>
                setConfirmNewPassword(e.target.value)
              }
              className="user-input"
              required
            />
          </Form.Group>
          <div className="user-button-container">
            <Button variant="success" type="submit">
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default UserAccount;
