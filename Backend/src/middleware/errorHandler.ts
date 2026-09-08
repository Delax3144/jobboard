import type { ErrorRequestHandler } from "express";

type RequestError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
};

export const errorHandler: ErrorRequestHandler = (
  error: RequestError,
  _req,
  res,
  next
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const rawStatus =
    error.status ?? error.statusCode;

  const status =
    typeof rawStatus === "number" &&
    rawStatus >= 400 &&
    rawStatus < 500
      ? rawStatus
      : 500;

  if (status >= 500) {
    console.error(
      "Unhandled request error:",
      error
    );
  }

  if (
    status === 400 &&
    error.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      message: "Invalid JSON body",
    });
    return;
  }

  res.status(status).json({
    message:
      status >= 500
        ? "Internal Server Error"
        : error.message || "Request failed",
  });
};