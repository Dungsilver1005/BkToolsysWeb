const mongoose = require("mongoose");

const toolRequestSchema = new mongoose.Schema({
  tool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tool",
    default: null,
  },
  toolName: {
    type: String,
    required: [true, "Vui lòng nhập tên dụng cụ"],
    trim: true,
  },
  toolCode: {
    type: String,
    required: [true, "Vui lòng nhập mã dụng cụ"],
    trim: true,
    uppercase: true,
  },
  quantity: {
    type: Number,
    required: [true, "Vui lòng nhập số lượng"],
    min: [1, "Số lượng phải lớn hơn 0"],
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  purpose: {
    type: String,
    required: [true, "Vui lòng nhập mục đích sử dụng"],
    trim: true,
  },
  expectedDuration: {
    type: String,
    required: [true, "Vui lòng nhập thời gian dự kiến"],
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled", "returned"],
    default: "pending",
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  returnedAt: {
    type: Date,
    default: null,
  },
  returnNotes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt before saving
toolRequestSchema.pre("save", async function () {
  this.updatedAt = new Date();
});

// Index for efficient queries
toolRequestSchema.index({ tool: 1, requestedBy: 1, status: 1 });
toolRequestSchema.index({ requestedBy: 1 });
toolRequestSchema.index({ status: 1 });

module.exports = mongoose.model("ToolRequest", toolRequestSchema);
