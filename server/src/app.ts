import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes";

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowlist = [
        process.env.CORS_ORIGIN || "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5173",
      ];
      if (!origin) return callback(null, true);
      if (allowlist.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api", router);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global Error Handler
interface AppError extends Error {
  status?: number;
}

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    status: "error",
    message,
  });
});

export default app;
