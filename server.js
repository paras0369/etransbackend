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

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0
    });
    isConnected = true;
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
}

// Middleware to ensure database connection with auto-retry
async function ensureDbConnected(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Database not connected, attempting to reconnect...");
      await connectDB();
    }
    next();
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return res.status(503).json({ 
      success: false, 
      message: 'Database connection failed. Please try again.' 
    });
  }
}

// Routes setup for serverless
const authRoutes = require("./routes/auth");
const equipmentDataRoutes = require("./routes/equipmentData");

app.use("/api/auth", ensureDbConnected, authRoutes);
app.use("/api/equipment-data", ensureDbConnected, equipmentDataRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Etrans Backend Server is running!" });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  
  // Connect to DB first for local development
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }).catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

// Export for Vercel serverless
module.exports = app;
