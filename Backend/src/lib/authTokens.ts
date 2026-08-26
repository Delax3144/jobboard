import jwt, { type JwtPayload } from "jsonwebtoken";

type TokenUser = {
  id: string;
  role: string;
};

export type AccessTokenUser = {
  id: string;
  role: "employer" | "candidate";
};

type TwoFactorChallengePayload = JwtPayload & {
  id: string;
  purpose: "2fa-login";
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET not set");
  }

  return secret;
}

export function signAccessToken(user: TokenUser) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      tokenType: "access",
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

export function signTwoFactorChallenge(userId: string) {
  return jwt.sign(
    {
      id: userId,
      purpose: "2fa-login",
    },
    getJwtSecret(),
    { expiresIn: "5m" }
  );
}

export function verifyTwoFactorChallenge(token: string) {
  const payload = jwt.verify(token, getJwtSecret());

  if (
    typeof payload === "string" ||
    typeof payload.id !== "string" ||
    payload.purpose !== "2fa-login"
  ) {
    throw new Error("Invalid 2FA challenge");
  }

  const challenge = payload as TwoFactorChallengePayload;

  return {
    userId: challenge.id,
  };
}

export function verifyAccessToken(token: string): AccessTokenUser {
  const payload = jwt.verify(token, getJwtSecret());

  if (
    typeof payload === "string" ||
    payload.tokenType !== "access" ||
    typeof payload.id !== "string" ||
    (payload.role !== "employer" && payload.role !== "candidate")
  ) {
    throw new Error("Invalid access token");
  }

  return {
    id: payload.id,
    role: payload.role,
  };
}