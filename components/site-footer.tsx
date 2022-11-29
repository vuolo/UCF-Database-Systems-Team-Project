import { siteConfig } from "@/config/site";
import { Icons, UCFLogo } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className='container bg-white text-slate-600'>
      <div className='flex  flex-col items-center justify-between gap-4 border-t border-t-slate-200 py-10 md:h-24 md:flex-row md:py-0'>
        <div className='flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0'>
          <UCFLogo />
          <p className='text-center text-sm leading-loose md:text-left'>
            Built by Team Project Group 16. Hosted on{" "}
            <a
              href='https://vercel.com'
              target='_blank'
              rel='noreferrer'
              className='font-medium underline underline-offset-4'
            >
              Vercel
            </a>
            .
          </p>
        </div>
        <p className='text-center text-sm md:text-left'>
          The source code is available on{" "}
          <a
            href={siteConfig.links.github}
            target='_blank'
            rel='noreferrer'
            className='font-medium underline underline-offset-4'
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
