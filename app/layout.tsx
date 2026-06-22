// app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'AI Blog Studio - Create Amazing Content with AI',
  description: 'Generate high-quality, SEO-optimized blog posts using advanced AI technology. Perfect for bloggers, content creators, and businesses.',
  keywords: 'AI blog writer, content generation, SEO optimization, blog automation, AI content creator',
  authors: [{ name: 'AI Blog Studio' }],
  openGraph: {
    title: 'AI Blog Studio - Create Amazing Content with AI',
    description: 'Generate high-quality, SEO-optimized blog posts using advanced AI technology',
    url: 'https://aiblogstudio.com',
    siteName: 'AI Blog Studio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Blog Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Blog Studio - Create Amazing Content with AI',
    description: 'Generate high-quality, SEO-optimized blog posts using advanced AI technology',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}