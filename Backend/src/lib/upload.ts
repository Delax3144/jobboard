import { v2 as cloudinary } from "cloudinary";
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

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const CV_FORMATS = ["pdf", "doc", "docx"];

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

type CloudinaryResourceType = "image" | "auto";

type CloudinaryStorageOptions = {
  folder: string;
  resourceType: CloudinaryResourceType;
  allowedFormats: string[];
};

async function destroyCloudinaryResource(publicId: string) {
  const imageResult = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (imageResult.result === "not found") {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  }
}

const createCloudinaryStorage = ({
  folder,
  resourceType,
  allowedFormats,
}: CloudinaryStorageOptions): multer.StorageEngine => ({
  _handleFile(_req, file, callback) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: allowedFormats,
      },
      (error, result) => {
        if (error) {
          return callback(error);
        }

        if (!result) {
          return callback(
            new Error("Cloudinary upload returned no result")
          );
        }

        callback(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      }
    );

    file.stream.pipe(uploadStream);
  },

  _removeFile(_req, file, callback) {
    if (!file.filename) {
      callback(null);
      return;
    }

    destroyCloudinaryResource(file.filename)
      .then(() => callback(null))
      .catch((error) => {
        callback(
          error instanceof Error
            ? error
            : new Error("Failed to remove Cloudinary upload")
        );
      });
  },
});

const avatarStorage = createCloudinaryStorage({
  folder: "jobboard/avatars",
  resourceType: "image",
  allowedFormats: IMAGE_FORMATS,
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: IMAGE_UPLOAD_LIMIT,
  },
  fileFilter: createMimeTypeFilter(IMAGE_MIME_TYPES),
});

const jobStorage = createCloudinaryStorage({
  folder: "jobboard/jobs",
  resourceType: "image",
  allowedFormats: IMAGE_FORMATS,
});

export const uploadJob = multer({
  storage: jobStorage,
  limits: {
    fileSize: IMAGE_UPLOAD_LIMIT,
  },
  fileFilter: createMimeTypeFilter(IMAGE_MIME_TYPES),
});

const cvStorage = createCloudinaryStorage({
  folder: "jobboard/cvs",
  resourceType: "auto",
  allowedFormats: CV_FORMATS,
});

export const uploadCV = multer({
  storage: cvStorage,
  limits: {
    fileSize: CV_UPLOAD_LIMIT,
  },
  fileFilter: createMimeTypeFilter(CV_MIME_TYPES),
});

export async function removeCloudinaryAsset(
  publicId: string | null | undefined
) {
  if (!publicId) {
    return;
  }

  try {
    await destroyCloudinaryResource(publicId);
  } catch (error) {
    console.error(
      `Failed to remove Cloudinary asset "${publicId}":`,
      error
    );
  }
}

export async function removeCloudinaryAssets(
  publicIds: Array<string | null | undefined>
) {
  await Promise.all(
    publicIds.map((publicId) =>
      removeCloudinaryAsset(publicId)
    )
  );
}

export async function removeCloudinaryUpload(
  file: Express.Multer.File | undefined
) {
  await removeCloudinaryAsset(file?.filename);
}