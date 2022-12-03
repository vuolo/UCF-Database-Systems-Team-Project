import Link from "next/link";

import { EmptyPlaceholder } from "@/components/dashboard/empty-placeholder";

export default function NotActive() {
  return (
    <EmptyPlaceholder className='mx-auto max-w-[800px] mt-20'>
      <EmptyPlaceholder.Icon name='warning' />
      <EmptyPlaceholder.Title>Uh oh! Inactive Survey</EmptyPlaceholder.Title>
      <EmptyPlaceholder.Description>
        This survey is no-longer active.
      </EmptyPlaceholder.Description>
      <Link
        href='/surveys'
        className='relative inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-4 py-2  text-sm font-medium text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2'
      >
        Go to Active Surveys
      </Link>
    </EmptyPlaceholder>
  );
}
