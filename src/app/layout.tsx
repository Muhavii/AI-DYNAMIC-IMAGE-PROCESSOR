import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';

// Initialize the Inter font with required subsets
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  adjustFontFallback: false,
});

export const metadata = {
  title: 'AI Image Processor',
  description: 'Upload and process images with AI',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Image Processor</h1>
              <p className="text-gray-600">Upload an image and let AI analyze it for you</p>
              <p className="text-sm text-gray-500 mt-2">© {new Date().getFullYear()} Made by Muhavi</p>
            </header>
            {children}
          </div>
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
