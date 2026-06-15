import { headers } from "next/headers";
import type { Session } from "next-auth";
import type { ZodSchema } from "zod";
import { assertPermission } from "@/lib/auth/guards";
import type { PermissionAction, PermissionResource } from "@/lib/auth/rbac";
import { getClientIp, rateLimit } from "@/lib/security/rate-limit";
import type { ActionResult } from "@/types";
import { createLogger } from "./logger";
import { toActionResult } from "./errors";
import { parseInput } from "./parse-input";
import type { RateLimitPreset } from "./rate-limit-config";

export type PublicActionContext = {
  ip: string;
  userAgent?: string;
};

export type AdminActionContext = {
  session: Session;
  ip: string;
  userAgent?: string;
};

async function getRequestMeta() {
  const headersList = await headers();
  return {
    ip: getClientIp(headersList),
    userAgent: headersList.get("user-agent") ?? undefined,
  };
}

function applyRateLimit(preset: RateLimitPreset, ip: string): ActionResult<never> | null {
  const key = `${preset.keyPrefix}:${ip}`;
  const result = rateLimit(key, preset.limit, preset.windowMs);
  if (!result.success) {
    return { success: false, error: preset.message };
  }
  return null;
}

export async function runPublicAction<R>(options: {
  name: string;
  rateLimit: RateLimitPreset;
  schema?: ZodSchema;
  input?: unknown;
  handler: (ctx: PublicActionContext, data?: unknown) => Promise<ActionResult<R>>;
}): Promise<ActionResult<R>> {
  const log = createLogger(`action:${options.name}`);
  try {
    const { ip, userAgent } = await getRequestMeta();
    const limited = applyRateLimit(options.rateLimit, ip);
    if (limited) {
      log.warn("rate_limited", { ip });
      return limited;
    }

    let data: unknown = options.input;
    if (options.schema) {
      const parsed = parseInput(options.schema, options.input);
      if (!parsed.ok) {
        log.warn("validation_failed", { ip });
        return parsed.result;
      }
      data = parsed.data;
    }

    log.info("start", { ip });
    const result = await options.handler({ ip, userAgent }, data);
    log.info("done", { ip, success: result.success });
    return result;
  } catch (error) {
    log.error("failed", { error: String(error) });
    return toActionResult(error);
  }
}

export async function runAdminAction<R>(options: {
  name: string;
  resource: PermissionResource;
  permission: PermissionAction;
  schema?: ZodSchema;
  input?: unknown;
  handler: (ctx: AdminActionContext, data?: unknown) => Promise<ActionResult<R>>;
}): Promise<ActionResult<R>> {
  const log = createLogger(`action:${options.name}`);
  try {
    const session = await assertPermission(options.resource, options.permission);
    const { ip, userAgent } = await getRequestMeta();

    let data: unknown = options.input;
    if (options.schema) {
      const parsed = parseInput(options.schema, options.input);
      if (!parsed.ok) {
        log.warn("validation_failed", { userId: session.user.id });
        return parsed.result;
      }
      data = parsed.data;
    }

    log.info("start", { userId: session.user.id, ip });
    const result = await options.handler({ session, ip, userAgent }, data);
    log.info("done", { userId: session.user.id, success: result.success });
    return result;
  } catch (error) {
    log.error("failed", { error: String(error) });
    return toActionResult(error);
  }
}
