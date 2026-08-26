import type { ErrorRequestHandler } from "express";
import multer from "multer";

export const uploadErrorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File is too large",
      });
    }

    return res.status(400).json({
      message: "Invalid upload",
    });
  }

  if (error instanceof Error && error.message === "Unsupported file type") {
    return res.status(400).json({
      message: "Unsupported file type",
    });
  }

  next(error);
};