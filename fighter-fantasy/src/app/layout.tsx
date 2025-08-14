import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Bebas_Neue, Barlow, Russo_One } from 'next/font/google';

// Primary display font - similar to VENUM's bold, angular style
const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

// Secondary display font for variety
const russoOne = Russo_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-russo',
});

// Body text font - clean and readable but still bold options
const barlow = Barlow({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-barlow',
});

export const metadata = {
  title: 'Fighter Fantasy - UFC Fantasy Sports',
  description: 'Build your ultimate UFC fantasy team and compete with friends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${bebasNeue.variable} ${russoOne.variable} ${barlow.variable} bg-black text-white font-barlow`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
