import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

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
          await db.$queryRawUnsafe(`
            INSERT INTO survey_responses (id, questionId, surveyId, respondentId, type, type_1_answer, type_2_answer)
            VALUES ("${uuidv4()}", "${response.questionId}", "${
            response.surveyId
          }", "${response.respondentId}", ${response.type}, ${
            response.type_1_answer
          }, "${response.type_2_answer}");
          `);
        } else {
          await db.$queryRawUnsafe(`
            UPDATE survey_responses
            SET type = ${response.type}, type_1_answer = ${response.type_1_answer}, type_2_answer = "${response.type_2_answer}"
            WHERE id = "${response.id}"
          `);
        }
      });

      const newSurveyResponses = await db.$queryRawUnsafe(`
        SELECT *
        FROM survey_responses
        WHERE surveyId = "${surveyId}" AND respondentId = "${body.user.id}"
      `);

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
