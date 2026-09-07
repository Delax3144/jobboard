import { randomBytes } from "node:crypto";
import { prisma } from "../prisma";

const MAX_USERNAME_LENGTH = 30;

function normalizeUsernameBase(value: string) {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .replace(/^[_.-]+|[_.-]+$/g, "");

  return normalized || "user";
}

export async function generateUniqueUsername(base: string) {
  const normalizedBase = normalizeUsernameBase(base);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = randomBytes(4).toString("hex");

    const availableBaseLength =
      MAX_USERNAME_LENGTH - suffix.length - 1;

    const candidate =
      `${normalizedBase.slice(0, availableBaseLength)}_${suffix}`;

    const existingUser = await prisma.user.findUnique({
      where: {
        username: candidate,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      return candidate;
    }
  }

  throw new Error("Failed to generate unique username");
}