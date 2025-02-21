import kafkaSetup from "./kafkaSetup";
import { Request, Response } from "express";

export default async function connectKafka(req: Request, res: Response): Promise<void> {
    try {
        const admin = kafkaSetup.admin();
        console.log("connecting to kafka");
        await admin.connect();
        
        res.status(200).json({ message: 'Kafka connected' });

        await admin.disconnect();
        console.log("disconnecting kafka");

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error connecting to Kafka' });
    }
}
