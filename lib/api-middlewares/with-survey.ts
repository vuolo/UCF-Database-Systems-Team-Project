import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import * as z from "zod";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Survey } from "@prisma/client";

export const schema = z.object({
  surveyId: z.string(),
});

export function withSurvey(handler: NextApiHandler, force: boolean = false) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      const query = await schema.parse(req.query);

      // Check if the user has access to this survey.
      if (!force) {
        const session = await unstable_getServerSession(req, res, authOptions);

        const surveys = (await db.$queryRawUnsafe(`
        SELECT id FROM surveys
        WHERE id = "${query.surveyId}"
        AND authorId = "${session?.user.id}"`)) as Survey[];

        const count = surveys.length;

        if (count < 1) {
          return res.status(403).end();
        }
      }

      return handler(req, res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json(error.issues);
      }

      return res.status(500).end();
    }
  };
}
