import aj from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
  try {
    if (["127.0.0.1", "::1", "localhost"].includes(req.hostname)) {
      return next();
    }
    const decision = await aj.protect(req, { requested: 1 });
    if (decision.isDenied) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({
          success: false,
          message: "Too Many Requests: Rate limit exceeded",
        });
      }
      if (decision.reason.isBot()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Bot traffic detected",
        });
      }
      if (decision.reason.isShield()) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Malicious activity detected",
        });
      }
      return res.status(403).json({
        success: false,
        message: "Forbidden: Your request has been blocked by Arcjet",
      });
    }
    next();
  } catch (error) {
    console.error("Arcjet middleware error:", error);
    // In case of error, allow the request to proceed (fail open)
    next();
  }
};
export default arcjetMiddleware;
