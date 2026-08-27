import dotenv from "dotenv";
import { authenticateSocket } from "./socket/authenticateSocket";
import { uploadErrorHandler } from "./middleware/uploadErrorHandler";
// 1. СНАЧАЛА ЗАГРУЖАЕМ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ!
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

// 2. И ТОЛЬКО ТЕПЕРЬ ИМПОРТИРУЕМ РОУТЫ (чтобы они видели process.env)
import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";
import { applicationsRouter } from "./routes/applications";
import { bookmarksRouter } from "./routes/bookmarks";

import {
  corsOptions,
  socketCorsOptions,
} from "./config/cors";

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: socketCorsOptions,
});

io.use(authenticateSocket);

app.set("io", io);

io.on("connection", (socket) => {
  const user = socket.data.user;

  socket.join(user.id);

  console.log(`User ${user.id} connected:`, socket.id);

  socket.on("disconnect", () => {
    console.log(`User ${user.id} disconnected:`, socket.id);
  });
});

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/jobs", jobsRouter);
app.use("/applications", applicationsRouter);
app.use("/bookmarks", bookmarksRouter);

app.use(uploadErrorHandler);

const port = Number(process.env.PORT || 4000);
httpServer.listen(port, () => {
  console.log(`API and WebSockets running on http://localhost:${port}`);
});