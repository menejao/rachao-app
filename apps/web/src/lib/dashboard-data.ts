import type { DashboardData } from "@rachao/types";
import { computeDashboard } from "@/lib/store";

export async function getDashboardData(): Promise<DashboardData> {
  return computeDashboard();
}
