import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { prisma } from "../prisma";
import { safeUserSelect } from "../selects/user";

type OAuthRole = "candidate" | "employer";

export async function claimUnverifiedOAuthUser(
  userId: string,
  role: OAuthRole
) {
  const randomPassword = randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(randomPassword, 10);

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash,
      role,
      isVerified: true,

      verificationTokenHash: null,
      verificationTokenExpiresAt: null,

      resetTokenHash: null,
      resetTokenExpiresAt: null,

      isTwoFactorEnabled: false,
      twoFactorSecret: null,
    },
    select: safeUserSelect,
  });
}