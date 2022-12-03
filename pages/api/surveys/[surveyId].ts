import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { withMethods } from "@/lib/api-middlewares/with-methods";
import { withSurvey } from "@/lib/api-middlewares/with-survey";
import { db } from "@/lib/db";
import { surveyPatchSchema } from "@/lib/validations/survey";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    try {
      await db.survey.delete({
        where: {
          id: req.query.surveyId as string,
        },
      });

      return res.status(204).end();
    } catch (error) {
      return res.status(500).end();
    }
  }

  if (req.method === "PATCH") {
    try {
      const surveyId = req.query.surveyId as string;
      const survey = await db.survey.findUnique({
        where: {
          id: surveyId,
        },
      });

      const body = surveyPatchSchema.parse(req.body);

      await db.survey.update({
        where: {
          id: survey?.id,
        },
        data: {
          title: body.title || survey?.title,
          description: body.description,
          published: body.published,
        },
      });

      return res.end();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json(error.issues);
      }

      return res.status(422).end();
    }
  }
}

export default withMethods(["DELETE", "PATCH"], withSurvey(handler));
