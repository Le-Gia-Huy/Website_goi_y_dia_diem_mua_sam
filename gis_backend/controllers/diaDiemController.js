const DiaDiem = require("../models/DiaDiem");
const NguoiDung = require("../models/NguoiDung");

// Tạo mới một địa điểm
exports.createDiaDiem = async (req, res) => {
  try {
    const { locationData, userId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!locationData || !userId) {
      return res.status(400).json({ message: "Thiếu dữ liệu cần thiết." });
    }

    // Tạo địa điểm mới
    const newLocation = new DiaDiem(locationData);
    const savedLocation = await newLocation.save();

    // Cập nhật danh sách `dia_diem_da_tao` của người dùng
    const user = await NguoiDung.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    user.dia_diem_da_tao.push(savedLocation._id.toString());
    await user.save();

    res.status(201).json({ message: "Địa điểm đã được tạo thành công!", location: savedLocation });
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi tạo địa điểm: ${error.message}` });
  }
};

// Lấy tất cả các địa điểm
exports.getAllDiaDiem = async (req, res) => {
  try {
    const diaDiemList = await DiaDiem.find();
    res.status(200).json(diaDiemList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin một địa điểm theo ID
exports.getDiaDiemById = async (req, res) => {
  try {
    const diaDiem = await DiaDiem.findById(req.params.id);
    if (!diaDiem) return res.status(404).json({ message: "Địa điểm không tồn tại" });
    res.status(200).json(diaDiem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin một địa điểm theo ID
exports.updateDiaDiem = async (req, res) => {
  try {
    const updatedDiaDiem = await DiaDiem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDiaDiem) return res.status(404).json({ message: "Địa điểm không tồn tại" });
    res.status(200).json(updatedDiaDiem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa một địa điểm theo ID
exports.deleteDiaDiem = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm địa điểm cần xóa
    const diaDiem = await DiaDiem.findById(id);

    if (!diaDiem) {
      return res.status(404).json({ message: "Địa điểm không tồn tại." });
    }

    // Xóa địa điểm khỏi danh sách `dia_diem_da_tao` của người tạo
    const user = await NguoiDung.findById(diaDiem.nguoi_tao);
    if (user) {
      user.dia_diem_da_tao = user.dia_diem_da_tao.filter(
        (diaDiemId) => diaDiemId.toString() !== id
      );
      await user.save();
    }

    // Xóa địa điểm
    await DiaDiem.findByIdAndDelete(id);

    res.status(200).json({ message: "Địa điểm đã được xóa thành công." });
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi xóa địa điểm: ${error.message}` });
  }
};

exports.getTopNearbyLocations = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "Thiếu tọa độ lat và lon." });
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    const R = 6371; // Bán kính Trái Đất (km)

    const nearbyLocations = await DiaDiem.aggregate([
      {
        $addFields: {
          distance: {
            $multiply: [
              R,
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $divide: [{ $multiply: [latNum, Math.PI] }, 180] } },
                        { $sin: { $divide: [{ $multiply: [{ $arrayElemAt: ["$toa_do.lat", 0] }, Math.PI] }, 180] } }
                      ]
                    },
                    {
                      $multiply: [
                        { $cos: { $divide: [{ $multiply: [latNum, Math.PI] }, 180] } },
                        { $cos: { $divide: [{ $multiply: [{ $arrayElemAt: ["$toa_do.lat", 0] }, Math.PI] }, 180] } },
                        {
                          $cos: {
                            $subtract: [
                              { $divide: [{ $multiply: [{ $arrayElemAt: ["$toa_do.lon", 0] }, Math.PI] }, 180] },
                              { $divide: [{ $multiply: [lonNum, Math.PI] }, 180] }
                            ]
                          }
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        }
      },
      { $sort: { distance: 1 } }, // Sắp xếp theo khoảng cách tăng dần
      { $limit: 50 }, // Lấy tối đa 50 địa điểm
      {
        $project: {
          name: 1,
          address: 1,
          toa_do: 1,
          khoi: 1,
          mo_ta: 1,
          url_hinh_anh: 1,
          rating: 1,
          binh_luan: 1,
          nguoi_tao: 1,
          thoi_gian_cap_nhat: 1,
          distance: 1, // Bao gồm trường khoảng cách
        }
      }
    ]);

    // Sắp xếp lại 50 địa điểm theo rating giảm dần
    const sortedLocations = nearbyLocations.sort((a, b) => b.rating - a.rating);

    res.status(200).json(sortedLocations);
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi lấy danh sách: ${error.message}` });
  }
};

// Thêm bình luận vào địa điểm
exports.addComment = async (req, res) => {
  try {
    const { locationId, userId, rating, noi_dung } = req.body;

    if (!locationId || !userId || rating === undefined || !noi_dung) {
      return res.status(400).json({ message: "Thiếu dữ liệu cần thiết." });
    }

    const diaDiem = await DiaDiem.findById(locationId);

    if (!diaDiem) {
      return res.status(404).json({ message: "Địa điểm không tồn tại." });
    }

    // Kiểm tra xem người dùng đã bình luận chưa
    const existingComment = diaDiem.binh_luan.find(
      (comment) => comment.nguoi_binh_luan === userId
    );

    if (existingComment) {
      return res.status(400).json({ message: "Bạn chỉ có thể bình luận một lần trên mỗi địa điểm." });
    }

    // Thêm bình luận mới
    const newComment = {
      rating,
      noi_dung,
      nguoi_binh_luan: userId,
      thoi_gian_binh_luan: new Date(),
    };
    diaDiem.binh_luan.push(newComment);

    // Tính toán lại rating trung bình
    const totalRating = diaDiem.binh_luan.reduce((sum, comment) => sum + comment.rating, 0);
    diaDiem.rating = totalRating / diaDiem.binh_luan.length;

    // Tăng độ uy tín cho người bình luận
    const user = await NguoiDung.findById(userId);
    if (user) {
      user.do_uy_tin = (user.do_uy_tin || 0) + 1;
      await user.save();
    }

    // Tăng hoặc giảm độ uy tín cho người tạo địa điểm dựa trên rating
    const creator = await NguoiDung.findById(diaDiem.nguoi_tao);
    if (creator) {
      let additionalReputation = 0;
      switch (rating) {
        case 5:
          additionalReputation = 5;
          break;
        case 4:
          additionalReputation = 2;
          break;
        case 3:
          additionalReputation = 1;
          break;
        case 2:
          additionalReputation = -1;
          break;
        case 1:
          additionalReputation = -5;
          break;
      }
      creator.do_uy_tin = (creator.do_uy_tin || 0) + additionalReputation;
      await creator.save();
    }

    await diaDiem.save();

    res.status(200).json({ message: "Bình luận đã được thêm thành công!", diaDiem });
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi thêm bình luận: ${error.message}` });
  }
};

// Chỉnh sửa bình luận của người dùng
exports.editComment = async (req, res) => {
  try {
    const { locationId, userId, rating, noi_dung } = req.body;

    if (!locationId || !userId || rating === undefined || !noi_dung) {
      return res.status(400).json({ message: "Thiếu dữ liệu cần thiết." });
    }

    const diaDiem = await DiaDiem.findById(locationId);

    if (!diaDiem) {
      return res.status(404).json({ message: "Địa điểm không tồn tại." });
    }

    // Tìm bình luận của người dùng
    const userCommentIndex = diaDiem.binh_luan.findIndex(
      (comment) => comment.nguoi_binh_luan === userId
    );

    if (userCommentIndex === -1) {
      return res.status(404).json({ message: "Bạn chưa có bình luận nào để chỉnh sửa." });
    }

    // Lấy rating cũ để tính toán chênh lệch độ uy tín
    const oldRating = diaDiem.binh_luan[userCommentIndex].rating;

    // Cập nhật nội dung bình luận
    diaDiem.binh_luan[userCommentIndex].rating = rating;
    diaDiem.binh_luan[userCommentIndex].noi_dung = noi_dung;
    diaDiem.binh_luan[userCommentIndex].thoi_gian_binh_luan = new Date();

    // Tính toán lại rating trung bình
    const totalRating = diaDiem.binh_luan.reduce((sum, comment) => sum + comment.rating, 0);
    diaDiem.rating = totalRating / diaDiem.binh_luan.length;

    // Cập nhật độ uy tín cho người tạo địa điểm
    const creator = await NguoiDung.findById(diaDiem.nguoi_tao);
    if (creator) {
      const calculateReputationChange = (rating) => {
        switch (rating) {
          case 5:
            return 5;
          case 4:
            return 2;
          case 3:
            return 1;
          case 2:
            return -1;
          case 1:
            return -5;
          default:
            return 0;
        }
      };

      const oldReputationChange = calculateReputationChange(oldRating);
      const newReputationChange = calculateReputationChange(rating);
      creator.do_uy_tin = (creator.do_uy_tin || 0) - oldReputationChange + newReputationChange;
      await creator.save();
    }

    await diaDiem.save();

    res.status(200).json({ message: "Bình luận đã được cập nhật thành công!", diaDiem });
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi chỉnh sửa bình luận: ${error.message}` });
  }
};


// Xóa bình luận
exports.deleteComment = async (req, res) => {
  try {
    const { locationId, userId } = req.body;

    if (!locationId || !userId) {
      return res.status(400).json({ message: "Thiếu dữ liệu cần thiết." });
    }

    const diaDiem = await DiaDiem.findById(locationId);

    if (!diaDiem) {
      return res.status(404).json({ message: "Địa điểm không tồn tại." });
    }

    // Tìm bình luận của người dùng
    const userCommentIndex = diaDiem.binh_luan.findIndex(
      (comment) => comment.nguoi_binh_luan === userId
    );

    if (userCommentIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy bình luận của bạn." });
    }

    // Xóa bình luận
    diaDiem.binh_luan.splice(userCommentIndex, 1);

    // Tính toán lại rating trung bình
    if (diaDiem.binh_luan.length > 0) {
      const totalRating = diaDiem.binh_luan.reduce((sum, comment) => sum + comment.rating, 0);
      diaDiem.rating = totalRating / diaDiem.binh_luan.length;
    } else {
      diaDiem.rating = 0; // Không còn bình luận
    }

    await diaDiem.save();

    res.status(200).json({ message: "Bình luận đã được xóa thành công!", diaDiem });
  } catch (error) {
    res.status(500).json({ message: `Lỗi khi xóa bình luận: ${error.message}` });
  }
};