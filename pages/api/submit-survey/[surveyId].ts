import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { withMethods } from "@/lib/api-middlewares/with-methods";
import { withSurvey } from "@/lib/api-middlewares/with-survey";
import { db } from "@/lib/db";
import { surveyPatchSchema } from "@/lib/validations/survey";
import { SurveyQuestion, SurveyResponse } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "PATCH") {
    try {
      const surveyId = req.query.surveyId as string;

      const body = surveyPatchSchema.parse(req.body);

      body.responses.forEach(async (response: SurveyResponse) => {
        if (response.id == "undefined") {
          await db.surveyResponse.create({
            data: {
              questionId: response.questionId,
              surveyId: response.surveyId,
              respondentId: response.respondentId,
              type: response.type,
              type_1_answer: response.type_1_answer as number,
              type_2_answer: response.type_2_answer as string,
            },
            select: {
              id: true,
            },
          });
        } else {
          await db.surveyResponse.update({
            where: {
              id: response.id,
            },
            data: {
              type: response.type,
              type_1_answer: response.type_1_answer as number,
              type_2_answer: response.type_2_answer as string,
            },
          });
        }
      });

      const newSurveyResponses = await db.surveyResponse.findMany({
        select: {
          id: true,
          questionId: true,
          surveyId: true,
          respondentId: true,
          type: true,
          type_1_answer: true,
          type_2_answer: true,
        },
        where: {
          surveyId: surveyId,
          respondentId: body.user.id,
        },
      });

      return res.status(200).json({ responses: newSurveyResponses });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json(error.issues);
      }

      return res.status(422).end();
    }
  }
}

export default withMethods(["PATCH"], withSurvey(handler, true));
