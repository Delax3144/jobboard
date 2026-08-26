import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_UPLOAD_LIMIT = 3 * 1024 * 1024;
const CV_UPLOAD_LIMIT = 5 * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const CV_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const createMimeTypeFilter =
  (allowedTypes: Set<string>) =>
  (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
  ) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error("Unsupported file type"));
    }

    callback(null, true);
  };

// Avatar uploads
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder: "jobboard/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }),
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: IMAGE_UPLOAD_LIMIT,
  },
  fileFilter: createMimeTypeFilter(IMAGE_MIME_TYPES),
});

// Job logo uploads
const jobStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder: "jobboard/jobs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }),
});

export const uploadJob = multer({
  storage: jobStorage,
  limits: {
    fileSize: IMAGE_UPLOAD_LIMIT,
  },
  fileFilter: createMimeTypeFilter(IMAGE_MIME_TYPES),
});

// CV uploads
const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, _file) => ({
    folder: "jobboard/cvs",
    resource_type: "auto",
    allowed_formats: ["pdf", "doc", "docx"],
  }),
});

export const uploadCV = multer({
  storage: cvStorage,
  limits: {
    fileSize: CV_UPLOAD_LIMIT,
  },
  fileFilter: createMimeTypeFilter(CV_MIME_TYPES),
});