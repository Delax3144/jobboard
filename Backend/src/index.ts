import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer } from "http"; // Нативный сервер Node.js
import { Server } from "socket.io";  // Сервер сокетов

import { authRouter } from "./routes/auth";
import { jobsRouter } from "./routes/jobs";
import { applicationsRouter } from "./routes/applications";
import { bookmarksRouter } from "./routes/bookmarks";

dotenv.config();

const app = express();

// 1. Создаем HTTP-сервер поверх Express
const httpServer = createServer(app);

// 2. Подключаемся Socket.io к этому серверу
const io = new Server(httpServer, {
  path: "/auth/socket/", // <-- ТРОЯНСКИЙ КОНЬ! Замаскировали под рабочий API
  cors: {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});

// 3. Прокидываем io в глобальные настройки Express
app.set("io", io);

// 4. Логика WebSockets: слушаем подключения
io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  // Когда юзер авторизуется на фронтенде, мы добавляем его в личную "комнату" по его ID
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

// Базовые middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/health", (_req, res) => res.json({ ok: true }));

// === Твои роутеры (Всё на месте!) ===
app.use("/auth", authRouter);
app.use("/jobs", jobsRouter);
app.use("/applications", applicationsRouter);
app.use("/bookmarks", bookmarksRouter);

// === ВАЖНО: Запускаем httpServer, а не app! ===
const port = Number(process.env.PORT || 4000);
httpServer.listen(port, () => {
  console.log(`API and WebSockets running on http://localhost:${port}`);
});