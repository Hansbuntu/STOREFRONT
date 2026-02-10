import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { json, urlencoded } from "express";
import path from "path";
import { initDb } from "./startup/db";
import { initRedis } from "./startup/redis";
import { registerRoutes } from "./startup/routes";
import { errorHandler } from "./startup/errorHandler";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const corsOrigin = process.env.CORS_ORIGIN;

if (isProduction && !corsOrigin) {
  throw new Error("CORS_ORIGIN must be set in production.");
}

app.use(helmet());
app.use(
  cors({
    origin: isProduction ? corsOrigin : corsOrigin || "*",
  })
);
app.use(morgan("dev"));
app.use(json({ limit: "10mb" }));
app.use(urlencoded({ extended: true }));

const uploadsRoot = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, "../uploads");
app.use(
  "/public/listings",
  express.static(path.join(uploadsRoot, "listings"), {
    setHeaders: (res) => {
      // Allow the frontend on a different origin to render listing images.
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

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
