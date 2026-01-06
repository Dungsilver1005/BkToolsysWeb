const express = require("express");
const { body, validationResult } = require("express-validator");
const ToolRequest = require("../models/ToolRequest");
const Tool = require("../models/Tool");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/tool-requests
// @desc    Create tool request (User only)
// @access  Private
router.post(
  "/",
  protect,
  [
    body("toolName").notEmpty().withMessage("Vui lòng nhập tên dụng cụ"),
    body("toolCode").notEmpty().withMessage("Vui lòng nhập mã dụng cụ"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Số lượng phải là số nguyên lớn hơn 0"),
    body("purpose").notEmpty().withMessage("Vui lòng nhập mục đích sử dụng"),
    body("expectedDuration")
      .notEmpty()
      .withMessage("Vui lòng nhập thời gian dự kiến"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { toolName, toolCode, quantity, purpose, expectedDuration, notes } =
        req.body;

      // Create request
      const request = await ToolRequest.create({
        toolName,
        toolCode: toolCode.toUpperCase().trim(),
        quantity: parseInt(quantity),
        requestedBy: req.user._id,
        purpose,
        expectedDuration,
        notes,
      });

      const populatedRequest = await ToolRequest.findById(request._id)
        .populate("requestedBy", "username fullName");

      res.status(201).json({
        success: true,
        message: "Gửi yêu cầu thành công",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Create tool request error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }
);

// @route   GET /api/tool-requests
// @desc    Get tool requests
// @access  Private
// User: Get their own requests
// Admin: Get all requests
router.get("/", protect, async (req, res) => {
  try {
    const { status, tool, user } = req.query;
    const query = {};

    // If user is not admin, only show their own requests
    if (req.user.role !== "admin") {
      query.requestedBy = req.user._id;
    } else if (user) {
      // Admin can filter by user
      query.requestedBy = user;
    }

    if (status) {
      query.status = status;
    }

    if (tool) {
      query.tool = tool;
    }

    const requests = await ToolRequest.find(query)
      .populate("tool", "name productCode isInUse location")
      .populate("requestedBy", "username fullName email department")
      .populate("reviewedBy", "username fullName")
      .sort({ createdAt: -1 });

    // Tính số lượng còn lại cho mỗi yêu cầu
    const requestsWithStock = await Promise.all(
      requests.map(async (request) => {
        const requestObj = request.toObject();
        // Lấy toolCode từ request hoặc từ tool đã populate
        const toolCode = request.toolCode || request.tool?.productCode;
        if (toolCode) {
          // Đếm số lượng dụng cụ có sẵn (không đang sử dụng, không bảo trì, không hỏng)
          const availableCount = await Tool.countDocuments({
            productCode: toolCode,
            isInUse: false,
            location: { $ne: "maintenance" },
            status: { $ne: "unusable" },
          });
          requestObj.availableQuantity = availableCount;
          requestObj.hasEnoughStock = availableCount >= (request.quantity || 1);
        } else {
          requestObj.availableQuantity = 0;
          requestObj.hasEnoughStock = false;
        }
        return requestObj;
      })
    );

    res.json({
      success: true,
      count: requestsWithStock.length,
      data: requestsWithStock,
    });
  } catch (error) {
    console.error("Get tool requests error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// @route   GET /api/tool-requests/:id
// @desc    Get single tool request
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const request = await ToolRequest.findById(req.params.id)
      .populate("tool", "name productCode isInUse location")
      .populate("requestedBy", "username fullName email department")
      .populate("reviewedBy", "username fullName");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    // User can only view their own requests unless admin
    if (
      req.user.role !== "admin" &&
      request.requestedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get tool request error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// @route   PUT /api/tool-requests/:id/approve
// @desc    Approve tool request (Admin only)
// @access  Private/Admin
router.put("/:id/approve", protect, authorize("admin"), async (req, res) => {
  try {
    const request = await ToolRequest.findById(req.params.id).populate("tool");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu không ở trạng thái chờ duyệt",
      });
    }

    // Kiểm tra số lượng còn lại trong kho
    const requestedQuantity = request.quantity || 1;
    let availableTools = [];

    if (request.tool) {
      // Nếu đã có tool ID, kiểm tra tool đó
      const tool = await Tool.findById(request.tool._id || request.tool);
      if (tool && !tool.isInUse && tool.location !== "maintenance" && tool.status !== "unusable") {
        availableTools = [tool];
      }
    } else if (request.toolCode) {
      // Tìm các tool có sẵn theo toolCode
      availableTools = await Tool.find({
        productCode: request.toolCode,
        isInUse: false,
        location: { $ne: "maintenance" },
        status: { $ne: "unusable" },
      }).limit(requestedQuantity);
    }

    if (availableTools.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dụng cụ có sẵn trong kho",
      });
    }

    if (availableTools.length < requestedQuantity) {
      return res.status(400).json({
        success: false,
        message: `Chỉ còn ${availableTools.length} dụng cụ trong kho, không đủ so với yêu cầu ${requestedQuantity}`,
      });
    }

    // Gán các tool cho user (hiện tại chỉ gán tool đầu tiên để đơn giản)
    // Nếu cần gán nhiều tool, có thể mở rộng logic sau
    const tool = availableTools[0];

    // Double check tool is still available
    if (tool.isInUse) {
      // Reject the request automatically
      request.status = "rejected";
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      request.rejectionReason = "Dụng cụ đã được gán cho người khác";
      await request.save();

      return res.status(400).json({
        success: false,
        message:
          "Dụng cụ đã được gán cho người khác. Yêu cầu đã được tự động từ chối.",
      });
    }

    // Cập nhật tool ID vào request nếu chưa có
    if (!request.tool) {
      request.tool = tool._id;
      await request.save();
    }

    // Update tool status
    tool.isInUse = true;
    tool.currentUser = request.requestedBy;
    tool.location = "in_use";
    tool.usageCount += 1;
    tool.lastUsedDate = new Date();
    tool.history.push({
      action: "export",
      user: request.requestedBy,
      fromLocation: "warehouse",
      toLocation: "in_use",
      notes: `Yêu cầu được duyệt - Mục đích: ${request.purpose} - Số lượng yêu cầu: ${requestedQuantity}`,
      date: new Date(),
    });
    await tool.save();

    // Update request status
    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.approvedAt = new Date();
    await request.save();

    const populatedRequest = await ToolRequest.findById(request._id)
      .populate("tool", "name productCode")
      .populate("requestedBy", "username fullName")
      .populate("reviewedBy", "username fullName");

    res.json({
      success: true,
      message: "Duyệt yêu cầu thành công",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Approve tool request error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// @route   PUT /api/tool-requests/:id/reject
// @desc    Reject tool request (Admin only)
// @access  Private/Admin
router.put(
  "/:id/reject",
  protect,
  authorize("admin"),
  [
    body("rejectionReason")
      .notEmpty()
      .withMessage("Vui lòng nhập lý do từ chối"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { rejectionReason } = req.body;
      const request = await ToolRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy yêu cầu",
        });
      }

      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Yêu cầu không ở trạng thái chờ duyệt",
        });
      }

      request.status = "rejected";
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();
      request.rejectionReason = rejectionReason;
      await request.save();

      const populatedRequest = await ToolRequest.findById(request._id)
        .populate("tool", "name productCode")
        .populate("requestedBy", "username fullName")
        .populate("reviewedBy", "username fullName");

      res.json({
        success: true,
        message: "Từ chối yêu cầu thành công",
        data: populatedRequest,
      });
    } catch (error) {
      console.error("Reject tool request error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/tool-requests/:id/cancel
// @desc    Cancel tool request (User only, their own requests)
// @access  Private
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const request = await ToolRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    // User can only cancel their own requests
    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền hủy yêu cầu này",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể hủy yêu cầu đang chờ duyệt",
      });
    }

    request.status = "cancelled";
    await request.save();

    const populatedRequest = await ToolRequest.findById(request._id)
      .populate("tool", "name productCode")
      .populate("requestedBy", "username fullName");

    res.json({
      success: true,
      message: "Hủy yêu cầu thành công",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Cancel tool request error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// @route   PUT /api/tool-requests/:id/return
// @desc    Return tool (User only, their own approved requests)
// @access  Private
router.put("/:id/return", protect, async (req, res) => {
  try {
    const { returnNotes } = req.body;
    const request = await ToolRequest.findById(req.params.id).populate("tool");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu",
      });
    }

    // User can only return their own requests
    if (request.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền trả dụng cụ này",
      });
    }

    // Only approved requests can be returned
    if (request.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể trả dụng cụ từ yêu cầu đã được duyệt",
      });
    }

    // Kiểm tra nếu request có tool ID
    if (!request.tool) {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu này chưa được gán dụng cụ cụ thể",
      });
    }

    const tool = await Tool.findById(request.tool._id || request.tool);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dụng cụ",
      });
    }

    // Check if tool is actually assigned to this user
    if (
      !tool.isInUse ||
      tool.currentUser?.toString() !== req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Dụng cụ không được gán cho bạn hoặc đã được trả",
      });
    }

    // Update tool status
    tool.isInUse = false;
    tool.currentUser = null;
    tool.location = "warehouse";
    tool.history.push({
      action: "import",
      user: req.user._id,
      fromLocation: "in_use",
      toLocation: "warehouse",
      notes: returnNotes || "Người dùng trả dụng cụ",
      date: new Date(),
    });
    await tool.save();

    // Update request status
    request.status = "returned";
    request.returnedAt = new Date();
    request.returnNotes = returnNotes || "";
    await request.save();

    const populatedRequest = await ToolRequest.findById(request._id)
      .populate("tool", "name productCode")
      .populate("requestedBy", "username fullName");

    res.json({
      success: true,
      message: "Trả dụng cụ thành công",
      data: populatedRequest,
    });
  } catch (error) {
    console.error("Return tool error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

module.exports = router;
