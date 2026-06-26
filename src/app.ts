import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import config from "./config";
import healthRoutes from "./modules/health/health.routes";
import smsRoutes from "./modules/sms/sms.routes";
import { errorHandler, notFoundHandler } from "./shared/middleware/errorMiddleware";

function createApp(): express.Express {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "32kb" }));
  app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));

  app.use("/health", healthRoutes);
  app.use("/api/sms", smsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export { createApp };
