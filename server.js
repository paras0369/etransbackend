const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB using mongoose
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  maxPoolSize: 10,
  minPoolSize: 5
})
.then(() => {
  console.log("Connected to MongoDB successfully!");
})
.catch((error) => {
  console.error("MongoDB connection error:", error);
});

// Routes
const authRoutes = require("./routes/auth");
const equipmentDataRoutes = require("./routes/equipmentData");

app.use("/api/auth", authRoutes);
app.use("/api/equipment-data", equipmentDataRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Etrans Backend Server is running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
