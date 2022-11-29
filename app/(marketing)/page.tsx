import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import pegasus from "@/public/images/pegasus.png";
import { siteConfig } from "@/config/site";
import { getCurrentUser } from "@/lib/session";

export default async function IndexPage() {
  const user = await getCurrentUser();

  if (user) redirect("/surveys");

  return (
    <>
      <section className='container grid items-center justify-center gap-6 pt-6 pb-8 md:pt-10 md:pb-12 lg:pt-16 lg:pb-24'>
        <Image src={pegasus} width={250} alt='Pegasus' priority />
        <div className='mx-auto flex flex-col items-start gap-4 lg:w-[52rem]'>
          <h1 className='text-3xl font-bold leading-[1.1] tracking-tighter sm:text-5xl md:text-6xl'>
            Student Surveys
          </h1>
          <p className='max-w-[42rem] leading-normal text-slate-700 sm:text-xl sm:leading-8'>
            A web app for our Database Systems Team Project.
          </p>
        </div>
        <div className='flex gap-4'>
          <Link
            href='/surveys'
            className='relative inline-flex h-11 items-center rounded-md border border-transparent bg-brand-500 px-8 py-2 font-medium text-white hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
          >
            Get Started
          </Link>
          <Link
            href={siteConfig.links.github}
            target='_blank'
            rel='noreferrer'
            className='relative inline-flex h-11 items-center rounded-md border border-slate-200 bg-white px-8 py-2 font-medium text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2'
          >
            GitHub
          </Link>
        </div>
      </section>
    </>
  );
}
