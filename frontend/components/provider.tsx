import { ThemeProvider } from 'next-themes';
import React from 'react';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster position="top-right" richColors closeButton theme="system" />

      {children}
    </ThemeProvider>
  );
}
