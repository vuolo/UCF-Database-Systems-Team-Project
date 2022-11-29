import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";
import { unstable_getServerSession } from "next-auth/next";

import { db } from "@/lib/db";
import { withMethods } from "@/lib/api-middlewares/with-methods";
import { authOptions } from "@/lib/auth";

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
      const surveys = await db.survey.findMany({
        select: {
          id: true,
          title: true,
          published: true,
          createdAt: true,
        },
        where: {
          authorId: user.id,
        },
      });

      return res.json(surveys);
    } catch (error) {
      return res.status(500).end();
    }
  }

  if (req.method === "POST") {
    try {
      const body = surveyCreateSchema.parse(req.body);

      const survey = await db.survey.create({
        data: {
          title: body.title!,
          description: body.description!,
          authorId: session.user.id,
        },
        select: {
          id: true,
        },
      });

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
