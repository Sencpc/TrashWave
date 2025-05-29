const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatLogMessage = (level, message, meta = {}) => {
  return (
    JSON.stringify({
      timestamp: getTimestamp(),
      level: level.toUpperCase(),
      message,
      ...meta,
    }) + "\n"
  );
};

const writeToFile = (filename, content) => {
  const filePath = path.join(logsDir, filename);
  fs.appendFileSync(filePath, content);
};

class Logger {
  constructor(module = "app") {
    this.module = module;
  }

  info(message, meta = {}) {
    const logMessage = formatLogMessage("info", message, {
      module: this.module,
      ...meta,
    });
    console.log(`ℹ️  ${message}`, meta);
    writeToFile("app.log", logMessage);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = error
      ? {
          error: error.message,
          stack: error.stack,
          ...meta,
        }
      : meta;

    const logMessage = formatLogMessage("error", message, {
      module: this.module,
      ...errorMeta,
    });
    console.error(`❌ ${message}`, errorMeta);
    writeToFile("error.log", logMessage);
    writeToFile("app.log", logMessage);
  }

  warn(message, meta = {}) {
    const logMessage = formatLogMessage("warn", message, {
      module: this.module,
      ...meta,
    });
    console.warn(`⚠️  ${message}`, meta);
    writeToFile("app.log", logMessage);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === "development") {
      const logMessage = formatLogMessage("debug", message, {
        module: this.module,
        ...meta,
      });
      console.log(`🔍 ${message}`, meta);
      writeToFile("debug.log", logMessage);
    }
  }

  // API request logging
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id || null,
      userRole: req.user?.ROLE || null,
    };

    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`;
    const logMessage = formatLogMessage("request", message, logData);

    if (process.env.NODE_ENV === "development") {
      console.log(`🌐 ${message}`);
    }

    writeToFile("access.log", logMessage);
  }

  // Database query logging
  logQuery(query, duration, result = null) {
    if (process.env.NODE_ENV === "development") {
      const logData = {
        query: query.substring(0, 200), // Truncate long queries
        duration: `${duration}ms`,
        affected: result?.affectedRows || null,
      };

      this.debug(`Database query executed`, logData);
    }
  }

  // Authentication logging
  logAuth(action, userId, success, meta = {}) {
    const logData = {
      action,
      userId,
      success,
      ip: meta.ip,
      userAgent: meta.userAgent,
      ...meta,
    };

    const message = `Auth ${action} - User ${userId} - ${
      success ? "Success" : "Failed"
    }`;
    const logMessage = formatLogMessage("auth", message, logData);

    if (success) {
      console.log(`🔐 ${message}`);
    } else {
      console.warn(`🚫 ${message}`);
    }

    writeToFile("auth.log", logMessage);
    writeToFile("app.log", logMessage);
  }
}

// Middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const logger = new Logger("http");

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });

  next();
};

module.exports = {
  Logger,
  requestLogger,
};
