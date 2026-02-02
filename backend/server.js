require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Normalize origins (remove trailing slashes)
    const allowedOrigin = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : '*';
    const requestOrigin = origin.replace(/\/$/, '');

    if (allowedOrigin === '*' || allowedOrigin === requestOrigin) {
      callback(null, true);
    } else {
      console.log(`BLOCKED BY CORS: Request from ${origin} does not match ${allowedOrigin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Connect to MongoDB
// Connect to MongoDB
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Connection Error:", err));
} else {
  console.error("CRITICAL: MONGO_URI is missing in environment variables!");
}

// Routes
app.get("/", (req, res) => {
  res.send("ClosetRush API is running...");
});

// Import Routes
const productRoutes = require("./routes/products");
const statsRoutes = require("./routes/stats");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const rentalRoutes = require("./routes/rentals");
const walletRoutes = require("./routes/wallet");
const transactionRoutes = require("./routes/transactions");
const messageRoutes = require("./routes/messages");
const deliveryRoutes = require("./routes/delivery");

// Register Routes
app.use("/api/products", productRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/delivery", deliveryRoutes);

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
