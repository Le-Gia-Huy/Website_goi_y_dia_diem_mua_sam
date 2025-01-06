import React, { useContext } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const { auth, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Mapping đường dẫn sang tiêu đề Navbar.Brand
  const getBrandTitle = () => {
    switch (location.pathname) {
      case '/user':
        return 'Thông Tin Tài Khoản';
      case '/add-location':
        return 'Thêm Địa Điểm';
      case '/login':
        return 'Đăng Nhập';
      case '/register':
        return 'Đăng Ký';
      default:
        return 'Trang Địa Điểm';
    }
  };

  // Điều hướng khi người dùng chưa đăng nhập
  const handleProtectedRoute = (path) => {
    if (!auth) {
      alert('Bạn cần đăng nhập để truy cập trang này!');
      navigate('/');
    } else {
      navigate(path);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="navigation">
      <Navbar.Brand>{getBrandTitle()}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {!auth ? (
            <Nav.Link as={Link} to="/">Danh sách địa điểm</Nav.Link>
          ) : (
            <>
              <Nav.Link as={Link} to="/">Danh sách địa điểm</Nav.Link>
              <Nav.Link
                onClick={() => handleProtectedRoute('/user')}
              >
                Thông tin tài khoản
              </Nav.Link>
              <Nav.Link
                onClick={() => handleProtectedRoute('/add-location')}
              >
                Thêm địa điểm
              </Nav.Link>
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
                navigate('/'); // Điều hướng về homepage
                logout(); // Đăng xuất người dùng
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
