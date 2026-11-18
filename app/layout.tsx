import type { Metadata } from 'next';
import { Source_Serif_4, IBM_Plex_Serif, Lora } from 'next/font/google';
import './globals.css';
import StorefrontShell from '@/components/StorefrontShell';
import { getPublicSiteSettings } from '@/lib/db/queries';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
});

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-serif',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Alick System Services — Smart Tech. Sharp Deals.',
    template: '%s | Alick System Services',
  },
  description:
    'Your trusted source for laptops, desktops, smart gadgets, and professional repair services in Lagos, Nigeria.',
  keywords: [
    'laptops Lagos',
    'computer store Lagos',
    'laptop repair Ikeja',
    'buy laptops Nigeria',
    'Alick System Services',
  ],
  openGraph: {
    title: 'Alick System Services',
    description: "Smart Tech. Sharp Deals. Lagos' premier computer store.",
    siteName: 'Alick System Services',
    locale: 'en_NG',
    type: 'website',
  },
};

const themeScript =
  "(function(){try{var t=localStorage.getItem('adammant-theme');var d=t?t==='dark':true;var h=document.documentElement;h.classList.toggle('dark',d);h.style.colorScheme=d?'dark':'light';}catch(e){}})();";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getPublicSiteSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sourceSerif.variable} ${ibmPlexSerif.variable} ${lora.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <StorefrontShell settings={settings}>{children}</StorefrontShell>
      </body>
    </html>
  );
}
