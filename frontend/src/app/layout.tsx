import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SaaSquatch Leads - AI Lead Intelligence Dashboard',
  description: 'B2B lead generation tool with AI intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} app-layout`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
