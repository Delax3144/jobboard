import { Router } from "express";
import { prisma } from "../prisma";

import {
  authMiddleware,
  getAuthenticatedUser,
} from "../middleware/auth";
import { profileUploadRateLimit } from "../middleware/rateLimits";

import {
  removeCloudinaryAsset,
  removeCloudinaryUpload,
  uploadAvatar,
  uploadCV,
} from "../lib/upload";

import {
  publicProfileSelect,
  safeUserSelect,
} from "../selects/user";

import { updateProfileSchema } from "../validation/profile";
import { userIdSchema } from "../validation/users";

export const profileRouter = Router();

// Get current authenticated user
profileRouter.get("/me", authMiddleware, async (req, res) => {
  const user = getAuthenticatedUser(req);

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: safeUserSelect,
    });

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({ user: currentUser });
  } catch (error) {
    console.error("Failed to fetch current user:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});

// Update profile
profileRouter.put("/profile", authMiddleware, async (req, res) => {
  const parsedBody = updateProfileSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      message:
        parsedBody.error.issues[0]?.message ??
        "Invalid request",
    });
  }

  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: parsedBody.data,
      select: safeUserSelect,
    });

    return res.json({
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update failed:", error);

    return res.status(500).json({
      message: "Update failed",
    });
  }
});

// Upload avatar
profileRouter.post(
  "/avatar",
  authMiddleware,
  profileUploadRateLimit,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    const user = getAuthenticatedUser(req);

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const avatarUrl = req.file.path;
    const avatarPublicId = req.file.filename;

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          avatarPublicId: true,
        },
      });

      if (!existingUser) {
        await removeCloudinaryUpload(req.file);

        return res.status(404).json({
          message: "User not found",
        });
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          avatarUrl,
          avatarPublicId,
        },
        select: safeUserSelect,
      });

      await removeCloudinaryAsset(
        existingUser.avatarPublicId
      );

      return res.json({
        user: updatedUser,
      });
    } catch (error) {
      await removeCloudinaryUpload(req.file);

      console.error("Avatar upload failed:", error);

      return res.status(500).json({
        message: "Upload failed",
      });
    }
  }
);

// Upload resume
profileRouter.post(
  "/resume",
  authMiddleware,
  profileUploadRateLimit,
  uploadCV.single("resume"),
  async (req, res) => {
    const user = getAuthenticatedUser(req);

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const resumeUrl = req.file.path;
    const resumePublicId = req.file.filename;

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          resumePublicId: true,
        },
      });

      if (!existingUser) {
        await removeCloudinaryUpload(req.file);

        return res.status(404).json({
          message: "User not found",
        });
      }

      const updatedUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          resumeUrl,
          resumePublicId,
        },
        select: {
          id: true,
          resumeUrl: true,
        },
      });

      await removeCloudinaryAsset(
        existingUser.resumePublicId
      );

      return res.json({
        user: updatedUser,
      });
    } catch (error) {
      await removeCloudinaryUpload(req.file);

      console.error("Resume upload failed:", error);

      return res.status(500).json({
        message: "Resume upload failed",
      });
    }
  }
);

// Update last activity
profileRouter.post(
  "/ping",
  authMiddleware,
  async (req, res) => {
    const user = getAuthenticatedUser(req);

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastActive: new Date(),
        },
      });

      return res.status(200).send();
    } catch (error) {
      console.error("Failed to update last activity:", error);

      return res.status(500).send();
    }
  }
);

// Get public user profile
profileRouter.get("/users/:id", async (req, res) => {
  const parsedId = userIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    return res.status(400).json({
      message: "Invalid user id",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parsedId.data,
      },
      select: publicProfileSelect,
    });

    if (!user || !user.isPublic) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const {
      isPublic,
      email,
      ...publicUser
    } = user;

    return res.json({
      ...publicUser,
      email: user.showEmail ? email : null,
    });
  } catch (error) {
    console.error("Failed to fetch public profile:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
});