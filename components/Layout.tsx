import React, { ReactNode } from 'react';
import { LayoutDashboard, Users, BadgeDollarSign, Menu, X, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'dashboard' | 'students' | 'fees';
  onTabChange: (tab: 'dashboard' | 'students' | 'fees') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const NavItem = ({ id, icon: Icon, label }: { id: 'dashboard' | 'students' | 'fees', icon: any, label: string }) => (
    <button
      onClick={() => {
        onTabChange(id);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center w-full px-6 py-4 transition-all duration-200 ${
        activeTab === id
          ? 'bg-indigo-600 text-white border-r-4 border-indigo-400 shadow-lg'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${activeTab === id ? 'text-white' : 'text-slate-500'}`} />
      <span className="font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">ScholarFlow</h1>
              <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">Pro Edition</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="students" icon={Users} label="Students" />
          <NavItem id="fees" icon={BadgeDollarSign} label="Fees & Payments" />
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
            </div>
            <span className="text-sm text-slate-300 font-medium">Offline Mode Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-slate-200 lg:hidden sticky top-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800 capitalize tracking-tight">{activeTab}</span>
          <div className="w-6"></div> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;