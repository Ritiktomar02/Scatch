import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user-model.js";

// Generates a short-lived access token (15 min) and a long-lived refresh token (7 days).
// Access token → used for every API request, expires fast so damage is limited if stolen.
// Refresh token → stored as a hash in DB so we can revoke it (on logout or theft detection).

export const generateTokenAndSetCookies = async (res, userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  // Store a hash of the refresh token in DB (not the raw token).
  // This way even if DB is compromised, attacker can't use the hashed value.
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await User.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  // Access token cookie — short maxAge
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token cookie — long maxAge, scoped to refresh endpoint only
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/user/refresh",
  });
};
