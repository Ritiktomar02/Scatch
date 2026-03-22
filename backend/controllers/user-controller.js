import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/user-model.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";

import { oauth2Client } from "../config/google-connection.js";
import axios from "axios";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Some fields are missing" });
    }
    
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationCode();

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await generateTokenAndSetCookies(res, user._id);

    await sendVerificationEmail(user.email, verificationToken);

    const safeUser = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: safeUser,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error:", error);
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Some fields are missing" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (existingUser.authProvider === "google") {
      return res.status(400).json({
        message: "This account uses Google sign-in",
      });
    }

    const passwordCheck = await bcrypt.compare(password, existingUser.password);

    if (!passwordCheck) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!existingUser.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }

    await generateTokenAndSetCookies(res, existingUser._id);

    existingUser.lastLogin = new Date();
    await existingUser.save();

    const safeUser = await User.findById(existingUser._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: safeUser,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Login error:", error);
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Decode access token to get userId and clear refresh token from DB
    const accessToken = req.cookies.accessToken;
    if (accessToken) {
      // decode (not verify) — works even if the token is expired
      const decoded = jwt.decode(accessToken);
      if (decoded?.userId) {
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: undefined });
      }
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", { ...cookieOptions, path: "/user/refresh" });

    res.status(200).json({ message: "User Logout Successfully" });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Logout error:", error);
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // Mark verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username);

    const safeUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: safeUser,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Verify email error:", error);
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Always return the same message whether user exists or not
    // to prevent email enumeration
    if (!user || user.authProvider === "google") {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000;

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
    );

    res.status(200).json({
      success: true,
      message: "If an account exists with this email, a reset link has been sent",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Forgot password error:", error);
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        message: "Password reset not allowed for Google accounts",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Reset password error:", error);
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in checkAuth:", error);
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Google code required" });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    const { email, name } = response.data;

    let user = await User.findOne({ email });

    if (user && user.authProvider === "local") {
      return res.status(400).json({
        message:
          "Account already exists. Please login with email and password.",
      });
    }

    if (!user) {
      user = await User.create({
        username: name,
        email,
        authProvider: "google",
        isVerified: true,
      });
    }

    await generateTokenAndSetCookies(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: safeUser,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Google login error:", error);
    }
    res.status(500).json({ message: "Google auth failed" });
  }
};

// Refresh token endpoint — this is called automatically by the frontend
// when an access token expires (401 response).
//
// Flow:
// 1. Read refresh token from cookie
// 2. Verify it's a valid JWT
// 3. Hash it and compare with what's stored in DB
// 4. If match → issue NEW access + refresh tokens (this is "rotation")
// 5. If no match → someone reused a stolen token, revoke everything
export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    // Verify the JWT is valid and not expired
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Hash the token and compare with DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== hashedToken) {
      // Token reuse detected or user not found — revoke everything
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Token is valid — rotate: issue new access + refresh tokens
    await generateTokenAndSetCookies(res, user._id);

    res.status(200).json({ success: true, message: "Tokens refreshed" });
  } catch (error) {
    // JWT expired or malformed
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
