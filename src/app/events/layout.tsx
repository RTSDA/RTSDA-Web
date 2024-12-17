import { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
