import { Kafka } from "kafkajs";

const kafkaSetup = new Kafka({
    clientId: 'admin-client',
    brokers: ['localhost:9092'],
})

export default kafkaSetup;