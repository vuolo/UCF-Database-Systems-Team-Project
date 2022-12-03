import { Survey, SurveyQuestion, SurveyResponse, User } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import notFound from "./not-found";
import NotActive from "./not-active";
import NotPublished from "./not-published";
import NotAuthenticated from "./not-authenticated";
import { SurveyResponder } from "@/components/dashboard/survey-responder";

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
  let newResponses = [] as SurveyResponse[];
  for (let i = 0; i < questions.length; i++)
    newResponses.push({
      id: "undefined",
      questionId: questions[i].id,
      surveyId: surveyId,
      respondentId: respondentId,
      type: questions[i].type,
      type_1_answer: 1,
      type_2_answer: "",
    });

  let queriedResponses = (await db.$queryRaw`
  SELECT *
  FROM survey_responses
  WHERE surveyId=${surveyId} AND respondentId=${respondentId}
`) as SurveyResponse[];

  // Update with user's responses
  for (let i = 0; i < newResponses.length; i++) {
    for (let j = 0; j < queriedResponses.length; j++) {
      if (newResponses[i].questionId == queriedResponses[j].questionId) {
        newResponses[i].id = queriedResponses[j].id;
        newResponses[i].type_1_answer = queriedResponses[j].type_1_answer;
        newResponses[i].type_2_answer = queriedResponses[j].type_2_answer;
      }
    }
  }

  // Now, if the response id's are still all "undefined", that means the user never has submitted them to the DB yet.
  return newResponses;
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
      <SurveyResponder
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
