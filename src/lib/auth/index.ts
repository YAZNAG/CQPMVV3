export { handlers, auth, signIn, signOut } from "./auth-instance";

export async function getCurrentUser() {
  const { auth } = await import("./auth-instance");
  const session = await auth();
  return session?.user ?? null;
}

export { authConfig } from "./auth.config";
export * from "./guards";
export * from "./rbac";
export * from "./password";
export * from "./constants";
