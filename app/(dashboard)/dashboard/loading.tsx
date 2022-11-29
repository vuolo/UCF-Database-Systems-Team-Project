import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { SurveyCreateButton } from "@/components/dashboard/survey-create-button";
import { SurveyItem } from "@/components/dashboard/survey-item";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading='Posts' text='Create and manage posts.'>
        <SurveyCreateButton />
      </DashboardHeader>
      <div className='divide-y divide-neutral-200 rounded-md border border-slate-200'>
        <SurveyItem.Skeleton />
        <SurveyItem.Skeleton />
        <SurveyItem.Skeleton />
        <SurveyItem.Skeleton />
        <SurveyItem.Skeleton />
      </div>
    </DashboardShell>
  );
}
