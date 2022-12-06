import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";
import { unstable_getServerSession } from "next-auth/next";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/lib/db";
import { withMethods } from "@/lib/api-middlewares/with-methods";
import { authOptions } from "@/lib/auth";
import { Survey } from "@prisma/client";

const surveyCreateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(403).end();
  }

  const { user } = session;

  if (req.method === "GET") {
    try {
      const surveys = (await db.$queryRawUnsafe(`
        SELECT *
        FROM surveys
        WHERE authorId = "${user.id}"
      `)) as Survey[];

      return res.json(surveys);
    } catch (error) {
      return res.status(500).end();
    }
  }

  if (req.method === "POST") {
    try {
      const body = surveyCreateSchema.parse(req.body);

      await db.$queryRawUnsafe(`
          INSERT INTO surveys (id, title, description, authorId)
          VALUES ("${uuidv4()}", "${body.title!}", "${body.description!}", "${
        session.user.id
      }")
      `);

      const survey = (
        (await db.$queryRaw`
          SELECT *
          FROM surveys
          ORDER BY endAt ASC
          LIMIT 1;
      `) as Survey[]
      )[0];

      return res.json(survey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json(error.issues);
      }

      return res.status(500).end();
    }
  }
}

export default withMethods(["GET", "POST"], handler);
