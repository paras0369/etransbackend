const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB using mongoose
mongoose.set('bufferCommands', false);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5
    });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

// Middleware to check database connection
function ensureDbConnected(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      success: false, 
      message: 'Database connection not ready' 
    });
  }
  next();
}

// Initialize routes and start server only after DB connection
async function startServer() {
  await connectDB();
  
  // Routes
  const authRoutes = require("./routes/auth");
  const equipmentDataRoutes = require("./routes/equipmentData");

  app.use("/api/auth", ensureDbConnected, authRoutes);
  app.use("/api/equipment-data", ensureDbConnected, equipmentDataRoutes);

  app.get("/", (req, res) => {
    res.json({ message: "Etrans Backend Server is running!" });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
