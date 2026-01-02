const mongoose = require("mongoose");

const exportReceiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
  },
  exportDate: {
    type: Date,
    default: Date.now,
  },
  exportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tools: [
    {
      tool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      notes: String,
    },
  ],
  purpose: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ExportReceipt", exportReceiptSchema);
