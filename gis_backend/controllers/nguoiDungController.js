const NguoiDung = require("../models/NguoiDung");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Tạo đối tượng gửi email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '21522146@gm.uit.edu.vn',  // Thay thế bằng email của bạn
    pass: 'beivxasulbugddkj',   // Thay thế bằng mật khẩu email của bạn hoặc App password nếu bật xác minh 2 bước
  },
});

// Đăng ký người dùng với xác nhận qua email
exports.createNguoiDung = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const existingUser = await NguoiDung.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo mã xác thực gồm 6 chữ số
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 phút

    const nguoiDung = new NguoiDung({
      name,
      username,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
      do_uy_tin: 0,
    });

    await nguoiDung.save();

    // Gửi email với mã xác thực
    const mailOptions = {
      from: "21522146@gm.uit.edu.vn",
      to: username,
      subject: "Xác nhận tài khoản của bạn",
      html: `
        <h3>Chào ${name},</h3>
        <p>Mã xác nhận của bạn là: <b>${verificationCode}</b>.</p>
        <p>Mã có hiệu lực trong 15 phút.</p>
        <p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Không thể gửi email xác thực. Vui lòng thử lại sau.' });
    }

    res.status(201).json({ message: "Vui lòng kiểm tra email để nhận mã xác thực" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xác nhận email
exports.verifyCode = async (req, res) => {
  try {
    const { username, code } = req.body;

    // Tìm người dùng với username và mã xác thực
    const nguoiDung = await NguoiDung.findOne({ username, verificationCode: code });

    if (!nguoiDung) {
      return res.status(400).json({ message: "Mã xác thực không hợp lệ" });
    }

    // Kiểm tra hạn sử dụng mã
    if (Date.now() > nguoiDung.verificationCodeExpires) {
      return res.status(400).json({ message: "Mã xác thực đã hết hạn" });
    }

    // Xác thực thành công
    nguoiDung.isVerified = true;
    nguoiDung.verificationCode = null; // Xóa mã sau khi xác thực
    nguoiDung.verificationCodeExpires = null;
    await nguoiDung.save();

    res.status(200).json({ message: "Xác thực thành công!" });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: "Lỗi xác thực", error });
  }
};

// Gửi lại mã xác nhận
exports.resendVerificationCode = async (req, res) => {
  try {
    const { username } = req.body;

    // Tìm người dùng theo username
    const nguoiDung = await NguoiDung.findOne({ username });

    if (!nguoiDung) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }

    if (nguoiDung.isVerified) {
      return res.status(400).json({ message: "Tài khoản đã được xác nhận" });
    }

    // Tạo mã xác nhận mới và thời gian hết hạn
    const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newVerificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 phút

    // Cập nhật mã xác nhận vào cơ sở dữ liệu
    nguoiDung.verificationCode = newVerificationCode;
    nguoiDung.verificationCodeExpires = newVerificationCodeExpires;
    await nguoiDung.save();

    // Gửi email với mã xác nhận mới
    const mailOptions = {
      from: "21522146@gm.uit.edu.vn",
      to: username,
      subject: "Mã xác nhận mới của bạn",
      html: `
        <h3>Chào ${nguoiDung.name},</h3>
        <p>Mã xác nhận mới của bạn là: <b>${newVerificationCode}</b>.</p>
        <p>Mã có hiệu lực trong 15 phút.</p>
        <p>Nếu bạn không yêu cầu gửi lại mã, vui lòng bỏ qua email này.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Resent verification code email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ message: 'Không thể gửi email xác thực. Vui lòng thử lại sau.' });
    }

    res.status(200).json({ message: "Mã xác nhận mới đã được gửi đến email của bạn" });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ message: "Lỗi khi gửi lại mã xác nhận", error });
  }
};

// Tạo token login
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "defaultsecret";
  return jwt.sign({ id: userId }, secret, { expiresIn: "1d" });
};

// Đăng nhập
exports.loginNguoiDung = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Tìm người dùng theo username
    const nguoiDung = await NguoiDung.findOne({ username });

    if (!nguoiDung) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    // So sánh mật khẩu
    const isMatch = await nguoiDung.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu không đúng" });
    }

    // Kiểm tra nếu tài khoản đã được xác nhận
    if (!nguoiDung.isVerified) {
      return res.status(400).json({ message: 'Vui lòng xác nhận email để đăng nhập' });
    }

    // Tạo token
    const token = generateToken(nguoiDung._id);
    const userId = nguoiDung._id

    res.status(200).json({ message: "Đăng nhập thành công", token, userId });
  } catch (error) {
    res.status(500).json({ message: "Đăng nhập thất bại", error });
  }
};

// Lấy tất cả người dùng
exports.getAllNguoiDung = async (req, res) => {
  try {
    const nguoiDungList = await NguoiDung.find();
    res.status(200).json(nguoiDungList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin một người dùng theo ID
exports.getNguoiDungById = async (req, res) => {
  try {
    const nguoiDung = await NguoiDung.findById(req.params.id);
    if (!nguoiDung) return res.status(404).json({ message: "Người dùng không tồn tại" });
    res.status(200).json(nguoiDung);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin một người dùng theo ID
exports.updateNguoiDung = async (req, res) => {
  try {
    const nguoiDung = await NguoiDung.findById(req.params.id);
    if (!nguoiDung) return res.status(404).json({ message: "Người dùng không tồn tại" });

    // Kiểm tra nếu người dùng muốn thay đổi mật khẩu
    if (req.body.currentPassword && req.body.newPassword) {
      // So sánh mật khẩu hiện tại
      const isMatch = await bcrypt.compare(req.body.currentPassword, nguoiDung.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
      }
      // Hash mật khẩu mới
      req.body.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    // Cập nhật thông tin người dùng
    const updatedNguoiDung = await NguoiDung.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedNguoiDung);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa một người dùng theo ID
exports.deleteNguoiDung = async (req, res) => {
  try {
    const nguoiDung = await NguoiDung.findByIdAndDelete(req.params.id);
    if (!nguoiDung) return res.status(404).json({ message: "Người dùng không tồn tại" });
    res.status(200).json({ message: "Người dùng đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDiaDiemByUserId = async (req, res) => {
  try {
    // Find the user by ID
    const user = await NguoiDung.findById(req.params.id);
    // If the user is not found, return a 404 response
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });
    // Respond with the "dia_diem_da_tao" field
    res.status(200).json({ dia_diem_da_tao: user.dia_diem_da_tao });
  } catch (error) {
    // Handle any server errors
    res.status(500).json({ message: error.message });
  }
};