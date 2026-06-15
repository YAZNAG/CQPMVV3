import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { ZodSchema } from "zod";
import { auth } from "@/lib/auth/auth-instance";
import { hasPermission, type PermissionAction, type PermissionResource } from "@/lib/auth/rbac";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import type { ActionResult } from "@/types";
import { createLogger } from "./logger";
import { AppError, toActionResult } from "./errors";
import { parseInput } from "./parse-input";
import { RATE_LIMITS, type RateLimitPreset } from "./rate-limit-config";

function actionToResponse(result: ActionResult<unknown>, extraStatus?: number) {
  if (result.success) {
    return NextResponse.json(result, { status: extraStatus ?? 200 });
  }
  const status =
    result.error === RATE_LIMITS.application.message ||
    result.error === RATE_LIMITS.contact.message ||
    result.error === RATE_LIMITS.status.message ||
    result.error === RATE_LIMITS.api.message
      ? 429
      : result.error === "Authentification requise." ||
          result.error === "Accès refusé."
        ? result.error === "Authentification requise."
          ? 401
          : 403
        : 400;
  return NextResponse.json(result, { status });
}

async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AppError("VALIDATION", "Corps JSON invalide.", 400);
  }
}

function checkRateLimit(preset: RateLimitPreset, ip: string): ActionResult<never> | null {
  const result = rateLimit(`${preset.keyPrefix}:${ip}`, preset.limit, preset.windowMs);
  if (!result.success) {
    return { success: false, error: preset.message };
  }
  return null;
}

export function createPublicRouteHandler<R>(options: {
  name: string;
  method: "POST" | "GET";
  rateLimit: RateLimitPreset;
  schema?: ZodSchema;
  handler: (
    data: unknown,
    ctx: { ip: string; request: Request }
  ) => Promise<ActionResult<R>>;
}) {
  const log = createLogger(`api:${options.name}`);

  return async function handler(request: Request) {
    if (request.method !== options.method) {
      return NextResponse.json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
    }

    try {
      const ip = getClientIp(request.headers);
      const apiLimited = checkRateLimit(RATE_LIMITS.api, ip);
      if (apiLimited) return actionToResponse(apiLimited);

      const limited = checkRateLimit(options.rateLimit, ip);
      if (limited) {
        log.warn("rate_limited", { ip });
        return actionToResponse(limited);
      }

      let data: unknown;
      if (options.method === "POST") {
        data = await parseJsonBody(request);
        if (options.schema) {
          const parsed = parseInput(options.schema, data);
          if (!parsed.ok) return actionToResponse(parsed.result);
          data = parsed.data;
        }
      }

      log.info("request", { ip, method: options.method });
      const result = await options.handler(data, { ip, request });
      log.info("response", { ip, success: result.success });
      return actionToResponse(result);
    } catch (error) {
      log.error("failed", { error: String(error) });
      const mapped = toActionResult(error);
      const status = error instanceof AppError ? error.status : 500;
      return NextResponse.json(mapped, { status });
    }
  };
}

export async function executeAdminRoute<R>(
  request: Request,
  options: {
    name: string;
    resource: PermissionResource;
    permission: PermissionAction;
    schema?: ZodSchema;
    handler: (
      data: unknown,
      ctx: { session: Session; ip: string; request: Request }
    ) => Promise<ActionResult<R>>;
  }
): Promise<NextResponse> {
  const handler = createAdminRouteHandler({
    name: options.name,
    methods: [request.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE"],
    resource: options.resource,
    permission: options.permission,
    schema: options.schema,
    handler: options.handler,
  });
  return handler(request);
}

export function createAdminRouteHandler<R>(options: {
  name: string;
  methods: ("GET" | "POST" | "PUT" | "PATCH" | "DELETE")[];
  resource: PermissionResource;
  permission: PermissionAction;
  schema?: ZodSchema;
  handler: (
    data: unknown,
    ctx: { session: Session; ip: string; request: Request }
  ) => Promise<ActionResult<R>>;
}) {
  const log = createLogger(`api:admin:${options.name}`);

  return async function handler(request: Request) {
    if (!options.methods.includes(request.method as (typeof options.methods)[number])) {
      return NextResponse.json({ success: false, error: "Méthode non autorisée" }, { status: 405 });
    }

    try {
      const ip = getClientIp(request.headers);
      const apiLimited = checkRateLimit(RATE_LIMITS.api, ip);
      if (apiLimited) return actionToResponse(apiLimited);

      const session = await auth();
      if (!session?.user?.id) {
        return actionToResponse({ success: false, error: "Authentification requise." }, 401);
      }
      if (!hasPermission(session.user.role, options.resource, options.permission)) {
        return actionToResponse({ success: false, error: "Accès refusé." }, 403);
      }

      let data: unknown;
      if (request.method !== "GET" && request.method !== "DELETE") {
        data = await parseJsonBody(request);
        if (options.schema) {
          const parsed = parseInput(options.schema, data);
          if (!parsed.ok) return actionToResponse(parsed.result);
          data = parsed.data;
        }
      }

      log.info("request", {
        userId: session.user.id,
        ip,
        method: request.method,
      });
      const result = await options.handler(data, { session, ip, request });
      log.info("response", { userId: session.user.id, success: result.success });
      const status = request.method === "POST" && result.success ? 201 : 200;
      return actionToResponse(result, status);
    } catch (error) {
      log.error("failed", { error: String(error) });
      const mapped = toActionResult(error);
      const status = error instanceof AppError ? error.status : 500;
      return NextResponse.json(mapped, { status });
    }
  };
}
