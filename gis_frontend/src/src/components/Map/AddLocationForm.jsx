import React, { useState, useContext } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { createLocation } from '../../services/diaDiemService';
import { AuthContext } from '../../context/AuthContext';
import "../../styles/AddLocationForm.css";

const AddLocationForm = () => {
  const { auth } = useContext(AuthContext);
  const [locationData, setLocationData] = useState({
    name: '',
    address: '',
    toa_do: [{ lon: '', lat: '' }],
    mo_ta: '',
    url_hinh_anh: [''],
    rating: 2.5,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLocation(locationData);
      alert('Địa điểm đã được thêm thành công');
    } catch (error) {
      console.error('Error creating location:', error);
      alert('Đã xảy ra lỗi khi thêm địa điểm');
    }
  };

  return (
    <Container className='box'>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label className='label'>Tên địa điểm</Form.Label>
          <Form.Control
            type="text"
            placeholder="Tên địa điểm"
            value={locationData.name}
            onChange={(e) =>
              setLocationData({ ...locationData, name: e.target.value })
            }
            className='input'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className='label'>Địa chỉ</Form.Label>
          <Form.Control
            type="text"
            placeholder="Địa chỉ"
            value={locationData.address}
            onChange={(e) =>
              setLocationData({ ...locationData, address: e.target.value })
            }
            className='input'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className='label'>Kinh độ</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập kinh độ"
            value={locationData.toa_do[0].lon}
            onChange={(e) =>
              setLocationData({
                ...locationData,
                toa_do: [{ ...locationData.toa_do[0], lon: e.target.value }]
              })
            }
            className='input'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className='label'>Vĩ độ</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập vĩ độ"
            value={locationData.toa_do[0].lat}
            onChange={(e) =>
              setLocationData({
                ...locationData,
                toa_do: [{ ...locationData.toa_do[0], lat: e.target.value }]
              })
            }
            className='input'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className='label'>Mô tả</Form.Label>
          <Form.Control
            type="text"
            placeholder="Mô tả địa điểm"
            value={locationData.mo_ta}
            onChange={(e) =>
              setLocationData({ ...locationData, mo_ta: e.target.value })
            }
            className='input'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className='label'>URL hình ảnh</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập URL hình ảnh"
            value={locationData.url_hinh_anh[0]}
            onChange={(e) =>
              setLocationData({ ...locationData, url_hinh_anh: [e.target.value] })
            }
            className='input'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className='label'>Đánh giá</Form.Label>
          <Form.Control
            type="number"
            placeholder="Nhập đánh giá"
            value={locationData.rating}
            onChange={(e) =>
              setLocationData({ ...locationData, rating: e.target.value })
            }
            className='input'
            required
          />
        </Form.Group>
        <div className="button-container">
          <Button variant="success" type="submit">
            Thêm địa điểm
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddLocationForm;
