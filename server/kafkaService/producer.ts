import { Request, Response } from "express";
import kafkaSetup from "./kafkaSetup";
import prisma from "../src/config/db.config";

const kafka = kafkaSetup.producer();

export default class NotificationService {
    static async friendReqNotification(req: Request, res: Response): Promise<void> {
        const { userId, senderId, type, message, isRead, createdAt } = req.body
        console.log('connecting to producer')
        await kafka.connect();
        console.log('connected to producer')
        const notification = {
            userId,
            senderId,
            type,
            message,
            isRead,
            createdAt
        }

        console.log("send notification to kafka server")
        await kafka.send({
            topic: 'notification',
            messages: [{ value: JSON.stringify(notification) }]
        });
        console.log('notification sent to kafka server')
        await kafka.disconnect();
        console.log('disconnected kafka server')
        res.status(200).json({ message: 'Notification sent successfully' })
        return;
    }
}
export class Messages {

    static async sendMessage(req: Request, res: Response): Promise<void> {
        console.log('connecting to producer')
        await kafka.connect();
        console.log('connected to producer')
        try {
            const { senderId, receiverId, text, messageType, isRead } = req.body;

            if (!senderId || !receiverId || !messageType) {
                res.status(400).json({ error: "Missing required fields" });
                return;
            }

            console.log("Checking for existing conversation...");
            let conversation = await prisma.conversation.findFirst({
                where: {
                    OR: [
                        { user1Id: senderId, user2Id: receiverId },
                        { user1Id: receiverId, user2Id: senderId },
                    ],
                },
            });

            if (!conversation) {
                console.log("Creating new conversation...");
                conversation = await prisma.conversation.create({
                    data: {
                        user1Id: senderId,
                        user2Id: receiverId,
                    },
                });
            }

            const message = {
                conversationId: conversation.id,
                senderId,
                receiverId,
                text: text || "",
                messageType,
                isRead: isRead || false,
                createdAt: new Date().toISOString(),
            };

            console.log("Sending message to Kafka...");
            await kafka.send({
                topic: "message",
                messages: [{ value: JSON.stringify(message) }],
            });

            console.log("Message sent to Kafka:", message);
            res.status(200).json({ message: "Message sent successfully", conversationId: conversation.id });
        } catch (err) {
            console.error("Error in sending message:", err);
            res.status(500).json({ message: "An error occurred" });
        }
    }
}

