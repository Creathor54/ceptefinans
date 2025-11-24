
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';

const Budgets: React.FC = () => {
  const navigate = useNavigate();
  const { expenses, categories, budget } = useExpenses();

  // Calculate totals
  const totalExpense = expenses.reduce((sum, item) => sum + item.total, 0);
  const remainingBudget = Math.max(0, budget - totalExpense);
  
  // Calculate per category stats
  const categoryStats = useMemo(() => {
    const stats = categories.map(cat => {
      const spent = expenses
        .filter(e => e.category === cat.name)
        .reduce((sum, e) => sum + e.total, 0);
      return {
        ...cat,
        spent,
        limit: cat.budgetLimit || 1000 // Default limit if not set
      };
    });
    return stats.sort((a, b) => b.spent - a.spent);
  }, [categories, expenses]);

  // Donut Chart Data
  const donutGradient = useMemo(() => {
    let currentDeg = 0;
    const segments = categoryStats.map((stat) => {
        const percentage = totalExpense > 0 ? (stat.spent / totalExpense) * 100 : 0;
        const deg = (360 * percentage) / 100;
        const segment = `${stat.color} ${currentDeg}deg ${currentDeg + deg}deg`;
        currentDeg += deg;
        return segment;
    }).join(', ');
    return segments ? `conic-gradient(${segments})` : 'conic-gradient(#e5e7eb 0deg 360deg)';
  }, [categoryStats, totalExpense]);

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return '#ef4444'; // Red
    if (percentage >= 80) return '#f59e0b'; // Orange
    return '#13ec80'; // Green
  };

  const getStatusText = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    const remaining = limit - spent;
    
    if (percentage >= 100) return <span className="text-red-500 font-bold">Bütçe Aşıldı</span>;
    if (percentage >= 80) return <span className="text-orange-500 font-bold">Aşım Riski</span>;
    return <span className="text-gray-500 dark:text-gray-400">Kalan: ₺{remaining.toFixed(0)}</span>;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
       {/* Header */}
       <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Bütçelerim
        </h2>
        <button className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-6 pb-24">
        
        {/* Summary Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Bu Ayki Toplam Bütçe Durumu</p>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                ₺{remainingBudget.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">Toplam Kalan</p>
            
            <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex flex-col">
                    <span className="text-gray-400">Toplam Bütçe</span>
                    <span className="font-bold text-gray-900 dark:text-white">₺{budget.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-gray-400">Harcanan</span>
                    <span className="font-bold text-gray-900 dark:text-white">₺{totalExpense.toLocaleString('tr-TR')}</span>
                </div>
            </div>
        </div>

        {/* Expense Distribution Chart */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Harcama Dağılımı</h3>
            {totalExpense === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="size-20 bg-gray-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-4">
                         <span className="material-symbols-outlined text-4xl text-gray-400">pie_chart</span>
                    </div>
                    <p className="text-gray-500 font-medium">Henüz harcama verisi yok.</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Harcama ekledikçe bütçe dağılımın burada görünecek.</p>
                </div>
            ) : (
                <div className="flex items-center justify-center">
                    <div className="relative size-60 flex items-center justify-center">
                        {/* Chart Circle */}
                        <div 
                            className="absolute inset-0 rounded-full"
                            style={{ background: donutGradient }}
                        ></div>
                        {/* Inner White Circle */}
                        <div className="absolute inset-4 rounded-full bg-white dark:bg-zinc-800 flex flex-col items-center justify-center shadow-lg">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">₺{totalExpense.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                            <span className="text-gray-500 text-sm">Toplam Harcama</span>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Category Progress List */}
        <div className="flex flex-col gap-3">
            {categoryStats.map(cat => (
                <div key={cat.id} className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div 
                                className="size-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-zinc-700/50"
                                style={{ color: cat.color }}
                            >
                                <span className="material-symbols-outlined">{cat.icon}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 dark:text-white">{cat.name}</span>
                                <span className="text-xs text-gray-500">₺{cat.spent.toLocaleString('tr-TR')} / ₺{cat.limit.toLocaleString('tr-TR')}</span>
                            </div>
                        </div>
                        <div className="text-xs font-medium text-right">
                            {getStatusText(cat.spent, cat.limit)}
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                                width: `${Math.min(100, (cat.spent / cat.limit) * 100)}%`,
                                backgroundColor: getProgressColor(cat.spent, cat.limit)
                            }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

export default Budgets;
