import React, { useState, useEffect, useContext } from "react";
import { Form, Button, Container, Modal } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserById } from "../../services/nguoiDungService";
import { updateLocation } from "../../services/diaDiemService";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/AddLocationForm.css";


const UpdateLocationForm = () => {
  const { state } = useLocation();  // Access the location data passed from the previous page
  const { location } = state || {};  // Get the location data
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({ name: "", do_uy_tin: 0 });
  const [locationData, setLocationData] = useState({
    name: location?.name || "",
    address: location?.address || "",
    toa_do: location?.toa_do || [{ lon: "", lat: "" }],
    mo_ta: location?.mo_ta || "",
    url_hinh_anh: location?.url_hinh_anh || [""],
    rating: location?.rating || 2.5,
    nguoi_tao: location?.nguoi_tao || "",
    khoi: location?.khoi || [],
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserById(auth.userId);
        setUserInfo({ name: response.name, do_uy_tin: response.do_uy_tin });
      } catch (error) {
        console.error("Error fetching user info:", error);
        alert("Could not retrieve user information.");
      }
    };
    fetchUserInfo();
  }, [auth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedLocationData = {
      ...locationData,
      nguoi_tao: auth.userId,
      rating: userInfo.do_uy_tin >= 80 ? 3.0 : locationData.rating,
      khoi: locationData.khoi.map((block) => ({
        chieu_cao: block.chieu_cao,
        toa_do: block.toa_do.map(({ lon, lat }) => ({ lon, lat })),
      })),
    };

    try {
      await updateLocation(
        location._id,
        updatedLocationData,
      );
      alert("Location updated successfully");
      navigate("/");  // Navigate back to the locations list after updating
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Error updating location.");
    }
  };

  const addBlock = () => {
    setLocationData({
      ...locationData,
      khoi: [
        ...locationData.khoi,
        {
          chieu_cao: "",
          toa_do: [{ lon: "", lat: "" }],
        },
      ],
    });
  };

  const removeBlock = (index) => {
    const newKhoi = [...locationData.khoi];
    newKhoi.splice(index, 1);
    setLocationData({ ...locationData, khoi: newKhoi });
  };

  const handleBlockChange = (index, field, value) => {
    const newKhoi = [...locationData.khoi];
    if (field === "chieu_cao") {
      newKhoi[index].chieu_cao = value;
    } else {
      newKhoi[index].toa_do[0][field] = value;
    }
    setLocationData({ ...locationData, khoi: newKhoi });
  };

  return (
    <Container className="box">
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label className="label">Tên địa điểm</Form.Label>
          <Form.Control
            type="text"
            placeholder="Tên địa điểm"
            value={locationData.name}
            onChange={(e) => setLocationData({ ...locationData, name: e.target.value })}
            className="input"
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className="label">Địa chỉ</Form.Label>
          <Form.Control
            type="text"
            placeholder="Địa chỉ"
            value={locationData.address}
            onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
            className="input"
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className="label">Kinh độ</Form.Label>
          <Form.Control
            type="number"
            placeholder="Nhập kinh độ"
            value={locationData.toa_do[0].lon}
            onChange={(e) => {
              const value = e.target.value;
              if (/^-?\d*(\.\d*)?$/.test(value)) {
                const numericValue = parseFloat(value);
                if (numericValue >= -180 && numericValue <= 180) {
                  setLocationData({
                    ...locationData,
                    toa_do: [{ ...locationData.toa_do[0], lon: numericValue }],
                  });
                } else if (!value) {
                  setLocationData({
                    ...locationData,
                    toa_do: [{ ...locationData.toa_do[0], lon: "" }],
                  });
                } else {
                  alert("Kinh độ phải nằm trong khoảng -180 đến 180");
                }
              }
            }}
            className="input"
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className="label">Vĩ độ</Form.Label>
          <Form.Control
            type="number"
            placeholder="Nhập vĩ độ"
            value={locationData.toa_do[0].lat}
            onChange={(e) => {
              const value = e.target.value;
              if (/^-?\d*(\.\d*)?$/.test(value)) {
                const numericValue = parseFloat(value);
                if (numericValue >= -90 && numericValue <= 90) {
                  setLocationData({
                    ...locationData,
                    toa_do: [{ ...locationData.toa_do[0], lat: numericValue }],
                  });
                } else if (!value) {
                  setLocationData({
                    ...locationData,
                    toa_do: [{ ...locationData.toa_do[0], lat: "" }],
                  });
                } else {
                  alert("Vĩ độ phải nằm trong khoảng -90 đến 90");
                }
              }
            }}
            className="input"
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className="label">Mô tả</Form.Label>
          <Form.Control
            type="text"
            placeholder="Mô tả địa điểm"
            value={locationData.mo_ta}
            onChange={(e) => setLocationData({ ...locationData, mo_ta: e.target.value })}
            className="input"
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className="label">URL hình ảnh</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập URL hình ảnh"
            value={locationData.url_hinh_anh[0]}
            onChange={(e) => setLocationData({ ...locationData, url_hinh_anh: [e.target.value] })}
            className="input"
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label className="label">Khối địa điểm</Form.Label>
          {locationData.khoi.map((block, index) => (
            <div key={index} className="block-container">
              <div className="block-header">
                <Form.Control
                  type="number"
                  placeholder="Chiều cao"
                  value={block.chieu_cao}
                  onChange={(e) => handleBlockChange(index, "chieu_cao", e.target.value)}
                  className="input"
                />
                <Button
                  variant="danger"
                  onClick={() => removeBlock(index)}
                  className="remove-block-button"
                >
                  Xóa khối
                </Button>
              </div>
              <Form.Control
                type="number"
                placeholder="Kinh độ"
                value={block.toa_do[0].lon}
                onChange={(e) => handleBlockChange(index, "lon", e.target.value)}
                className="input"
              />
              <Form.Control
                type="number"
                placeholder="Vĩ độ"
                value={block.toa_do[0].lat}
                onChange={(e) => handleBlockChange(index, "lat", e.target.value)}
                className="input"
              />
            </div>
          ))}
          <Button variant="secondary" onClick={addBlock}>
            Thêm khối
          </Button>
        </Form.Group>

        <div className="button-container">
          <Button variant="success" type="submit">
            Cập nhật địa điểm
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default UpdateLocationForm;
