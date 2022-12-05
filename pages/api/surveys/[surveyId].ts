import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

import { withMethods } from "@/lib/api-middlewares/with-methods";
import { withSurvey } from "@/lib/api-middlewares/with-survey";
import { db } from "@/lib/db";
import { surveyPatchSchema } from "@/lib/validations/survey";
import { Survey, SurveyQuestion } from "@prisma/client";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    try {
      await db.$queryRawUnsafe(`
        DELETE 
        FROM surveys 
        WHERE id = "${req.query.surveyId}"
      `);

      return res.status(204).end();
    } catch (error) {
      return res.status(500).end();
    }
  }

  if (req.method === "PATCH") {
    try {
      const surveyId = req.query.surveyId as string;
      const survey = (
        (await db.$queryRawUnsafe(`
        SELECT * 
        FROM surveys 
        WHERE id = "${surveyId}"
        `)) as Survey[]
      )[0];

      const body = surveyPatchSchema.parse(req.body);

      await db.$queryRawUnsafe(`
        UPDATE surveys SET title = "${
          body.title || survey?.title
        }", description = "${body.description}", published = ${
        body.published
      }, startAt = "${new Date(body.startAt)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}", endAt = "${new Date(body.endAt)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ")}"
        WHERE id = "${survey?.id}"
      `);

      // Retrieve survey questions that are already in the DB
      const surveyQuestions = (await db.$queryRawUnsafe(`
        SELECT id, surveyId, prompt, type
        FROM survey_questions
        WHERE surveyId = "${survey?.id}"
      `)) as SurveyQuestion[];

      // Delete mismatched survey questions
      for (let i = 0; i < surveyQuestions.length; i++) {
        let foundQuestionID = false;

        // Search for Question ID presence
        for (let j = 0; j < body.questions.length; j++) {
          if (body.questions[j].id == surveyQuestions[i].id) {
            foundQuestionID = true;
            break;
          }
        }

        // Execute SQL DELETE
        if (!foundQuestionID)
          try {
            await db.$queryRawUnsafe(`
              DELETE FROM survey_questions WHERE id = "${surveyQuestions[i].id}"
            `);
          } catch (error) {
            console.log(error);
          }
      }

      body.questions.forEach(async (question: SurveyQuestion) => {
        if (question.id == "undefined") {
          await db.$queryRawUnsafe(`
            INSERT INTO survey_questions (id, surveyId, prompt, type)
            VALUES ("${uuidv4()}", "${question.surveyId}", "${
            question.prompt
          }", ${question.type})
          `);
        } else {
          await db.$queryRawUnsafe(`
            UPDATE survey_questions
            SET prompt = "${question.prompt}", type = ${question.type} 
            WHERE id = "${question.id}"
          `);
        }
      });

      const newSurveyQuestions = (await db.$queryRawUnsafe(`
        SELECT *
        FROM survey_questions
        WHERE surveyId = "${survey.id}"
      `)) as SurveyQuestion[];

      return res.status(200).json({ questions: newSurveyQuestions });
    } catch (error) {
      console.log(error);

      if (error instanceof z.ZodError) {
        return res.status(422).json(error.issues);
      }

      return res.status(422).end();
    }
  }
}

export default withMethods(["DELETE", "PATCH"], withSurvey(handler));
