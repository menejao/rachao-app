export type UserRole = "ADMIN" | "PLAYER";

export type Permission =
  | "team:read"
  | "team:update"
  | "players:manage"
  | "games:create"
  | "games:read"
  | "finance:read"
  | "finance:write"
  | "invites:manage"
  | "settings:manage"
  | "presence:respond";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "team:read",
    "team:update",
    "players:manage",
    "games:create",
    "games:read",
    "finance:read",
    "finance:write",
    "invites:manage",
    "settings:manage",
    "presence:respond",
  ],
  PLAYER: [
    "team:read",
    "games:read",
    "finance:read",
    "presence:respond",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function adminOnly(role: UserRole): boolean {
  return role === "ADMIN";
}
