export type RateLimitPreset = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
  message: string;
};

export const RATE_LIMITS = {
  application: {
    keyPrefix: "application",
    limit: 5,
    windowMs: 3_600_000,
    message: "Trop de tentatives. Réessayez plus tard.",
  },
  status: {
    keyPrefix: "status",
    limit: 20,
    windowMs: 60_000,
    message: "Trop de requêtes.",
  },
  contact: {
    keyPrefix: "contact",
    limit: 5,
    windowMs: 3_600_000,
    message: "Trop de messages envoyés.",
  },
  login: {
    keyPrefix: "login-action",
    limit: 5,
    windowMs: 900_000,
    message: "Trop de tentatives. Réessayez dans 15 minutes.",
  },
  api: {
    keyPrefix: "api",
    limit: 120,
    windowMs: 60_000,
    message: "Limite de requêtes API atteinte.",
  },
} as const satisfies Record<string, RateLimitPreset>;
