import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { Server } from "socket.io";

import { authenticateSocket } from "./socket/authenticateSocket";
import { uploadErrorHandler } from "./middleware/uploadErrorHandler";

import { registerRouter } from "./routes/register";
import { loginRouter } from "./routes/login";
import { twoFactorRouter } from "./routes/twoFactor";
import { githubRouter } from "./routes/github";
import { googleRouter } from "./routes/google";
import { profileRouter } from "./routes/profile";
import { passwordResetRouter } from "./routes/passwordReset";
import { supportRouter } from "./routes/support";
import { emailVerificationRouter } from "./routes/emailVerification";

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

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", registerRouter);
app.use("/auth", loginRouter);
app.use("/auth", twoFactorRouter);
app.use("/auth", githubRouter);
app.use("/auth", googleRouter);
app.use("/auth", profileRouter);
app.use("/auth", passwordResetRouter);
app.use("/auth", supportRouter);
app.use("/auth", emailVerificationRouter);

app.use("/jobs", jobsRouter);
app.use("/applications", applicationsRouter);
app.use("/bookmarks", bookmarksRouter);

app.use(uploadErrorHandler);

const port = Number(process.env.PORT || 4000);

httpServer.listen(port, () => {
  console.log(
    `API and WebSockets running on http://localhost:${port}`
  );
});