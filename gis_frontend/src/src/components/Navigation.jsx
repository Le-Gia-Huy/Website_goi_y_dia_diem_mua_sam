import React, { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const { auth, logout } = useContext(AuthContext);

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/">Trang Địa Điểm</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {!auth ? (
            <></>
          ) : (
            <>
              <Nav.Link as={Link} to="/user">Thông tin tài khoản</Nav.Link>
              <Nav.Link as={Link} to="/add-location">Thêm địa điểm</Nav.Link>
            </>
          )}
        </Nav>
        <Nav>
          {!auth ? (
            <>
              <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
              <Nav.Link as={Link} to="/register">Đăng ký</Nav.Link>
            </>
          ) : (
            <Nav.Link 
              as={Link}
              onClick={() => {
                logout(); 
                alert('Bạn đã đăng xuất thành công!');
              }}
            >
              Đăng xuất
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;

