import kafkaSetup from "../kafkaService/kafkaSetup";
import prisma from "../src/config/db.config";
import { Server } from "socket.io";
import redis from "../lib/redisServer";


export class Notifications {
  public static async consumeNotifications(io: Server): Promise<void> {
    const consumer = kafkaSetup.consumer({ groupId: "notification-group" });

    try {
      console.log("📡 Connecting to Kafka consumer...");
      await consumer.connect();
      
      console.log("✅ Kafka consumer connected.");

      await consumer.subscribe({ topic: "notification", fromBeginning: false });
      console.log("✅ Subscribed to topic: notification");

      await consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;

          const notificationData = JSON.parse(message.value.toString());
          console.log("📨 Received notification:", notificationData);

          try {
            // Store in database
            await prisma.notification.create({
              data: {
                userId: notificationData.userId,
                senderId: notificationData.senderId,
                type: notificationData.type,
                message: notificationData.message,
                isRead: notificationData.isRead || false,
                createdAt: new Date(notificationData.createdAt),
              },
            });

            console.log("💾 Notification saved to database.");

            const recipientSocketId = await redis.get(`socket:${notificationData.userId}`);
            if (recipientSocketId) {
              console.log(`📡 User ${notificationData.userId} is online. Sending real-time notification.`);
              io.to(recipientSocketId).emit("new_notification", notificationData);
            }
          } catch (dbError) {
            console.error("❌ Database error saving notification:", dbError);
          }
        },
      });
    } catch (error) {
      console.error("❌ Error consuming notifications:", error);
    }
  }
}
