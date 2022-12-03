import Link from "next/link";

import { EmptyPlaceholder } from "@/components/dashboard/empty-placeholder";

export default function NotAuthenticated() {
  return (
    <EmptyPlaceholder className='mx-auto max-w-[800px] mt-20'>
      <EmptyPlaceholder.Icon name='warning' />
      <EmptyPlaceholder.Title>Uh oh! Not Signed In</EmptyPlaceholder.Title>
      <EmptyPlaceholder.Description>
        This survey requires you to be signed in...
      </EmptyPlaceholder.Description>
      <Link
        href='/sign-in'
        className='relative inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-4 py-2  text-sm font-medium text-brand-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2'
      >
        Sign in
      </Link>
    </EmptyPlaceholder>
  );
}
