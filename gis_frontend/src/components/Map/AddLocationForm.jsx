import React, { useState, useContext, useEffect } from "react";
import { Form, Button, Container, Modal } from "react-bootstrap";
import { createLocation } from "../../services/diaDiemService";
import { getUserById } from "../../services/nguoiDungService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import "../../styles/AddLocationForm.css";

const AddLocationForm = () => {
  const { auth } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState({ name: "", do_uy_tin: 0 });
  const [locationData, setLocationData] = useState({
    name: "",
    address: "",
    toa_do: [{ lon: "", lat: "" }],
    mo_ta: "",
    url_hinh_anh: [""],
    rating: 2.5,
    nguoi_tao: "",
    khoi: [], // Danh sách khối
  });

  const [showModal, setShowModal] = useState(false);
  const [blockType, setBlockType] = useState("");
  const [blockData, setBlockData] = useState({
    chieu_cao: "",
    toa_do: [],
  });

  const [selectedBlock, setSelectedBlock] = useState(null); // Khối được chọn để hiển thị thông tin
  const [showBlockDetailsModal, setShowBlockDetailsModal] = useState(false);
  const navigate = useNavigate();

  // Gọi API lấy thông tin người dùng
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserById(auth.userId);
        setUserInfo({ name: response.name, do_uy_tin: response.do_uy_tin });
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

  const handleAddBlock = () => {
    setShowModal(true);
    setBlockType("");
    setBlockData({ chieu_cao: "", toa_do: [] });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Bán kính Trái Đất tính bằng mét
    const toRadians = (deg) => (deg * Math.PI) / 180;

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Khoảng cách tính bằng mét
  };

  const handleSubmitBlock = () => {
    // Check if the coordinates for the first and last points are the same
    if (blockType && blockData.toa_do.length > 0 && blockData.chieu_cao) {
      const mainPoint = locationData.toa_do[0]; // Tọa độ gốc
      const hasPointWithin50m = blockData.toa_do.some((point) => {
        const distance = calculateDistance(
          mainPoint.lat,
          mainPoint.lon,
          point.lat,
          point.lon
        );
        return distance <= 50; // Chỉ cần một điểm trong bán kính 50m
      });

      if (!hasPointWithin50m) {
        alert("Phải có ít nhất một góc của khối nằm trong bán kính 50m từ tọa độ gốc.");
        return;
      }

      const point1 = blockData.toa_do[0]; // First point (toa_do[0])
      const lastPoint =
        blockType === "lăng trụ tam giác"
          ? blockData.toa_do[3]
          : blockData.toa_do[4]; // Last point

      if (point1.lon !== lastPoint.lon || point1.lat !== lastPoint.lat) {
        alert("Kinh độ và vĩ độ của điểm đầu và điểm cuối phải giống nhau.");
        return; // Stop the block creation if coordinates don't match
      }

      // If the coordinates match, create the block
      const formattedBlock = {
        ...blockData,
        toa_do: blockData.toa_do.map(({ lon, lat }) => ({ lon, lat })),
        name: `Khối ${locationData.khoi.length + 1}`,
        type: blockType,
      };

      setLocationData((prev) => ({
        ...prev,
        khoi: [...prev.khoi, formattedBlock],
      }));

      setShowModal(false);
    } else {
      alert("Vui lòng nhập đầy đủ thông tin khối.");
    }
  };

  const handleDeleteBlock = (index) => {
    setLocationData((prev) => ({
      ...prev,
      khoi: prev.khoi.filter((_, i) => i !== index),
    }));
  };

  const handleBlockClick = (block) => {
    setSelectedBlock(block);
    setShowBlockDetailsModal(true);
  };

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
      const response = await createLocation({
        locationData: updatedLocationData,
        userId: auth.userId,
      });
      alert("Địa điểm đã được thêm thành công");

      // Clear form after successful submission
      setLocationData({
        name: "",
        address: "",
        toa_do: [{ lon: "", lat: "" }],
        mo_ta: "",
        url_hinh_anh: [""],
        rating: 2.5,
        nguoi_tao: { ten: "", do_uy_tin: 0 },
        khoi: [],
      });
    } catch (error) {
      console.error("Error creating location:", error);
      alert("Đã xảy ra lỗi khi thêm địa điểm");
    }
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
            onChange={(e) =>
              setLocationData({ ...locationData, name: e.target.value })
            }
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
            onChange={(e) =>
              setLocationData({ ...locationData, address: e.target.value })
            }
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
              if (/^-?\d*(\.\d*)?$/.test(value)) { // Chỉ cho phép số âm, số dương và số thập phân
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
              if (/^-?\d*(\.\d*)?$/.test(value)) { // Chỉ cho phép số âm, số dương và số thập phân
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
            onChange={(e) =>
              setLocationData({ ...locationData, mo_ta: e.target.value })
            }
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
            onChange={(e) =>
              setLocationData({
                ...locationData,
                url_hinh_anh: [e.target.value],
              })
            }
            className="input"
            required
          />
        </Form.Group>

        {/* Khối */}
        <Form.Group>
          <div className="d-flex justify-content-between align-items-center">
            <Form.Label className="label mb-0">Danh sách khối</Form.Label>
            <Button variant="primary" onClick={handleAddBlock}>
              Tạo khối
            </Button>
          </div>
          <div className="d-flex flex-wrap mt-3">
            {locationData.khoi.map((block, index) => (
              <div
                key={index}
                className="p-2"
                style={{ flex: "1 1 calc(33.333% - 1rem)", cursor: "pointer" }}
                onClick={() => handleBlockClick(block)} // Thêm sự kiện onClick tại đây
              >
                <div className="polygon-box border rounded p-2 d-flex justify-content-between align-items-center">
                  <span className="block-name">{block.name}</span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
                      handleDeleteBlock(index);
                    }}
                    className="delete-button"
                  >
                    X
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Form.Group>

        <div className="button-container">
          <Button variant="success" type="submit">
            Thêm địa điểm
          </Button>
        </div>
      </Form>

      {/* Modal thêm khối */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo khối</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!blockType ? (
            <>
              <Button
                variant="outline-primary"
                onClick={() => setBlockType("lăng trụ tam giác")}
              >
                Lăng trụ tam giác
              </Button>
              <Button
                variant="outline-primary"
                onClick={() => setBlockType("lăng trụ tứ giác")}
                className="ml-2"
                style={{ marginLeft: "10px" }}
              >
                Lăng trụ tứ giác
              </Button>
            </>
          ) : (
            <Form>
              {[...Array(blockType === "lăng trụ tam giác" ? 4 : 5)].map(
                (_, i) => (
                  <div key={i}>
                    <Form.Group>
                      <Form.Label>Kinh độ góc {i + 1}</Form.Label>
                      <Form.Control
                        type="number"
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (/^-?\d*(\.\d*)?$/.test(value)) {
                            // Chuyển chuỗi thành số nếu có thể
                            const numericValue = parseFloat(value);
                            if (numericValue >= -180 && numericValue <= 180) {
                              setBlockData((prev) => {
                                const toaDo = [...prev.toa_do];
                                toaDo[i] = { ...toaDo[i], lon: numericValue };
                                return { ...prev, toa_do: toaDo };
                              });
                            } else if (numericValue === "") {
                              // Xử lý nếu giá trị trống
                              setBlockData((prev) => {
                                const toaDo = [...prev.toa_do];
                                toaDo[i] = { ...toaDo[i], lon: "" };
                                return { ...prev, toa_do: toaDo };
                              });
                            } else {
                              alert("Kinh độ phải nằm trong khoảng -180 đến 180");
                            }
                          }
                        }}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Vĩ độ góc {i + 1}</Form.Label>
                      <Form.Control
                        type="number"
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (/^-?\d*(\.\d*)?$/.test(value)) {
                            // Chuyển chuỗi thành số nếu có thể
                            const numericValue = parseFloat(value);
                            if (numericValue >= -90 && numericValue <= 90) {
                              setBlockData((prev) => {
                                const toaDo = [...prev.toa_do];
                                toaDo[i] = { ...toaDo[i], lat: numericValue };
                                return { ...prev, toa_do: toaDo };
                              });
                            } else if (numericValue === "") {
                              setBlockData((prev) => {
                                const toaDo = [...prev.toa_do];
                                toaDo[i] = { ...toaDo[i], lat: "" };
                                return { ...prev, toa_do: toaDo };
                              });
                            } else {
                              alert("Vĩ độ phải nằm trong khoảng -90 đến 90");
                            }
                          }
                        }}
                      />
                    </Form.Group>
                  </div>
                )
              )}
              <Form.Group>
                <Form.Label>Chiều cao</Form.Label>
                <Form.Control
                  type="number"
                  onChange={(e) =>
                    setBlockData((prev) => ({
                      ...prev,
                      chieu_cao: parseFloat(e.target.value),
                    }))
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          {blockType && (
            <Button variant="primary" onClick={handleSubmitBlock}>
              Xác nhận
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal hiển thị thông tin khối */}
      <Modal
        show={showBlockDetailsModal}
        onHide={() => setShowBlockDetailsModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thông tin khối</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBlock && (
            <>
              <p>
                <strong>Loại khối:</strong> {selectedBlock.type}
              </p>
              <p>
                <strong>Chiều cao:</strong> {selectedBlock.chieu_cao}
              </p>
              <p>
                <strong>Tọa độ:</strong>
              </p>
              <ul>
                {selectedBlock.toa_do.map((point, index) => (
                  <li key={index}>
                    Kinh độ: {point.lon}, Vĩ độ: {point.lat}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => setShowBlockDetailsModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AddLocationForm;
