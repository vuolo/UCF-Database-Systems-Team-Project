import { Survey, SurveyQuestion, SurveyResponse, User } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import notFound from "../not-found";
import NotActive from "../not-active";
import NotPublished from "../not-published";
import NotAuthenticated from "../not-authenticated";
import { SurveyResults } from "@/components/dashboard/survey-results";

interface SurveyPageProps {
  params: {
    surveyId: string;
  };
}

async function getSurvey(surveyId: Survey["id"]) {
  return (
    (await db.$queryRawUnsafe(`
    SELECT *
    FROM surveys
    WHERE id="${surveyId}"
  `)) as Survey[]
  )[0];
}

async function getSurveyQuestions(surveyId: Survey["id"]) {
  return (await db.$queryRawUnsafe(`
  SELECT *
  FROM survey_questions
  WHERE surveyId="${surveyId}"
`)) as SurveyQuestion[];
}

async function getSurveyResponsesForUser(
  questions: SurveyQuestion[],
  surveyId: Survey["id"],
  respondentId: User["id"]
) {
  return (await db.$queryRawUnsafe(`
    SELECT sr.*, u.email respondentEmail
    FROM (
      survey_responses AS sr 
      INNER JOIN users AS u 
      ON (sr.respondentId = u.id)
    )
    WHERE surveyId="${surveyId}"
`)) as (SurveyResponse & { respondentEmail: string })[];
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const surveyId = params?.surveyId;

  const survey = await getSurvey(surveyId);
  if (!survey) return notFound();

  const user = await getCurrentUser();
  if (!user) return NotAuthenticated();

  // TODO: also check whether the user is the survey author access to this survey.

  const surveyQuestions = await getSurveyQuestions(surveyId);
  const surveyResponses = await getSurveyResponsesForUser(
    surveyQuestions,
    surveyId,
    user.id
  );

  return (
    <>
      <SurveyResults
        survey={{
          id: survey.id,
          title: survey.title,
          description: survey.description,
          published: survey.published,
          startAt: survey.startAt,
          endAt: survey.endAt,
        }}
        incomingQuestions={surveyQuestions}
        incomingResponses={surveyResponses}
        user={{
          id: user.id,
        }}
      />
    </>
  );
}
