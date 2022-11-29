import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { User } from "@prisma/client";
import { DashboardHeader } from "@/components/dashboard/header";
import { SurveyCreateButton } from "@/components/dashboard/survey-create-button";
import { DashboardShell } from "@/components/dashboard/shell";
import { SurveyItem } from "@/components/dashboard/survey-item";
import { EmptyPlaceholder } from "@/components/dashboard/empty-placeholder";

async function getSurveysForUser(userId: User["id"]) {
  return await db.survey.findMany({
    where: {
      authorId: userId,
    },
    select: {
      id: true,
      title: true,
      published: true,
      createdAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) return redirect(authOptions?.pages?.signIn || "/sign-in");

  const surveys = await getSurveysForUser(user.id);

  return (
    <DashboardShell>
      <DashboardHeader heading='Surveys' text='Create and manage surveys.'>
        <SurveyCreateButton />
      </DashboardHeader>
      <div>
        {surveys?.length ? (
          <div className='divide-y divide-neutral-200 rounded-md border border-slate-200'>
            {surveys.map((survey) => (
              <SurveyItem key={survey.id} survey={survey} />
            ))}
          </div>
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name='post' />
            <EmptyPlaceholder.Title>No surveys created</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any surveys yet. Start creating content.
            </EmptyPlaceholder.Description>
            <SurveyCreateButton className='border-slate-200 bg-white text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2' />
          </EmptyPlaceholder>
        )}
      </div>
    </DashboardShell>
  );
}
