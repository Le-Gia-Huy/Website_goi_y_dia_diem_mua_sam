const mongoose = require("mongoose");

const ToaDoSchema = new mongoose.Schema({
  lon: Number,
  lat: Number
});

const KhoiSchema = new mongoose.Schema({
  chieu_cao: Number,
  toa_do: [ToaDoSchema]
});

const BinhLuanSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  noi_dung: { type: String, required: true },
  nguoi_binh_luan: { type: String, required: true }, // ID người bình luận
  thoi_gian_binh_luan: { type: Date, default: Date.now } // Thời gian bình luận
});

const DiaDiemSchema = new mongoose.Schema({
  name: String,
  address: String,
  toa_do: [ToaDoSchema],
  khoi: [KhoiSchema], // Định nghĩa khoi là mảng các đối tượng khoi
  mo_ta: String,
  url_hinh_anh: [String],
  rating: Number,
  binh_luan: [BinhLuanSchema],
  nguoi_tao: String,
  thoi_gian_cap_nhat: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DiaDiem", DiaDiemSchema);
