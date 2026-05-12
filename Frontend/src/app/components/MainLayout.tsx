import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';

interface MainLayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onThemeToggle: () => void;
  isDark: boolean;
}

export function MainLayout({
  children,
  currentPath,
  onNavigate,
  onThemeToggle,
  isDark,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onThemeToggle={onThemeToggle} isDark={isDark} />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav currentPath={currentPath} onNavigate={onNavigate} />
    </div>
  );
}
