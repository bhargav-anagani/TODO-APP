const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Hash the token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Check if token exists in DB
    const user = await User.findOne({ _id: decoded.userId, "tokens.token": hashedToken });
    if (!user) {
        return res.status(401).json({ success: false, message: "Session expired or invalid" });
    }

    req.userId = decoded.userId;
    req.token = token; // Attach token for logout
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
