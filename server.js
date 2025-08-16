const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Configure mongoose for serverless
mongoose.set('bufferCommands', false);

// Global database connection for serverless
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    // Disconnect any existing connection before reconnecting
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    
    cachedConnection = connection;
    console.log("Connected to MongoDB successfully!");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    cachedConnection = null; // Clear cache on error
    throw error;
  }
}

// Enhanced middleware for better serverless handling
async function ensureDbConnected(req, res, next) {
  try {
    // Check current connection state
    if (mongoose.connection.readyState === 1) {
      return next();
    }
    
    // If disconnected or connecting, wait for connection
    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 2) {
      console.log("Establishing database connection...");
      await connectToDatabase();
      return next();
    }
    
    // If disconnecting, wait a moment and retry
    if (mongoose.connection.readyState === 3) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return ensureDbConnected(req, res, next);
    }
    
    // Fallback: attempt connection
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(503).json({ 
      success: false, 
      message: 'Database service temporarily unavailable' 
    });
  }
}

// Routes setup for serverless
const authRoutes = require("./routes/auth");
const equipmentDataRoutes = require("./routes/equipmentData");
const feedersRoutes = require("./routes/feeders");
const equipmentTypesRoutes = require("./routes/equipmentTypes");

app.use("/api/auth", ensureDbConnected, authRoutes);
app.use("/api/equipment-data", ensureDbConnected, equipmentDataRoutes);
app.use("/api/feeders", ensureDbConnected, feedersRoutes);
app.use("/api/equipment-types", ensureDbConnected, equipmentTypesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Etrans Backend Server is running!" });
});

// Initialize connection for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  
  connectToDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }).catch(error => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
} else {
  // For Vercel: Initialize connection on first request
  connectToDatabase().catch(console.error);
}

// Export for Vercel serverless
module.exports = app;
