import jwt from "jsonwebtoken"

export const isUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - no token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("Error in verifyToken ", error);
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const isAdmin = (req, res, next) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};