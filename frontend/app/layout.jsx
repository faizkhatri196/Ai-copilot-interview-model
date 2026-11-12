import './globals.css';

export const metadata = {
  title: 'AI Interview Intelligence | Ultra-Elite Edition',
  description: 'AI-Powered Realistic Interview Preparation, Company Intelligence, Coding Assessment and Voice Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans bg-background-primary text-content-primary min-h-screen selection:bg-brand-purple selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
