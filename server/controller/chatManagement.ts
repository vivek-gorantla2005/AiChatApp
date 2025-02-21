import { Request, Response } from "express";
import kafkaSetup from "../kafkaService/kafkaSetup";
import prisma from "../src/config/db.config";
import redis from "../lib/redisServer";
import { Server } from "socket.io";

export class HandleChats {
  public static async consumeMessages(io: Server) {
    const consumer = kafkaSetup.consumer({ groupId: "chat-group" });

    try {
      console.log("Connecting to Kafka consumer...");
      await consumer.connect();
      console.log("Kafka consumer connected.");

      await consumer.subscribe({ topic: "message", fromBeginning: false });
      console.log("Subscribed to 'message' topic.");

      await consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;

          const chatData = JSON.parse(message.value.toString());
          console.log("Received message:", chatData);

          try {
            const recipientSocket = await redis.get(`socket:${chatData.receiverId}`);

            if (recipientSocket) {
              console.log(`User ${chatData.receiverId} is online. Sending message via WebSocket...`);

              io.to(recipientSocket).emit("receiveMessage", chatData);
            } 

            await prisma.message.create({
              data: {
                conversationId: chatData.conversationId,
                senderId: chatData.senderId,
                receiverId: chatData.receiverId,
                text: chatData.text || "",
                messageType: chatData.messageType,
                isRead: false,
                createdAt: new Date(chatData.createdAt),
              },
            });
          } catch (error) {
            console.error("Error processing message:", error);
          }
        },
      });
    } catch (error) {
      console.error("Error consuming messages:", error);
    }
  }

 

  public static async getMessages(req: Request, res: Response): Promise<void> {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    try {

      const sentMessages = await prisma.message.findMany({
        where: { senderId: userId as string },
        orderBy: { createdAt: "asc" },
      });

      const receivedMessages = await prisma.message.findMany({
        where: { receiverId: userId as string },
      });
      console.log(receivedMessages)
      res.json({ sentMessages, receivedMessages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
