const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS Configuration - Cho phép tất cả origin
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests không có origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Cho phép tất cả origin trong production
    // Hoặc bạn có thể chỉ định các origin cụ thể:
    // const allowedOrigins = [
    //   'https://your-frontend-domain.com',
    //   'https://www.your-frontend-domain.com',
    //   'http://localhost:3000',
    //   'https://bktoolsysweb-1.onrender.com' // Backend Render
    // ];
    // if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
    //   callback(null, true);
    // } else {
    //   callback(new Error('Not allowed by CORS'));
    // }
    callback(null, true);
  },
  credentials: true, // Cho phép gửi cookies/credentials
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Authorization"], // Cho phép frontend đọc Authorization header
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tools", require("./routes/tool"));
app.use("/api/users", require("./routes/user"));
app.use("/api/export-receipts", require("./routes/exportReceipts"));
app.use("/api/tool-requests", require("./routes/toolRequests"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; // Listen trên tất cả interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
