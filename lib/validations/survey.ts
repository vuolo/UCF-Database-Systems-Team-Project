import * as z from "zod";

export const surveyPatchSchema = z.object({
  title: z.string().min(3).max(128).optional(),
  description: z.string().optional(),
  published: z.boolean().optional(),
  startAt: z.any().optional(),
  endAt: z.any().optional(),
  questions: z.any().optional(),

  user: z.any().optional(),
  responses: z.any().optional(),
});
