import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { SocketController } from "./controllers/socketController";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import roomRoutes from "./routes/roomRoutes";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRouter";
import meetRoutes from "./routes/meetRoute";
import environmentRoutes from "./routes/enronmentRoute";
import "reflect-metadata";
import { AppDataSource } from "./config/dataSource";
import { DB_PASSWORD, CLIENT_URL as FRONTENDURL } from "./config/env";

const app = express();
const server = http.createServer(app);
AppDataSource.initialize().then(() => {
  console.log("Datasource initialized successfully");
});

// Environment variables
const PORT = process.env.PORT || 5000;
const CLIENT_URL = FRONTENDURL || "http://localhost:3000";

// CORS configuration
const corsOptions = {
  origin: [CLIENT_URL, "http://localhost:3000", "https://coinconnect-call.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize socket controller
const socketController = new SocketController(io);

// Routes
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/meet", meetRoutes);
app.use("/api/environment", environmentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  const stats = socketController.getRoomStats();
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      ...stats,
    },
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Global error handlers
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Client URL: ${CLIENT_URL}`);
});

export default app;