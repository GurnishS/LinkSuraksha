import BaseLogger from "./base-logger.js";

//changes require

class AuthLogger extends BaseLogger {
  constructor() {
    super("auth");
  }

  //id, name, req
  // Log successful user login
  logUserLogin(userId, name, req = null) {
    const logData = {
      event: "USER_LOGIN",
      userId, // User's unique identifier
      name, // User's name
      ip: req?.ip, // IP address of login
      userAgent: req?.get("User-Agent"), // Browser/device information
      sessionId: req?.sessionId, // Session Id if available
    };

    this.info(logData, "User logged in");

    if (req?.log) {
      req.log.info(logData, "User logged in");
    }
  }

  // Log user logout
  logUserLogout(userId, name, req = null) {
    const logData = {
      event: "USER_LOGOUT",
      userId,
      name,
      ip: req?.ip,
      sessionId: req?.sessionId,
    };

    this.info(logData, "User logged out");

    if (req?.log) {
      req.log.info(logData, "User logged out");
    }
  }

  // Log failed login attempts
  logLoginFailed(customerId, reason, req = null) {
    const logData = {
      event: "LOGIN_FAILED",
      customerId,
      ip: req?.ip,
      userAgent: req?.get("User-Agent"),
      reason, // Reason for failure (invalid password, etc.)
      sessionId: req?.sessionId,
    };

    this.warn(logData, "Login attempt failed");

    if (req?.log) {
      req.log.warn(logData, "Login attempt failed");
    }
  }
}

export default AuthLogger;
