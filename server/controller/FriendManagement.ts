import { Request, Response } from "express";
import prisma from "../src/config/db.config";
import redis from "../lib/redisServer";
import kafkaSetup from "../kafkaService/kafkaSetup";

const kafka = kafkaSetup.producer();

export class FriendManagement {
    static async addFriends(req: Request, res: Response): Promise<void> {
        const { followerId, followingId } = req.body;

        if (!followerId || !followingId) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        try {
            const friendExists = await prisma.user.findUnique({ where: { id: followingId } });

            if (!friendExists) {
                res.status(400).json({ message: "User not found" });
                return;
            }

            const existingRequest = await prisma.friendRequest.findFirst({
                where: {
                    senderId: followerId,
                    receiverId: followingId,
                    status: "PENDING",
                },
            });

            if (existingRequest) {
                res.status(400).json({ message: "Friend request already sent" });
                return;
            }

            const newRequest = await prisma.friendRequest.create({
                data: {
                    senderId: followerId,
                    receiverId: followingId,
                    status: "PENDING",
                },
            });

            const notification = {
                userId: followingId,
                senderId: followerId,
                type: "FRIEND_REQUEST",
                message: "You have a new friend request!",
                isRead: false,
                createdAt: new Date(),
            };

            await kafka.connect();
            await kafka.send({
                topic: "notification",
                messages: [{ value: JSON.stringify(notification) }],
            });
            await kafka.disconnect();

            res.status(200).json({ message: "Friend request sent successfully", request: newRequest });
        } catch (err) {
            console.error("Error processing friend request:", err);
            res.status(500).json({ message: "An error occurred" });
        }
    }

    static async acceptReq(req: Request, res: Response): Promise<void> {
        const { friendReqId } = req.body;

        if (!friendReqId) {
            res.status(400).json({ message: "Invalid friend request" });
            return;
        }

        try {
            const findReq = await prisma.friendRequest.findUnique({
                where: { id: friendReqId }
            });

            if (!findReq) {
                res.status(400).json({ message: "Friend request not found" });
                return;
            }

            if (findReq.status !== "PENDING") {
                res.status(400).json({ message: "Friend request is not pending" });
                return;
            }

            const existingFriendship = await prisma.friendship.findFirst({
                where: {
                    OR: [
                        { followerId: findReq.senderId, followingId: findReq.receiverId },
                        { followerId: findReq.receiverId, followingId: findReq.senderId }
                    ]
                }
            });

            if (existingFriendship) {
                res.status(400).json({ message: "Friendship already exists" });
                return;
            }

            // ✅ Create a single friendship record instead of two
            await prisma.$transaction([
                prisma.friendship.create({
                    data: {
                        followerId: findReq.senderId,
                        followingId: findReq.receiverId,
                    }
                }),
                prisma.friendRequest.delete({
                    where: { id: friendReqId }
                })
            ]);

            // Update Redis Cache for both users
            await FriendManagement.updateFriendCache(findReq.senderId);
            await FriendManagement.updateFriendCache(findReq.receiverId);

            res.status(200).json({ message: "Friend request accepted successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "An error occurred" });
        }
    }

    static async getFriends(req: Request, res: Response): Promise<void> {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
            res.status(400).json({ message: "User ID is required" });
            return;
        }

        try {
            const cachedFriends = await redis.get(`friends:${userId}`);
            if (cachedFriends) {
                res.status(200).json(JSON.parse(cachedFriends));
                return;
            }

            const friends = await FriendManagement.fetchAndCacheFriends(userId);
            res.status(200).json(friends);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "An error occurred" });
        }
    }

    private static async fetchAndCacheFriends(userId: string): Promise<{ id: string, username: string }[]> {
        const friends = await prisma.friendship.findMany({
            where: {
                OR: [{ followerId: userId }, { followingId: userId }]
            },
            include: {
                follower: { select: { id: true, username: true } },
                following: { select: { id: true, username: true } }
            }
        });

        const friendSet = new Set<string>();
        const friendList: { id: string, username: string }[] = [];

        friends.forEach(friend => {
            const friendData = friend.follower.id === userId ? friend.following : friend.follower;
            
            if (!friendSet.has(friendData.id)) {
                friendSet.add(friendData.id);
                friendList.push({ id: friendData.id, username: friendData.username });
            }
        });

        console.log(`Updating Redis Cache for ${userId}:`, friendList);

        await redis.set(`friends:${userId}`, JSON.stringify(friendList), "EX", 3600);

        return friendList;
    }

    private static async updateFriendCache(userId: string): Promise<void> {
        await redis.del(`friends:${userId}`);
        await FriendManagement.fetchAndCacheFriends(userId);
    }
}
