const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const BinhLuanNguoiDungSchema = new mongoose.Schema({
  rating: Number,
  noi_dung: String,
  dia_diem: String
});

const NguoiDungSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false }, // Trạng thái xác thực
  verificationCode: { type: String, default: null }, // Mã xác thực
  verificationCodeExpires: { type: Date, default: null }, // Hạn sử dụng mã xác thực
  binh_luan: [BinhLuanNguoiDungSchema],
  dia_diem_da_tao: [String],
  do_uy_tin: Number
});

// Phương thức để so sánh mật khẩu
NguoiDungSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("NguoiDung", NguoiDungSchema);
