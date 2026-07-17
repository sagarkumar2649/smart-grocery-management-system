import http from "node:http";
import { createServer } from "./app/server.js";
import { env } from "./core/config/env.js";
import { logger } from "./core/logging/logger.js";
import { connectToMongo, disconnectFromMongo } from "./infrastructure/db/mongoose.js";

async function bootstrap(): Promise<void> {
  try {
    await connectToMongo();
  } catch (err) {
    logger.fatal({ err }, "Failed to connect to MongoDB");
    process.exit(1);
  }

  const app = createServer();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        apiPrefix: env.API_PREFIX,
        nodeEnv: env.NODE_ENV,
      },
      "Server started",
    );
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Graceful shutdown started");

    server.close(async (closeErr) => {
      if (closeErr) {
        logger.error({ err: closeErr }, "HTTP server close error");
      }

      try {
        await disconnectFromMongo();
        logger.info("MongoDB disconnected");
      } catch (err) {
        logger.error({ err }, "MongoDB disconnect error");
      }

      logger.info("Graceful shutdown completed");

      // Exit explicitly to avoid hanging handles
      process.exit(closeErr ? 1 : 0);
    });

    // Safety timeout: force exit if shutdown hangs
    setTimeout(() => {
      logger.error("Forced shutdown due to timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
  });

  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception");
    void shutdown("uncaughtException");
  });
}

await bootstrap();
