import { NextApiRequest, NextApiResponse } from "next";
import * as z from "zod";

import { withMethods } from "@/lib/api-middlewares/with-methods";
import { withSurvey } from "@/lib/api-middlewares/with-survey";
import { db } from "@/lib/db";
import { surveyPatchSchema } from "@/lib/validations/survey";
import { SurveyQuestion } from "@prisma/client";

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
          startAt: new Date(body.startAt),
          endAt: new Date(body.endAt),
        },
      });

      // Retrieve survey questions that are already in the DB
      const surveyQuestions = await db.surveyQuestion.findMany({
        select: {
          id: true,
          surveyId: true,
          prompt: true,
          type: true,
        },
        where: {
          surveyId: survey?.id,
        },
      });

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
            await db.surveyQuestion.delete({
              where: {
                id: surveyQuestions[i].id,
              },
            });
          } catch (error) {
            console.log(error);
          }
      }

      body.questions.forEach(async (question: SurveyQuestion) => {
        if (question.id == "undefined") {
          await db.surveyQuestion.create({
            data: {
              surveyId: question.surveyId,
              prompt: question.prompt,
              type: question.type,
            },
            select: {
              id: true,
            },
          });
        } else {
          await db.surveyQuestion.update({
            where: {
              id: question.id,
            },
            data: {
              prompt: question.prompt,
              type: question.type,
            },
          });
        }
      });

      const newSurveyQuestions = await db.surveyQuestion.findMany({
        select: {
          id: true,
          surveyId: true,
          prompt: true,
          type: true,
        },
        where: {
          surveyId: survey?.id,
        },
      });

      return res.status(200).json({ questions: newSurveyQuestions });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json(error.issues);
      }

      return res.status(422).end();
    }
  }
}

export default withMethods(["DELETE", "PATCH"], withSurvey(handler));
