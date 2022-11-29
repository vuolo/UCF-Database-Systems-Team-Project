import { redirect } from "next/navigation";

import { Survey, User } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { authOptions } from "@/lib/auth";
import { Editor } from "@/components/dashboard/editor";
import notFound from "./not-found";

async function getSurveyForUser(surveyId: Survey["id"], userId: User["id"]) {
  return await db.survey.findFirst({
    where: {
      id: surveyId,
      authorId: userId,
    },
  });
}

interface EditorPageProps {
  params: { surveyId: string };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const user = await getCurrentUser();

  if (!user) return redirect(authOptions?.pages?.signIn || "/sign-in");

  const survey = await getSurveyForUser(params.surveyId, user.id);

  if (!survey) return notFound();

  return (
    <Editor
      survey={{
        id: survey.id,
        title: survey.title,
        description: survey.description,
        published: survey.published,
      }}
    />
  );
}
