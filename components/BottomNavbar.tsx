
import React from 'react';

interface BottomNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  isOpen: boolean;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab, onTabChange, onAddClick, isOpen }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-gray-800 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 px-2 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mx-auto h-14 relative">
        
        {/* Left Group */}
        <div className="flex items-center justify-around flex-1 pr-8">
            {/* Home Tab */}
            <button 
              onClick={() => onTabChange('home')}
              className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${
                activeTab === 'home' 
                  ? 'text-primary' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${activeTab === 'home' ? 'fill-1' : ''}`}>home</span>
              <span className="text-[10px] font-medium">Ana Sayfa</span>
            </button>

            {/* Budgets Tab */}
            <button 
              onClick={() => onTabChange('budgets')}
              className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${
                activeTab === 'budgets' 
                  ? 'text-primary' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${activeTab === 'budgets' ? 'fill-1' : ''}`}>account_balance_wallet</span>
              <span className="text-[10px] font-medium">Bütçeler</span>
            </button>
        </div>

        {/* Central Add Button Space */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-8">
            <button
                onClick={onAddClick}
                className={`flex items-center justify-center w-16 h-16 rounded-full text-black shadow-lg shadow-primary/40 transition-all duration-300 border-4 border-gray-50 dark:border-zinc-900 ${
                    isOpen ? 'bg-red-500 text-white rotate-45' : 'bg-primary hover:scale-105 active:scale-95'
                }`}
            >
                <span className="material-symbols-outlined text-3xl transition-transform duration-300">add</span>
            </button>
        </div>

        {/* Right Group */}
        <div className="flex items-center justify-around flex-1 pl-8">
            {/* Reports Tab */}
            <button 
              onClick={() => onTabChange('reports')}
              className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${
                activeTab === 'reports' 
                  ? 'text-primary' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${activeTab === 'reports' ? 'fill-1' : ''}`}>donut_small</span>
              <span className="text-[10px] font-medium">Raporlar</span>
            </button>

            {/* Settings Tab */}
            <button 
              onClick={() => onTabChange('settings')}
              className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${
                activeTab === 'settings' 
                  ? 'text-primary' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl ${activeTab === 'settings' ? 'fill-1' : ''}`}>settings</span>
              <span className="text-[10px] font-medium">Ayarlar</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default BottomNavbar;
