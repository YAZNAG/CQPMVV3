/** Bcrypt cost factor (2^12 iterations) — balance security vs. login latency */
export const BCRYPT_ROUNDS = 12;

/** JWT session lifetime: 8 hours */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

/** Refresh session cookie every hour while active */
export const SESSION_UPDATE_AGE_SECONDS = 60 * 60;

/** Max failed login attempts per IP per window */
export const LOGIN_RATE_LIMIT = 5;
export const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_UNAUTHORIZED_PATH = "/admin/unauthorized";
