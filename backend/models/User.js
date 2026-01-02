const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Vui lòng nhập tên đăng nhập"],
    unique: true,
    trim: true,
    minlength: [3, "Tên đăng nhập phải có ít nhất 3 ký tự"],
  },
  email: {
    type: String,
    required: [true, "Vui lòng nhập email"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Vui lòng nhập mật khẩu"],
    minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  fullName: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  accessHistory: [
    {
      loginTime: {
        type: Date,
        default: Date.now,
      },
      ipAddress: String,
      userAgent: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
