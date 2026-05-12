"use client";

import { useInactivityLogout } from "@/hooks/use-inactivity-logout";

export function InactivityWatcher() {
  useInactivityLogout(30 * 60 * 1000); // 30 min
  return null;
}
