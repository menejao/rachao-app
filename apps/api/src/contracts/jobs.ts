import { z } from "zod";

export const runJobSchema = z.object({
  job: z.enum(["send_confirmation", "remind_pending", "close_list", "generate_teams"]),
  referenceDate: z.string().optional(),
});
