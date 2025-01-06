require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Thêm dòng này
const connectDB = require("./config/db");
const diaDiemRoutes = require("./routes/diaDiemRoutes");
const nguoiDungRoutes = require("./routes/nguoiDungRoutes");

const app = express();
connectDB();

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000', // Chỉ định nguồn gốc được phép truy cập
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP được phép
}));

app.use(express.json());
app.use("/api", diaDiemRoutes);
app.use("/api", nguoiDungRoutes);

module.exports = app;
