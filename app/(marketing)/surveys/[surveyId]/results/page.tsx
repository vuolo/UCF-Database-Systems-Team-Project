import { Survey, SurveyQuestion, SurveyResponse, User } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import notFound from "../not-found";
import NotActive from "../not-active";
import NotPublished from "../not-published";
import NotAuthenticated from "../not-authenticated";

interface SurveyPageProps {
  params: {
    surveyId: string;
  };
}

async function getSurvey(surveyId: Survey["id"]) {
  return (
    (await db.$queryRaw`
    SELECT *
    FROM surveys
    WHERE id=${surveyId}
  `) as Survey[]
  )[0];
}

async function getSurveyQuestions(surveyId: Survey["id"]) {
  return (await db.$queryRaw`
  SELECT *
  FROM survey_questions
  WHERE surveyId=${surveyId}
`) as SurveyQuestion[];
}

async function getSurveyResponsesForUser(
  questions: SurveyQuestion[],
  surveyId: Survey["id"],
  respondentId: User["id"]
) {
  return (await db.$queryRaw`
    SELECT *
    FROM survey_responses
    WHERE surveyId=${surveyId}
`) as SurveyResponse[];
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const surveyId = params?.surveyId;

  const survey = await getSurvey(surveyId);
  if (!survey) return notFound();
  if (!survey.published) return NotPublished();
  // TODO: ALSO check if local time is within the survey's active start-end period.
  if (false) return NotActive();

  const user = await getCurrentUser();
  if (!user) return NotAuthenticated();

  // TODO: also check whether the user is allowed access to this survey.

  const surveyQuestions = await getSurveyQuestions(surveyId);
  const surveyResponses = await getSurveyResponsesForUser(
    surveyQuestions,
    surveyId,
    user.id
  );

  return (
    <>
      <p>TODO: Results here...</p>
    </>
  );
}