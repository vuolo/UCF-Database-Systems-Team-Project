import Link from "next/link";
import Image from "next/image";
import { compareDesc } from "date-fns";
import { Survey } from "@prisma/client";

import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";

export default async function SurveysPage() {
  const user = await getCurrentUser();

  const surveys: Survey[] = ([] as Survey[]) // TODO: get all active surveys
    .filter((survey) => survey.published)
    .sort((a, b) => {
      return compareDesc(new Date(a.createdAt), new Date(b.createdAt));
    });

  return (
    <div className='container max-w-4xl py-6 lg:py-10'>
      <div className='flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8'>
        <div className='flex-1 space-y-4'>
          <h1 className='inline-block text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl'>
            Surveys
          </h1>
          <p className='text-xl text-slate-600'>
            Student surveys built using MySQL.
          </p>
        </div>
        <Link
          href='/dashboard'
          className='relative inline-flex h-11 items-center rounded-md border border-slate-900 bg-white px-8 py-2 text-center font-medium text-slate-900 transition-colors hover:bg-slate-900 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
        >
          {user ? "Create your own" : "Sign in to create your own"}
        </Link>
      </div>
      <hr className='my-8 border-slate-200' />
      {surveys?.length ? (
        <div className='grid gap-10 sm:grid-cols-2'>
          {surveys.map((survey, index) => (
            <article
              key={survey.id}
              className='group relative flex flex-col space-y-2'
            >
              {survey.image && (
                <Image
                  src={survey.image}
                  alt={survey.title}
                  width={804}
                  height={452}
                  className='rounded-md border border-slate-200 bg-slate-200 transition-colors group-hover:border-slate-900'
                  priority={index <= 1}
                />
              )}
              <h2 className='text-2xl font-extrabold'>{survey.title}</h2>
              {survey.description && (
                <p className='text-slate-600'>{survey.description}</p>
              )}
              {/* TODO: update real-time 'Ends in ' + new Date(endAt) - new Date() */}
              {survey.createdAt && (
                <p className='text-sm text-slate-600'>
                  {formatDate(survey.createdAt.getTime())}
                </p>
              )}
              <Link href={`/surveys/${survey.id}`} className='absolute inset-0'>
                <span className='sr-only'>View Survey</span>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p>There are no active surveys.</p>
      )}
    </div>
  );
}
