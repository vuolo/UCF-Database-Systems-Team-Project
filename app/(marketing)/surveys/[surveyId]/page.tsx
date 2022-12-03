import { Survey, SurveyQuestion } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import notFound from "./not-found";
import NotActive from "./not-active";
import NotPublished from "./not-published";
import NotAuthenticated from "./not-authenticated";

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

export default async function SurveyPage({ params }: SurveyPageProps) {
  const surveyId = params?.surveyId;

  const survey = await getSurvey(surveyId);
  if (!survey) return notFound();
  if (!survey.published) return NotPublished();
  // TODO: ALSO check if local time is within the survey's active start-end period.
  if (false) return NotActive();

  const user = await getCurrentUser();
  if (!user) return NotAuthenticated();

  const surveyQuestions = await getSurveyQuestions(surveyId);

  return (
    <>
      <section className='container grid items-center justify-center gap-6 pt-6 pb-8 md:pt-10 md:pb-12 lg:pt-16 lg:pb-24'>
        <div className='mx-auto flex flex-col items-start gap-4 lg:w-[52rem]'>
          <h1 className='text-3xl font-bold leading-[1.1] tracking-tighter sm:text-5xl md:text-6xl'>
            {survey.title}
          </h1>
          {survey.description.length > 0 && (
            <p className='max-w-[42rem] leading-normal text-slate-700 sm:text-xl sm:leading-8'>
              {survey.description}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
