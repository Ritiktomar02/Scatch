import { transporter } from "./gmail.config.js";
import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_EMAIL_TEMPLATE
} from "./emailTemplates.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    await transporter.sendMail({
      from: `"Scatch" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your verification code for Scatch",
      text: `Your verification code is ${verificationToken}. It expires in 15 minutes.`,
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Verification email sent successfully");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Verification email error:", error.message);
    }
    throw new Error(error.message);
  }
};

export const sendWelcomeEmail = async (email, username) => {
  try {
    await transporter.sendMail({
      from: `"Scatch" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to Scatch 🎉",
      text: `Hi ${username}, your email has been verified successfully. Welcome to Scatch!`,
      html: WELCOME_EMAIL_TEMPLATE.replace("{username}", username),
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Welcome email sent successfully");
    }

  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Welcome email error:", error.message);
    }

    throw new Error(error.message);
  }
};


export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    await transporter.sendMail({
      from: `"Scatch" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your Scatch password",
      text: `Click the link below to reset your password:\n${resetURL}\nThis link expires in 1 hour.`,
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "{resetURL}",
        resetURL
      ),
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Password reset email sent successfully");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Password reset email error:", error.message);
    }
    throw new Error(error.message);
  }
};


export const sendResetSuccessEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: `"Scatch" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your password was changed successfully",
      text: `Your password has been successfully reset. If this wasn't you, contact support immediately.`,
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    if (process.env.NODE_ENV === "development") {
      console.log("Reset success email sent successfully");
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Reset success email error:", error.message);
    }
    throw new Error(error.message);
  }
};




