import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Release Automation',
  description: 'A release automation tool built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
