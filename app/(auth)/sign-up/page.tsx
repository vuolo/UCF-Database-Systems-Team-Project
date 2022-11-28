import Link from "next/link";
import Image from "next/image";

import knightro from "@/public/images/knightro.png";
import { getCurrentUser } from "@/lib/session";
import { Icons, UCFLogo } from "@/components/icons";
import { UserAuthForm } from "@/components/dashboard/user-auth-form";
import { ClientRedirect } from "@/components/client-redirect";

export default async function SignUpPage() {
  const user = await getCurrentUser();

  if (user) return <ClientRedirect />;

  return (
    <div className='container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/sign-in'
        className='absolute top-4 right-4 inline-flex items-center justify-center rounded-lg border border-transparent bg-transparent py-2 px-3 text-center text-sm  font-medium text-slate-900 hover:border-slate-200 hover:bg-slate-100 focus:z-10 focus:outline-none focus:ring-4 focus:ring-slate-200 md:top-8 md:right-8'
      >
        Sign in
      </Link>
      <div className='hidden h-full bg-slate-100 lg:flex lg:justify-center lg:items-center'>
        <Image
          src={knightro}
          // width={600}
          alt='Sign Up'
          priority
          className='p-20'
        />
      </div>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-center'>
            {/* <Icons.logo className='mx-auto h-6 w-6' /> */}
            <UCFLogo className='mx-auto h-6 w-6' />
            <h1 className='text-2xl font-bold'>Create an account</h1>
            <p className='text-sm text-slate-600'>
              Enter your email below to create your account
            </p>
          </div>
          <UserAuthForm />
          <p className='px-8 text-center text-sm text-slate-600'>
            By clicking continue, you agree to our{" "}
            <Link href='/terms' className='underline hover:text-brand'>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href='/privacy' className='underline hover:text-brand'>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
