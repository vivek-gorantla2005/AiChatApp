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
            } else {
              console.log(`User ${chatData.receiverId} is offline. Saving message to database...`);
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
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        },
      });
    } catch (error) {
      console.error("Error consuming messages:", error);
    }
  }
}
