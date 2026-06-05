import dotenv from "dotenv";
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

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/jobs", jobsRouter);
app.use("/applications", applicationsRouter);
app.use("/bookmarks", bookmarksRouter);

const port = Number(process.env.PORT || 4000);
httpServer.listen(port, () => {
  console.log(`API and WebSockets running on http://localhost:${port}`);
});