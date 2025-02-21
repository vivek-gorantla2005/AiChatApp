import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import prisma from "../src/config/db.config";
import redis from "../lib/redisServer";
import dotenv from "dotenv";

dotenv.config();

interface CustomUser {
  username?: string;
  email: string;
  password: string;
  token?: string;
}

class UserManagement {
  static async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password }: CustomUser = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ message: "All fields are required" });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: { username, email, password: hashedPassword },
      });

      const token = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      const bearerToken = `Bearer ${token}`;

      await redis.set(`session:${newUser.id}`, bearerToken, "EX", 604800);
      await prisma.user.update({
        where: { id: newUser.id },
        data: { token: bearerToken },
      });

      res.status(201).json({
        message: "User registered successfully",
        token: bearerToken,
        user: { id: newUser.id, username: newUser.username, email: newUser.email },
      });
    } catch (error) {
      console.error("Error in signUp:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: CustomUser = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "All fields are required" });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      const bearerToken = `Bearer ${token}`;

      await redis.set(`session:${user.id}`, bearerToken, "EX", 604800);
      await prisma.user.update({ where: { id: user.id }, data: { token: bearerToken } });

      res.status(200).json({
        message: "Login successful",
        token: bearerToken,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default UserManagement;
