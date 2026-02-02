import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { json, urlencoded } from "express";
import { initDb } from "./startup/db";
import { initRedis } from "./startup/redis";
import { registerRoutes } from "./startup/routes";
import { errorHandler } from "./startup/errorHandler";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(morgan("dev"));
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true }));

registerRoutes(app);
app.use(errorHandler);

const port = process.env.PORT || 3000;

async function bootstrap() {
  await initDb();
  await initRedis();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`STOREFRONT API listening on port ${port}`);
  });
}

void bootstrap();

export default app;


