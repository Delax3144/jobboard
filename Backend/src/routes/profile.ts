import { Router } from "express";
import { prisma } from "../prisma";

import { authMiddleware } from "../middleware/auth";
import { profileUploadRateLimit } from "../middleware/rateLimits";

import {
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
profileRouter.get("/me", authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: safeUserSelect,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({ user });
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
  async (req: any, res: any) => {
    let avatarSaved = false;

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const avatarUrl = req.file.path;

      const user = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          avatarUrl,
        },
        select: {
          id: true,
          email: true,
          role: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          isTwoFactorEnabled: true,
        },
      });

      avatarSaved = true;

      return res.json({ user });
    } catch (error) {
      if (!avatarSaved) {
        await removeCloudinaryUpload(req.file);
      }

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
  async (req: any, res: any) => {
    let resumeSaved = false;

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const resumeUrl = req.file.path;

      const user = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          resumeUrl,
        },
        select: {
          id: true,
          resumeUrl: true,
        },
      });

      resumeSaved = true;

      return res.json({ user });
    } catch (error) {
      if (!resumeSaved) {
        await removeCloudinaryUpload(req.file);
      }

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
  async (req: any, res) => {
    try {
      await prisma.user.update({
        where: {
          id: req.user.id,
        },
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