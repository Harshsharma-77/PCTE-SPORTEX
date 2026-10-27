import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-sportex-500 selection:text-white transition-colors duration-200">
      <Header />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
