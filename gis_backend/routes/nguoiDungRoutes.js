const express = require("express");
const router = express.Router();
const nguoiDungController = require("../controllers/nguoiDungController");

// Route tạo mới một người dùng (POST)
router.post("/nguoidung", nguoiDungController.createNguoiDung);

// Route xác nhận email (POST)
router.post("/nguoidung/verify-code", nguoiDungController.verifyCode);

// Route gửi lại mã xác nhận email (POST)
router.post("/nguoidung/resend-verification-code", nguoiDungController.resendVerificationCode);

// Route đăng nhập (POST)
router.post("/nguoidung/login", nguoiDungController.loginNguoiDung);

// Route lấy tất cả người dùng (GET)
router.get("/nguoidung", nguoiDungController.getAllNguoiDung);

// Route lấy thông tin một người dùng theo ID (GET)
router.get("/nguoidung/:id", nguoiDungController.getNguoiDungById);

// Route cập nhật thông tin một người dùng theo ID (PUT)
router.put("/nguoidung/:id", nguoiDungController.updateNguoiDung);

// Route xóa một người dùng theo ID (DELETE)
router.delete("/nguoidung/:id", nguoiDungController.deleteNguoiDung);

// Route lấy địa điểm đã tạo
router.get("/nguoidung/dia-diem/:id", nguoiDungController.getDiaDiemByUserId);

module.exports = router;
