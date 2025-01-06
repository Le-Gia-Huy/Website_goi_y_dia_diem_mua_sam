const express = require("express");
const router = express.Router();
const diaDiemController = require("../controllers/diaDiemController");

// Route tạo mới một địa điểm (POST)
router.post("/diadiem", diaDiemController.createDiaDiem);

// Route lấy tất cả các địa điểm (GET)
router.get("/diadiem", diaDiemController.getAllDiaDiem);

// Lấy top 10 địa điểm gần nhất và có rating cao nhất
router.get("/diadiem/top-nearby", diaDiemController.getTopNearbyLocations);

// Thêm bình luận vào địa điểm
router.post("/diadiem/comment", diaDiemController.addComment);

// Chỉnh sửa bình luận
router.put("/diadiem/comment", diaDiemController.editComment);

// Xóa bình luận
router.delete("/diadiem/comment", diaDiemController.deleteComment);

// Route lấy thông tin một địa điểm theo ID (GET)
router.get("/diadiem/:id", diaDiemController.getDiaDiemById);

// Route cập nhật thông tin một địa điểm theo ID (PUT)
router.put("/diadiem/:id", diaDiemController.updateDiaDiem);

// Route xóa một địa điểm theo ID (DELETE)
router.delete("/diadiem/:id", diaDiemController.deleteDiaDiem);


module.exports = router;
