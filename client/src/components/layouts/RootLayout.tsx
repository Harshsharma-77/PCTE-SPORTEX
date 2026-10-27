import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';

export const RootLayout: React.FC = () => {
  const location = useLocation();
  const isBleedPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-sportex-500 selection:text-white transition-colors duration-200">
      <Header />
      <main className={`flex-1 w-full ${isBleedPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
