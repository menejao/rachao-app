import { z } from "zod";

export const generateTeamsSchema = z.object({
  jogoId: z.string().min(3),
  teamCount: z.number().int().min(2).max(6).optional(),
});
