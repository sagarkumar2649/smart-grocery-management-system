import mongoose from "mongoose";
import { env } from "../../core/config/env.js";
import { logger } from "../../core/logging/logger.js";

let isConnected = false;

export async function connectToMongo(): Promise<void> {
  if (isConnected) {
    return;
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    isConnected = true;
    logger.info({ component: "mongoose" }, "MongoDB connected");
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    logger.warn({ component: "mongoose" }, "MongoDB disconnected");
  });

  mongoose.connection.on("error", (error) => {
    logger.error({ component: "mongoose", err: error }, "MongoDB connection error");
  });

  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 10_000,
  });
}

export async function disconnectFromMongo(): Promise<void> {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
}

export function getMongoConnectionState(): {
  isConnected: boolean;
  readyState: number;
} {
  return { isConnected, readyState: mongoose.connection.readyState };
}
