import React from 'react';
import { Home, Dumbbell, Utensils, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col h-screen bg-dark text-white max-w-md mx-auto relative shadow-2xl border-x border-slate-800">
      <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide">
        {children}
      </main>

      <nav className="absolute bottom-0 w-full bg-card/90 backdrop-blur-md border-t border-slate-700 pb-safe">
        <div className="flex justify-around items-center p-3">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-slate-400'}`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">主页</span>
          </button>
          
          <button
            onClick={() => onTabChange('workout')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'workout' ? 'text-primary' : 'text-slate-400'}`}
          >
            <Dumbbell size={24} />
            <span className="text-xs font-medium">训练</span>
          </button>

          <button
            onClick={() => onTabChange('diet')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'diet' ? 'text-primary' : 'text-slate-400'}`}
          >
            <Utensils size={24} />
            <span className="text-xs font-medium">饮食</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-primary' : 'text-slate-400'}`}
          >
            <User size={24} />
            <span className="text-xs font-medium">我的</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;