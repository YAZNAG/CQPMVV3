type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

function emit(level: LogLevel, scope: string, message: string, meta?: LogMeta) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    scope,
    message,
    ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else if (process.env.NODE_ENV !== "production" || level !== "debug") {
    console.log(line);
  }
}

export function createLogger(scope: string) {
  return {
    debug: (message: string, meta?: LogMeta) => emit("debug", scope, message, meta),
    info: (message: string, meta?: LogMeta) => emit("info", scope, message, meta),
    warn: (message: string, meta?: LogMeta) => emit("warn", scope, message, meta),
    error: (message: string, meta?: LogMeta) => emit("error", scope, message, meta),
  };
}
