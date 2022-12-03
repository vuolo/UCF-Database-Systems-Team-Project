import { Survey } from "@prisma/client";
import Link from "next/link";

import { formatDate } from "@/lib/utils";
import { SurveyOperations } from "@/components/dashboard/survey-operations";
import { Skeleton } from "@/ui/skeleton";

interface SurveyItemProps {
  survey: Pick<Survey, "id" | "title" | "published" | "createdAt">;
}

export function SurveyItem({ survey }: SurveyItemProps) {
  return (
    <div className='flex items-center justify-between p-4'>
      <div className='grid gap-1'>
        <Link
          href={`/editor/${survey.id}`}
          className='font-semibold hover:underline'
        >
          {survey.title}
        </Link>
        <div>
          <p className='text-sm text-slate-600'>
            {formatDate(survey.createdAt?.toDateString())}
            {" • "}
            {survey.published ? "Published" : "Draft"}
          </p>
        </div>
      </div>
      <SurveyOperations survey={{ id: survey.id, title: survey.title }} />
      {/* <SurveyDeleteButton survey={{ id: survey.id, title: survey.title }} /> */}
    </div>
  );
}

SurveyItem.Skeleton = function SurveyItemSkeleton() {
  return (
    <div className='p-4'>
      <div className='space-y-3'>
        <Skeleton className='h-5 w-2/5' />
        <Skeleton className='h-4 w-4/5' />
      </div>
    </div>
  );
};
