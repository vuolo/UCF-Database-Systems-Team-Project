import { Inter as FontSans } from "@next/font/google";

import "../styles/globals.css";

import { cn } from "@/lib/utils";
import { Analytics } from "@/components/analytics";
import { TailwindIndicator } from "@/components/tailwind-indicator";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-inter",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang='en'
      className={cn(
        "bg-white font-sans text-slate-900 antialiased",
        fontSans.variable
      )}
    >
      <head />
      <body>
        {children}
        <Analytics />
        <TailwindIndicator />
      </body>
    </html>
  );
}
