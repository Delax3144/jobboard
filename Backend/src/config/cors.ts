import type { CorsOptions } from "cors";

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "");
}

const allowedOrigins = new Set<string>();

const frontendUrl = process.env.FRONTEND_URL?.trim();

if (frontendUrl) {
  allowedOrigins.add(normalizeOrigin(frontendUrl));
}

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add("http://localhost:5173");
  allowedOrigins.add("http://127.0.0.1:5173");
}

if (process.env.NODE_ENV === "production" && !frontendUrl) {
  throw new Error("FRONTEND_URL not set");
}

function checkOrigin(
  origin: string | undefined,
  callback: (error: Error | null, allow?: boolean) => void
) {
  // curl, Postman, server-to-server requests may not send Origin.
  if (!origin) {
    return callback(null, true);
  }

  if (allowedOrigins.has(normalizeOrigin(origin))) {
    return callback(null, true);
  }

  return callback(new Error("Origin not allowed by CORS"));
}

export const corsOptions: CorsOptions = {
  origin: checkOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

export const socketCorsOptions = {
  origin: checkOrigin,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};