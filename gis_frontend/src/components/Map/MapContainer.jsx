import React, { useEffect, useRef, useState, useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { Icon } from "leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "../../styles/EditLocationForm.css";
import {
  getTopNearbyLocations,
  deleteLocation,
  getLocationByUserId,
  getLocationById,
  addCommentToLocation,
  editCommentOnLocation,
  deleteCommentOnLocation,
} from "../../services/diaDiemService";
import { getAllUsers } from "../../services/nguoiDungService";
import { AuthContext } from "../../context/AuthContext";
import UserOnlyButton from "../UserOnlyButton/UserOnlyButton";
import LocationList from "../LocationList/LocationList";

const shoppingIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1170/1170678.png",
  iconSize: [12, 12],
  iconAnchor: [8, 16],
  popupAnchor: [0, -30],
});

const highlightedIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2331/2331966.png",
  iconSize: [16, 16],
  iconAnchor: [8, 16],
  popupAnchor: [0, -30],
});

const movingPerson = new Icon({
  iconUrl: "https://cdn1.iconfinder.com/data/icons/stride/128/walking-512.png",
  iconSize: [24, 24],
  iconAnchor: [8, 16],
  popupAnchor: [0, -30],
});

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [currentUserLocation, setCurrentUserLocation] = useState([]);
  const [userLocationsOnly, setUserLocationsOnly] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [isModalExpanded, setIsModalExpanded] = useState(true);
  const [users, setUsers] = useState([]);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [comment, setComment] = useState(""); // Nội dung bình luận
  const [rating, setRating] = useState(0); // Điểm đánh giá
  const [hasCommented, setHasCommented] = useState(false);

  useEffect(() => {
    if (selectedLocation) {
      const existingComment = selectedLocation.binh_luan.find(
        (comment) => comment.nguoi_binh_luan === auth?.userId
      );
      setHasCommented(!!existingComment);
    }
  }, [selectedLocation]);

  const handleAddComment = async () => {
    if (!comment || !rating) {
      alert("Vui lòng nhập nội dung bình luận và đánh giá.");
      return;
    }

    try {
      await addCommentToLocation({
        locationId: selectedLocation._id,
        userId: auth.userId,
        rating,
        noi_dung: comment,
      });

      alert("Bình luận của bạn đã được thêm thành công!");
      setComment("");
      setRating(0);

      // Cập nhật lại địa điểm để hiển thị bình luận mới
      const updatedLocation = await getLocationById(selectedLocation._id);
      setSelectedLocation(updatedLocation);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Đã xảy ra lỗi khi thêm bình luận.");
    }
  };

  // Fetch danh sách người dùng
  const fetchUsers = async () => {
    try {
      const userList = await getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch top 50 địa điểm gần nhất
  const fetchTopLocations = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const data = await getTopNearbyLocations(latitude, longitude);
            setLocations([
              { _id: "currentLocation", name: "Vị trí hiện tại", toa_do: [{ lat: latitude, lon: longitude }] },
              ...data,
            ]);
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Không thể lấy vị trí hiện tại.");
          }
        );
      } else {
        alert("Geolocation không được hỗ trợ trên trình duyệt của bạn.");
      }
    } catch (error) {
      console.error("Error fetching top nearby locations:", error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Gọi API lấy danh sách người dùng khi component được mount
    fetchTopLocations(); // Gọi API lấy danh sách địa điểm
  }, []);

  const handleUserOnlyButtonClick = async () => {
    setUserLocationsOnly((prev) => !prev);
    console.log(userLocationsOnly);

    if (!userLocationsOnly) {
      try {
        const locationIds = await getLocationByUserId(auth.userId);
        const locationDetails = await Promise.all(
          locationIds.dia_diem_da_tao.map((id) => getLocationById(id))
        );
        setCurrentUserLocation(locationDetails);
      } catch (error) {
        console.error("Error fetching user locations:", error);
      }
    }
  };

  const handleMarkerClick = (location) => {
    const { lat, lon } = location.toa_do[0];
    handleFlyToLocation(lat, lon, location);
  };

  const handleCloseModal = () => {
    if (selectedLocation) {
      // Tìm marker tương ứng và đóng popup
      const marker = markersRef.current[selectedLocation._id];
      if (marker) {
        marker.closePopup();
      }
    }
    setSelectedLocation(null);
    setRoute(null);
    fetchTopLocations(); // Tùy chọn, nếu không cần refresh thì có thể bỏ
  };

  const handleFlyToLocation = (lat, lon, location) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lon], 18, { duration: 1.5 });
    }
    setSelectedLocation(location);

    // Mở popup của marker tương ứng
    const marker = markersRef.current[location._id];
    if (marker) {
      marker.openPopup();
    }
  };

  const handleEditClick = (location) => {
    navigate(`/update-location/`, { state: { location } });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa địa điểm này chứ?")) {
      try {
        await deleteLocation(id);
        setLocations((prevLocations) =>
          prevLocations.filter((loc) => loc._id !== id)
        );
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  const handleSuggestRoute = async (destination) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const destinationCoords = `${destination.lon},${destination.lat}`;
        const originCoords = `${longitude},${latitude}`;

        const apiKey = "pk.eyJ1IjoiaHV5bGUyNDAzIiwiYSI6ImNtMXc2YTJ0dDBobmYya3ExcXdwcHlleXcifQ.7eNwbkef9hXe-SUkP9oCJQ";
        const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${originCoords};${destinationCoords}?geometries=geojson&access_token=${apiKey}`;

        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const routeGeoJson = data.routes[0].geometry;
            setRoute(routeGeoJson);
            setIsModalExpanded(false); // Thu hẹp modal
          } else {
            alert("Không tìm thấy đường đi phù hợp.");
          }
        } catch (error) {
          console.error("Error fetching route from Mapbox:", error);
          alert("Đã xảy ra lỗi khi lấy đường đi.");
        }
      },
      () => {
        alert("Không thể lấy vị trí hiện tại của bạn.");
      }
    );
  };

  const getUserName = (userId) => {
    const user = users.find((user) => user._id === userId);
    return user ? user.name : "Không xác định";
  };

  const filteredLocations = userLocationsOnly ? currentUserLocation : locations;

  return (
    <div className="map-container">
      {selectedLocation && (
        <div className={`info-modal ${isModalExpanded ? "expanded" : "collapsed"}`}>
          <button className="toggle-button" onClick={() => setIsModalExpanded((prev) => !prev)}>
            {isModalExpanded ? "Thu hẹp" : "Mở rộng"}
          </button>
          {isModalExpanded && (
            <>
              <h2>{selectedLocation.name || "Unnamed Location"}</h2>
              {selectedLocation.url_hinh_anh?.length > 0 && (
                <img
                  src={selectedLocation.url_hinh_anh[0]}
                  alt={selectedLocation.name}
                  className="location-image"
                />
              )}
              <p>
                <strong>Địa chỉ:</strong> {selectedLocation.address || "N/A"}
              </p>
              <p>
                <strong>Mô tả:</strong> {selectedLocation.mo_ta || "N/A"}
              </p>
              <p>
                <strong>Đánh giá:</strong> {selectedLocation.rating || "N/A"}
              </p>
              <p>
                <strong>Thời gian cập nhật:</strong>{" "}
                {new Date(selectedLocation.thoi_gian_cap_nhat).toLocaleString()}
              </p>
              {/* Hiển thị nút chỉnh sửa và xóa nếu người dùng là người tạo */}
              {auth && auth.userId === selectedLocation.nguoi_tao && (
                <div className="modal-buttons">
                  <button
                    className="modal-button modal-edit-button"
                    onClick={() => handleEditClick(selectedLocation)}
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    className="modal-button modal-delete-button"
                    onClick={() => handleDelete(selectedLocation._id)}
                  >
                    Xóa
                  </button>
                </div>
              )}

              <div className="comment-section">
                <h3>Bình luận</h3>
                {auth ? (
                  hasCommented ? (
                    <>
                      <p>Bình luận của bạn:</p>
                      <div className="comment-item">
                        <p>
                          <strong>Điểm:</strong> {selectedLocation.binh_luan.find((cmt) => cmt.nguoi_binh_luan === auth.userId)?.rating}/5
                        </p>
                        <p>{selectedLocation.binh_luan.find((cmt) => cmt.nguoi_binh_luan === auth.userId)?.noi_dung}</p>
                      </div>
                      <textarea
                        className="comment-input"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Cập nhật nội dung bình luận..."
                      />
                      <input
                        type="number"
                        className="rating-input"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        placeholder="Cập nhật điểm (1-5)"
                        min={1}
                        max={5}
                      />
                      <button
                        className="add-comment-button"
                        onClick={async () => {
                          try {
                            await editCommentOnLocation({
                              locationId: selectedLocation._id,
                              userId: auth.userId,
                              rating,
                              noi_dung: comment,
                            });
                            alert("Bình luận đã được cập nhật thành công!");
                            const updatedLocation = await getLocationById(selectedLocation._id);
                            setSelectedLocation(updatedLocation);
                          } catch (error) {
                            alert("Lỗi khi cập nhật bình luận.");
                          }
                        }}
                      >
                        Cập nhật bình luận
                      </button>
                      <button
                        className="delete-comment-button"
                        onClick={async () => {
                          if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
                            try {
                              await deleteCommentOnLocation({
                                locationId: selectedLocation._id,
                                userId: auth.userId,
                              });
                              alert("Bình luận đã được xóa thành công!");
                              const updatedLocation = await getLocationById(selectedLocation._id);
                              setSelectedLocation(updatedLocation);
                            } catch (error) {
                              alert("Lỗi khi xóa bình luận.");
                            }
                          }
                        }}
                      >
                        Xóa bình luận
                      </button>
                    </>
                  ) : (
                    <>
                      <textarea
                        className="comment-input"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Nhập nội dung bình luận..."
                      />
                      <input
                        type="number"
                        className="rating-input"
                        value={rating}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          if (value > 5) {
                            setRating(5); // Giới hạn tối đa là 5
                          } else {
                            setRating(value); // Cập nhật giá trị hợp lệ
                          }
                        }}
                        placeholder="Nhập điểm (1-5)"
                        min={1}
                        max={5}
                      />
                      <button className="add-comment-button" onClick={handleAddComment}>
                        Gửi bình luận
                      </button>
                    </>
                  )
                ) : (
                  <p>Vui lòng đăng nhập để thêm, sửa hoặc xóa bình luận.</p>
                )}
              </div>
              <div className="comments-list">
                <h3>Các bình luận</h3>
                {selectedLocation.binh_luan?.length > 0 ? (
                  <>
                    {selectedLocation.binh_luan.slice(0, 5).map((cmt, index) => (
                      <div key={index} className="comment-item">
                        <p>
                          <strong>Người dùng:</strong> {getUserName(cmt.nguoi_binh_luan)}
                        </p>
                        <p>
                          <strong>Điểm:</strong> {cmt.rating}/5
                        </p>
                        <p>{cmt.noi_dung}</p>
                        <p>
                          <strong>Thời gian:</strong>{" "}
                          {new Date(cmt.thoi_gian_binh_luan).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    {selectedLocation.binh_luan.length > 5 && (
                      <button
                        className="view-more-button"
                        onClick={() => {
                          // Xử lý mở rộng danh sách bình luận
                          const remainingComments = selectedLocation.binh_luan.slice(5);
                          setSelectedLocation({
                            ...selectedLocation,
                            binh_luan: [...selectedLocation.binh_luan.slice(0, 5), ...remainingComments],
                          });
                        }}
                      >
                        Xem thêm bình luận
                      </button>
                    )}
                  </>
                ) : (
                  <p>Chưa có bình luận nào.</p>
                )}
              </div>
            </>
          )}
          <button className="toggle-button" onClick={() => handleSuggestRoute(selectedLocation.toa_do[0])}>Gợi ý đường đi</button>
          <button className="toggle-button" onClick={handleCloseModal}>Đóng</button>
        </div>
      )}
      {auth && (
        <UserOnlyButton
          checked={userLocationsOnly}
          onChange={handleUserOnlyButtonClick}
        />
      )}
      <MapContainer center={[10.8305, 106.7689]} zoom={12} ref={mapRef} className="map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {filteredLocations.map((location, index) => {
          const { _id, name, toa_do } = location;
          if (toa_do && toa_do.length > 0) {
            const { lat, lon } = toa_do[0];

            // Highlight top 8 locations
            const icon =
              _id === "currentLocation"
                ? movingPerson
                : index > 0 && index <= 8
                  ? highlightedIcon
                  : shoppingIcon;

            return (
              <Marker
                key={_id}
                position={[lat, lon]}
                icon={icon}
                ref={(el) => (markersRef.current[_id] = el)}
                eventHandlers={{
                  click: () => handleMarkerClick(location),
                }}
              >
                <Popup>
                  <div>
                    <strong>{name || "Unnamed Location"}</strong>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
        {route && (
          <Polyline
            positions={route.coordinates.map(([lon, lat]) => [lat, lon])}
            color="blue"
          />
        )}
      </MapContainer>
      <LocationList
        locations={filteredLocations}
        onLocationClick={(lat, lon, location) => handleFlyToLocation(lat, lon, location)}
      />
    </div>
  );
};

export default MapComponent;
