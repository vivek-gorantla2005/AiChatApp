import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import Redis from "ioredis";
import { router } from "../routes/backend";
import { Notifications } from "../controller/Notifications";
import { createServer } from "http";
import { Server } from "socket.io";
import { HandleChats } from "../controller/chatManagement";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/api", router);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


const addUserToRedis = async (userId: string, socketId: string) => {
  if (!userId || !socketId) return;

  await redis.set(`socket:${userId}`, socketId);
  await redis.sadd("online_users", userId);
  console.log(`🔄 User ${userId} is now online`);
};

const removeUserFromRedis = async (socketId: string) => {
  try {
    const keys = await redis.keys("socket:*");
    for (const key of keys) {
      const storedSocketId = await redis.get(key);
      if (storedSocketId === socketId) {
        await redis.del(key);
        const userId = key.split(":")[1];
        await redis.srem("online_users", userId);
        console.log(`🗑️ Removed user ${userId} from online list`);
      }
    }
  } catch (error) {
    console.error("❌ Error removing user from Redis:", error);
  }
};

// Handle user connections
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on("user_online", async (userId) => {
    if (!userId) return;
    await addUserToRedis(userId, socket.id);
  });

  socket.on("disconnect", async () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    await removeUserFromRedis(socket.id);
  });
});

// API route to get online users
app.get("/api/online-users", async (req, res) => {
  try {
    const onlineUsers = await redis.smembers("online_users");
    res.json({ onlineUsers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch online users" });
  }
});

// Pass `io` to Kafka notification consumer
Notifications.consumeNotifications(io);
HandleChats.consumeMessages(io);

// Start server
server.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    await redis.ping();
    console.log("✅ Redis connected successfully!");

    console.log("✅ Kafka connected successfully!");
  } catch (error) {
    console.error("❌ Database or Redis connection failed:", error);
  }
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
