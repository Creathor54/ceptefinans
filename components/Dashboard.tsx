
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import BottomNavbar from './BottomNavbar';
import VoiceExpenseModal from './VoiceExpenseModal';
import PaymentPlan from './PaymentPlan'; // Import the component
import Subscriptions from './Subscriptions'; // Import the component
import { Expense } from '../types';

// Helper Component for Swipe functionality
const SwipeableListItem: React.FC<{
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, onDelete, className, disabled }) => {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || startX.current === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    
    if (Math.abs(diff) > 5) {
        isDragging.current = true;
    }
    
    // Only allow swipe left (negative diff)
    if (diff < 0) {
       // Limit swipe distance
       setOffsetX(Math.max(diff, -80)); 
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;
    if (offsetX < -40) {
      setOffsetX(-80); // Snap open and stay
    } else {
      setOffsetX(0); // Snap close
    }
    startX.current = null;
    // Reset dragging after a short delay to allow onClick to check it
    setTimeout(() => { isDragging.current = false; }, 100);
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || startX.current === null) return;
    
    const currentX = e.clientX;
    const diff = currentX - startX.current;

    if (Math.abs(diff) > 5) {
        isDragging.current = true;
        // Prevent default only if we are actually dragging to avoid blocking clicks
        e.preventDefault();
    }

    // Only allow swipe left
    if (diff < 0) {
      setOffsetX(Math.max(diff, -80));
    }
  };

  const handleMouseUp = () => {
    if (disabled || startX.current === null) return;
    
    if (offsetX < -40) {
      setOffsetX(-80);
    } else {
      setOffsetX(0);
    }
    startX.current = null;
    setTimeout(() => { isDragging.current = false; }, 100);
  };

  const handleMouseLeave = () => {
    if (startX.current !== null) {
        handleMouseUp();
    }
  };
  
  // Close if clicked outside the action (on the item body)
  const handleClick = (e: React.MouseEvent) => {
      if (disabled) return;
      // If we were dragging, do not interpret as a click to close
      if (isDragging.current) {
          e.stopPropagation();
          return;
      }
      // If it's open and we click it (without dragging), close it
      if (offsetX !== 0) {
          setOffsetX(0);
      }
  }

  return (
    <div className={`relative group/swipe overflow-hidden rounded-2xl ${className}`}>
        {/* Delete Action Background */}
        {!disabled && (
            <div className="absolute inset-0 flex justify-end bg-red-500 rounded-2xl z-0">
                <button 
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Immediate delete without confirmation
                        onDelete();
                        setOffsetX(0);
                    }}
                    className="w-20 h-full flex items-center justify-center text-white active:bg-red-600 transition-colors cursor-pointer"
                >
                    <span className="material-symbols-outlined text-2xl">delete</span>
                </button>
            </div>
        )}
        
        {/* Swipeable Foreground */}
        <div 
            className="relative bg-white dark:bg-zinc-800 touch-pan-y will-change-transform z-10 h-full cursor-grab active:cursor-grabbing select-none"
            style={{ 
                transform: `translateX(${offsetX}px)`, 
                transition: startX.current ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)' 
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        >
            {children}
        </div>
    </div>
  )
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
      expenses, removeExpense, budget, setBudget, categories, theme, toggleTheme, 
      paymentPlans, statementDay, setStatementDay, user, logout, exportData, importData,
      notifications
  } = useExpenses();

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [homeViewMode, setHomeViewMode] = useState<'expenses' | 'plans' | 'subscriptions'>('expenses');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'date' | 'category' | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');

  // Report Period State
  const [reportPeriod, setReportPeriod] = useState<'Haftalık' | 'Aylık' | 'Yıllık'>('Aylık');

  // Budget Edit State
  const [isBudgetEditOpen, setIsBudgetEditOpen] = useState(false);
  const [budgetToAdd, setBudgetToAdd] = useState('');
  
  // Backup State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Query Parameters for Navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const view = searchParams.get('view');
    const tab = searchParams.get('tab');

    if (view === 'plans') {
        setActiveTab('home');
        setHomeViewMode('plans');
    } else if (view === 'subscriptions') {
        setActiveTab('home');
        setHomeViewMode('subscriptions');
    }

    if (tab === 'budgets') {
        setActiveTab('budgets');
    }
  }, [location.search]);

  const openBudgetEdit = () => {
    setBudgetToAdd('');
    setIsBudgetEditOpen(true);
  };

  const handleSaveBudget = () => {
    const val = parseFloat(budgetToAdd);
    if (!isNaN(val) && val > 0) {
        // Add to existing budget instead of replacing
        setBudget(budget + val);
    }
    setIsBudgetEditOpen(false);
  };

  const handleLogout = () => {
      logout();
      // Since routes are removed, we just force reload or clear user
      window.location.reload();
  };
  
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (window.confirm("Mevcut verilerinizin üzerine yedek dosyasındaki veriler yazılacak. Devam etmek istiyor musunuz?")) {
              const success = await importData(file);
              if (success) {
                  alert("Veriler başarıyla geri yüklendi!");
              } else {
                  alert("Hata: Geçersiz yedek dosyası.");
              }
          }
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper: Calculate Current Billing Period based on statementDay
  const currentPeriod = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let start = new Date(currentYear, currentMonth, statementDay);
    let end = new Date(currentYear, currentMonth + 1, statementDay - 1);

    // If today is before statement day, we are in the period that started last month
    if (currentDay < statementDay) {
        start = new Date(currentYear, currentMonth - 1, statementDay);
        end = new Date(currentYear, currentMonth, statementDay - 1);
    }

    // Set times
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }, [statementDay]);

  const formatDateShort = (date: Date) => {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  // Helper to find category object details
  const getCategoryDetails = (catName: string) => {
      // 1. Try Global Categories
      const cat = categories.find(c => c.name === catName);
      if (cat) return cat;

      // 2. Try Payment Plans (Match Title for correct Icon)
      const plan = paymentPlans.find(p => p.title === catName);
      if (plan) {
          return {
              id: plan.id,
              name: plan.title,
              icon: plan.category, // plan.category stores the icon string
              color: '#6366f1', // Indigo for plans to differentiate
              budgetLimit: 0
          };
      }

      // 3. Fallback
      return { id: 'unknown', name: catName, icon: 'sell', color: '#64748b' };
  };

  // --- Installment Logic ---
  const installmentExpenses = useMemo(() => {
    const virtualExpenses: Expense[] = [];
    const cutoffDate = currentPeriod.end;

    paymentPlans.forEach(plan => {
        const [y, m, d] = plan.startDate.split('-').map(Number);
        const startDate = new Date(y, m - 1, d);
        const monthlyPayment = plan.totalAmount / plan.totalInstallments;

        for (let i = 0; i < plan.totalInstallments; i++) {
            const pDate = new Date(startDate);
            pDate.setMonth(startDate.getMonth() + i);
            if (pDate.getDate() !== startDate.getDate()) {
                 pDate.setDate(0); 
            }
            pDate.setHours(0,0,0,0);
            const cutoff = new Date(cutoffDate);
            cutoff.setHours(23,59,59,999);

            if (pDate <= cutoff) {
                const year = pDate.getFullYear();
                const month = String(pDate.getMonth() + 1).padStart(2, '0');
                const day = String(pDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;

                virtualExpenses.push({
                    id: `plan-${plan.id}-inst-${i+1}`,
                    merchant: `${plan.title} (Taksit ${i+1}/${plan.totalInstallments})`,
                    date: dateStr,
                    items: [],
                    total: monthlyPayment,
                    category: plan.title,
                    timestamp: pDate.getTime(),
                    currency: '₺'
                });
            }
        }
    });
    return virtualExpenses;
  }, [paymentPlans, currentPeriod.end]);

  const allExpenses = useMemo(() => {
      return [...expenses, ...installmentExpenses].sort((a, b) => b.timestamp - a.timestamp);
  }, [expenses, installmentExpenses]);

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(expense => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        expense.merchant.toLowerCase().includes(searchLower) || 
        expense.category.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      if (filterCategory) {
          if (expense.category !== filterCategory) return false;
      }

      if (filterDateStart && expense.date < filterDateStart) return false;
      if (filterDateEnd && expense.date > filterDateEnd) return false;

      return true;
    });
  }, [allExpenses, searchTerm, filterCategory, filterDateStart, filterDateEnd]);

  const currentPeriodStats = useMemo(() => {
    const periodExpenses = allExpenses.filter(e => {
        const d = new Date(e.date);
        return d >= currentPeriod.start && d <= currentPeriod.end;
    });
    const total = periodExpenses.reduce((sum, e) => sum + e.total, 0);
    return { total, expenses: periodExpenses };
  }, [allExpenses, currentPeriod]);

  const currentPeriodTotal = currentPeriodStats.total;
  const currentBalance = budget - currentPeriodTotal;
  
  const budgetStats = useMemo(() => {
    const periodExps = currentPeriodStats.expenses;
    const stats = categories.map(cat => {
      const spent = periodExps
        .filter(e => e.category === cat.name || e.category === cat.icon)
        .reduce((sum, e) => sum + e.total, 0);
      return {
        ...cat,
        spent,
        limit: cat.budgetLimit || 1000
      };
    });
    
    const unmatchedExpenses = periodExps.filter(e => 
        !categories.some(c => c.name === e.category || c.icon === e.category)
    );
    const debtSpent = unmatchedExpenses.reduce((sum, e) => sum + e.total, 0);
    const debtCategoryIndex = stats.findIndex(s => s.id === '9' || s.name === 'Borçlar & Planlar');

    if (debtCategoryIndex !== -1) {
        stats[debtCategoryIndex].spent += debtSpent;
    } else if (debtSpent > 0) {
        stats.push({
            id: 'debt-virtual',
            name: 'Diğer Borçlar / Planlar',
            icon: 'credit_card',
            color: '#6366f1',
            budgetLimit: 5000,
            spent: debtSpent,
            limit: 5000
        });
    }
    return stats.sort((a, b) => b.spent - a.spent);
  }, [categories, currentPeriodStats.expenses]);

  const budgetDonutGradient = useMemo(() => {
    let currentDeg = 0;
    const allTotal = currentPeriodTotal;
    const segments = budgetStats.map((stat) => {
        const percentage = allTotal > 0 ? (stat.spent / allTotal) * 100 : 0;
        const deg = (360 * percentage) / 100;
        const segment = `${stat.color} ${currentDeg}deg ${currentDeg + deg}deg`;
        currentDeg += deg;
        return segment;
    }).join(', ');
    return segments ? `conic-gradient(${segments})` : 'conic-gradient(#e5e7eb 0deg 360deg)';
  }, [budgetStats, currentPeriodTotal]);

  const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {} as Record<string, typeof expenses>);

  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getDayLabel = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return "Bugün";
    if (dateStr === yesterday) return "Dün";
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const toggleFilter = (tab: 'date' | 'category') => {
    setActiveFilterTab(prev => prev === tab ? null : tab);
  };

  const clearFilters = () => {
    setFilterCategory('');
    setFilterDateStart('');
    setFilterDateEnd('');
    setActiveFilterTab(null);
  };

  const hasActiveFilters = filterCategory || filterDateStart || filterDateEnd;

  // --- Chart & Report Data Calculation ---
  const periodData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate = new Date(today);
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let prevStartDate = new Date(today);
    let prevEndDate = new Date(today);
    let daysCount = 30;

    if (reportPeriod === 'Haftalık') {
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0,0,0,0);
        prevStartDate.setDate(today.getDate() - 13);
        prevStartDate.setHours(0,0,0,0);
        prevEndDate.setDate(today.getDate() - 7);
        prevEndDate.setHours(23,59,59,999);
        daysCount = 7;
    } else if (reportPeriod === 'Aylık') {
        startDate = new Date(currentPeriod.start);
        endDate = new Date(currentPeriod.end);
        prevStartDate = new Date(startDate);
        prevStartDate.setMonth(prevStartDate.getMonth() - 1);
        prevEndDate = new Date(startDate);
        prevEndDate.setDate(prevStartDate.getDate() - 1); 
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    } else {
        startDate.setFullYear(today.getFullYear() - 1); 
        startDate.setDate(1); 
        startDate.setHours(0,0,0,0);
        prevStartDate.setFullYear(today.getFullYear() - 2);
    }

    const currentExpenses = allExpenses.filter(e => {
        const d = new Date(e.date);
        return d >= startDate && d <= endDate;
    });

    const prevExpenses = allExpenses.filter(e => {
        const d = new Date(e.date);
        return d >= prevStartDate && d <= prevEndDate;
    });

    const currentTotal = currentExpenses.reduce((sum, e) => sum + e.total, 0);
    const prevTotal = prevExpenses.reduce((sum, e) => sum + e.total, 0);
    
    let percentChange = 0;
    if (prevTotal > 0) {
        percentChange = ((currentTotal - prevTotal) / prevTotal) * 100;
    } else if (currentTotal > 0) {
        percentChange = 100;
    }

    const chartPoints: number[] = [];
    const chartLabels: string[] = [];

    if (reportPeriod === 'Yıllık') {
        for (let i = 0; i < 12; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (11 - i));
            const monthLabel = d.toLocaleString('tr-TR', { month: 'short' });
            chartLabels.push(monthLabel);
            const monthlySum = currentExpenses.filter(e => {
                const ed = new Date(e.date);
                return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
            }).reduce((sum, e) => sum + e.total, 0);
            chartPoints.push(monthlySum);
        }
    } else {
        for (let i = 0; i < daysCount; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const label = d.getDate().toString();
            if (reportPeriod === 'Aylık') {
                 if (i === 0 || i === 7 || i === 14 || i === 21 || i === daysCount - 1) chartLabels.push(label);
                 else chartLabels.push('');
            } else {
                 chartLabels.push(d.toLocaleDateString('tr-TR', { weekday: 'short' }));
            }
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const dailySum = currentExpenses
                .filter(e => e.date === dateStr)
                .reduce((sum, e) => sum + e.total, 0);
            chartPoints.push(dailySum);
        }
    }
    return { currentTotal, percentChange, chartPoints, chartLabels, currentExpenses };
  }, [allExpenses, reportPeriod, currentPeriod]);

  const reportCategoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    const exps = periodData.currentExpenses || [];
    exps.forEach(exp => {
        let catKey = exp.category;
        const knownCat = categories.find(c => c.name === exp.category || c.icon === exp.category);
        if (knownCat) catKey = knownCat.name;
        stats[catKey] = (stats[catKey] || 0) + exp.total;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [periodData.currentExpenses, categories]);

  const getTrendPath = (points: number[]) => {
      if (points.length === 0) return "";
      const max = Math.max(...points) || 100;
      const width = 100;
      const height = 80;
      const cords = points.map((val, i) => {
          const x = (i / (points.length - 1)) * width;
          const y = height - (val / max) * height * 0.8; 
          return {x, y};
      });
      if (cords.length === 1) return `M 0,${height} L 100,${height}`;
      let d = `M ${cords[0].x},${cords[0].y}`;
      for (let i = 0; i < cords.length - 1; i++) {
        const curr = cords[i];
        const next = cords[i+1];
        const cp1x = curr.x + (next.x - curr.x) * 0.5;
        const cp1y = curr.y;
        const cp2x = curr.x + (next.x - curr.x) * 0.5;
        const cp2y = next.y;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
      }
      return d;
  };

  const renderHomeView = () => (
    <>
        {/* Brand Logo Header */}
        {activeTab === 'home' && (
             <div className="flex flex-col items-center justify-center pt-2 pb-4 animate-in slide-in-from-top-4 fade-in duration-500">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="material-symbols-outlined text-white text-xl">account_balance_wallet</span>
                    </div>
                    <h1 className="text-2xl font-[900] tracking-tighter text-zinc-900 dark:text-white">
                        Cepte<span className="text-primary">Finans</span>
                    </h1>
                </div>
             </div>
        )}

        {(() => {
            switch(homeViewMode) {
                case 'plans': return <PaymentPlan />;
                case 'subscriptions': return <Subscriptions isEmbedded={true} />;
                case 'expenses':
                default:
                    return (
                        <>
                            {/* Search Bar */}
                            <div className="px-4 py-3">
                            <label className="flex flex-col w-full h-12">
                                <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                                <div className="text-zinc-500 dark:text-zinc-400 flex border-none bg-white dark:bg-zinc-800 items-center justify-center pl-4 rounded-l-xl border-r-0">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white dark:bg-zinc-800 h-full placeholder:text-zinc-500 dark:placeholder:text-zinc-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal transition-all" 
                                    placeholder="Mağaza veya açıklama ara..." 
                                />
                                </div>
                            </label>
                            </div>

                            {/* Filter Chips */}
                            <div className="flex gap-3 px-4 pb-4 overflow-x-auto no-scrollbar items-center">
                            <button 
                                onClick={() => toggleFilter('date')}
                                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl pl-4 pr-4 transition-colors border ${
                                    filterDateStart || filterDateEnd || activeFilterTab === 'date'
                                    ? 'bg-primary/20 border-primary/50 text-zinc-900 dark:text-white'
                                    : 'bg-white dark:bg-zinc-800 border-transparent hover:bg-gray-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-sm'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">calendar_month</span>
                                <p className="text-sm font-medium leading-normal">{filterDateStart || filterDateEnd ? 'Tarih Seçili' : 'Tarih Aralığı'}</p>
                                <span className={`material-symbols-outlined text-lg transition-transform ${activeFilterTab === 'date' ? 'rotate-180' : ''}`}>arrow_drop_down</span>
                            </button>
                            <button 
                                onClick={() => toggleFilter('category')}
                                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-xl pl-4 pr-4 transition-colors border ${
                                    filterCategory || activeFilterTab === 'category'
                                    ? 'bg-primary/20 border-primary/50 text-zinc-900 dark:text-white'
                                    : 'bg-white dark:bg-zinc-800 border-transparent hover:bg-gray-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-sm'
                                }`}
                            >
                                <span className="material-symbols-outlined text-lg">sell</span>
                                <p className="text-sm font-medium leading-normal">{filterCategory || 'Kategori'}</p>
                                <span className={`material-symbols-outlined text-lg transition-transform ${activeFilterTab === 'category' ? 'rotate-180' : ''}`}>arrow_drop_down</span>
                            </button>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            )}
                            </div>

                            {/* Filter Selection Areas */}
                            {activeFilterTab === 'date' && (
                                <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Başlangıç</label>
                                                <input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm dark:text-white focus:ring-primary focus:border-primary" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Bitiş</label>
                                                <input type="date" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm dark:text-white focus:ring-primary focus:border-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeFilterTab === 'category' && (
                                <div className="px-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                        <button onClick={() => setFilterCategory('')} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${filterCategory === '' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>Tümü</button>
                                        {categories.map(cat => (
                                            <button key={cat.id} onClick={() => setFilterCategory(cat.name)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${filterCategory === cat.name ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                                <span className="material-symbols-outlined text-lg">{cat.icon}</span>{cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Summary Card */}
                            <div className="px-4 py-2">
                                <div onClick={() => setActiveTab('budgets')} className="flex flex-col rounded-3xl shadow-md bg-white dark:bg-zinc-800 dark:border dark:border-white/5 p-6 relative overflow-hidden transition-all group cursor-pointer hover:shadow-lg hover:scale-[1.01]">
                                    <div className="absolute -right-4 -top-4 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                                        <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
                                    </div>
                                    <div className="absolute top-4 right-4 text-gray-400 group-hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">chevron_right</span>
                                    </div>
                                    <div className="relative z-10 mb-6">
                                        <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wide mb-1">Kalan Bakiye</p>
                                        <p className={`text-4xl font-extrabold leading-none tracking-tight ${currentBalance < 0 ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
                                            ₺{currentBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">Dönem: {formatDateShort(currentPeriod.start)} - {formatDateShort(currentPeriod.end)}</p>
                                    </div>
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="flex-1 bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-gray-100 dark:border-white/5 relative group/budget">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-lg text-green-500">arrow_circle_up</span>
                                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Bütçe</span>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); openBudgetEdit(); }} className="opacity-0 group-hover/budget:opacity-100 transition-opacity text-primary hover:text-primary/80"><span className="material-symbols-outlined text-sm font-bold">add</span></button>
                                            </div>
                                            <p className="text-lg font-bold text-green-600 dark:text-green-400">+₺{budget.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div className="flex-1 bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-gray-100 dark:border-white/5">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="material-symbols-outlined text-lg text-red-500">arrow_circle_down</span>
                                                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Harcama</span>
                                            </div>
                                            <p className="text-lg font-bold text-red-600 dark:text-red-400">-₺{currentPeriodTotal.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction List */}
                            <div className="flex flex-col px-4 pb-4">
                                {sortedDates.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in-95">
                                        <div className="size-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                            <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600">receipt_long</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Henüz Harcama Yok</h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-8">İlk harcamanı ekleyerek bütçeni yönetmeye başla.</p>
                                        <button onClick={() => navigate('/manual')} className="px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition transform active:scale-95">İlk Harcamanı Ekle</button>
                                    </div>
                                ) : (
                                    sortedDates.map(date => (
                                    <div key={date}>
                                        <h3 className="text-zinc-900 dark:text-zinc-100 text-lg font-bold leading-tight tracking-[-0.015em] pt-6 pb-3 sticky top-[60px] z-0">{getDayLabel(date)}</h3>
                                        <div className="flex flex-col gap-3">
                                            {groupedExpenses[date].map(expense => {
                                                const isVirtual = expense.id.startsWith('plan-');
                                                const catDetails = getCategoryDetails(expense.category);
                                                const isFuture = new Date(expense.date) > new Date();
                                                return (
                                                    <SwipeableListItem key={expense.id} onDelete={() => !isVirtual && removeExpense(expense.id)} className={`shadow-sm ${isVirtual ? 'border-l-4 border-indigo-500' : ''} ${isFuture ? 'opacity-70 bg-gray-50 dark:bg-zinc-800/50' : ''}`} disabled={isVirtual}>
                                                        <div className="flex items-center gap-4 p-3 min-h-[72px] justify-between border border-transparent hover:border-primary/20 dark:hover:border-primary/20 transition-all cursor-pointer">
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-zinc-900 dark:text-zinc-100 flex items-center justify-center rounded-xl shrink-0 size-12" style={{ backgroundColor: `${catDetails.color}20`, color: catDetails.color }}>
                                                                    <span className="material-symbols-outlined text-2xl">{catDetails.icon}</span>
                                                                </div>
                                                                <div className="flex flex-col justify-center">
                                                                    <p className="text-zinc-900 dark:text-zinc-100 text-base font-semibold leading-normal line-clamp-1">{expense.merchant}</p>
                                                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal leading-normal line-clamp-2">{expense.category} {isFuture && <span className="text-xs text-orange-500 ml-2 font-bold">(Bekleyen)</span>}</p>
                                                                </div>
                                                            </div>
                                                            <div className="shrink-0 flex flex-col items-end">
                                                                <p className="text-red-600 dark:text-red-400 text-base font-bold leading-normal">-₺{expense.total.toFixed(2)}</p>
                                                                {isVirtual && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded">Plan</span>}
                                                            </div>
                                                        </div>
                                                    </SwipeableListItem>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )))}
                            </div>
                        </>
                    );
            }
        })()}
    </>
  );

  const renderBudgetsView = () => {
    const allTotal = currentPeriodTotal;
    const remainingTotal = Math.max(0, budget - allTotal);
    const getProgressColor = (spent: number, limit: number) => {
        const percentage = (spent / limit) * 100;
        if (percentage >= 100) return '#ef4444'; 
        if (percentage >= 80) return '#f59e0b'; 
        return '#3B82F6'; 
    };
    const getStatusText = (spent: number, limit: number) => {
        const percentage = (spent / limit) * 100;
        const remaining = limit - spent;
        if (percentage >= 100) return <span className="text-red-500 font-bold">Bütçe Aşıldı</span>;
        if (percentage >= 80) return <span className="text-orange-500 font-bold">Aşım Riski</span>;
        return <span className="text-gray-500 dark:text-gray-400">Kalan: ₺{remaining.toFixed(0)}</span>;
    };

    return (
        <div className="px-4 pb-20 pt-2 animate-in slide-in-from-right-4 fade-in duration-300 flex flex-col gap-6">
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bu Ayki Toplam Bütçe Durumu</p>
                    <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-500">{formatDateShort(currentPeriod.start)} - {formatDateShort(currentPeriod.end)}</span>
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-1">₺{remainingTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4">Toplam Kalan</p>
                <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex flex-col group/editbudget">
                        <div className="flex items-center gap-2">
                             <span className="text-gray-400">Toplam Bütçe</span>
                             <button onClick={(e) => { e.stopPropagation(); openBudgetEdit(); }} className="text-primary hover:text-primary/80 transition p-1 rounded-full hover:bg-primary/10"><span className="material-symbols-outlined text-sm font-bold">add</span></button>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">₺{budget.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-gray-400">Harcanan</span>
                        <span className="font-bold text-gray-900 dark:text-white">₺{allTotal.toLocaleString('tr-TR')}</span>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Harcama Dağılımı</h3>
                <div className="flex items-center justify-center">
                    <div className="relative size-60 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full" style={{ background: budgetDonutGradient }}></div>
                        <div className="absolute inset-4 rounded-full bg-white dark:bg-zinc-800 flex flex-col items-center justify-center shadow-lg">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">₺{allTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                            <span className="text-gray-500 text-sm">Toplam Harcama</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {budgetStats.map(cat => (
                    <div key={cat.id} className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-zinc-700/50" style={{ color: cat.color }}>
                                    <span className="material-symbols-outlined">{cat.icon}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 dark:text-white">{cat.name}</span>
                                    <span className="text-xs text-gray-500">₺{cat.spent.toLocaleString('tr-TR')} / ₺{cat.limit.toLocaleString('tr-TR')}</span>
                                </div>
                            </div>
                            <div className="text-xs font-medium text-right">{getStatusText(cat.spent, cat.limit)}</div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (cat.spent / cat.limit) * 100)}%`, backgroundColor: getProgressColor(cat.spent, cat.limit) }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const renderReportsView = () => {
    const { currentTotal, percentChange, chartPoints, chartLabels } = periodData;
    return (
      <div className="px-4 pb-20 pt-2 animate-in slide-in-from-right-4 fade-in duration-300 flex flex-col gap-6">
          <div className="grid grid-cols-3 bg-white dark:bg-zinc-800 rounded-2xl p-1 shadow-sm border border-gray-100 dark:border-gray-700/50">
            {['Haftalık', 'Aylık', 'Yıllık'].map((period) => (
                <button key={period} onClick={() => setReportPeriod(period as any)} className={`py-2 rounded-xl text-sm font-medium transition-all ${reportPeriod === period ? 'bg-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700'}`}>{period}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col gap-1">
                  <span className="text-xs text-green-700 dark:text-green-400 font-bold">Toplam Harcama</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white">₺{currentTotal.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col gap-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">Günlük Ortalama</span>
                  <span className="text-xl font-black text-gray-900 dark:text-white">₺{(currentTotal / (reportPeriod === 'Haftalık' ? 7 : 30)).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
              </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50">
             <div className="mb-4">
                 <h3 className="text-sm font-bold text-green-700 dark:text-green-400 mb-0.5">{reportPeriod} Harcama Trendi</h3>
                 <div className="flex items-center gap-2">
                     <span className="text-3xl font-black text-gray-900 dark:text-white">₺{currentTotal.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
                     <span className={`text-xs font-bold flex items-center px-1.5 py-0.5 rounded ${percentChange > 0 ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-green-500 bg-green-50 dark:bg-green-900/20'}`}>
                         <span className="material-symbols-outlined text-sm">{percentChange > 0 ? 'arrow_upward' : 'arrow_downward'}</span> {Math.abs(percentChange).toFixed(1)}%
                     </span>
                 </div>
                 <span className="text-xs text-gray-400">Geçen döneme göre</span>
             </div>
             <div className="w-full h-40 relative">
                 <svg viewBox="0 0 100 80" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                     <defs>
                         <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                             <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2"/>
                             <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                         </linearGradient>
                     </defs>
                     <path d={getTrendPath(chartPoints)} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                 </svg>
                 <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-2">
                     {chartLabels.map((label, idx) => <span key={idx} className="w-full text-center">{label}</span>)}
                 </div>
             </div>
          </div>
          <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">En Çok Harcanan Kategoriler</h3>
              <div className="flex flex-col gap-3">
                  {reportCategoryStats.length === 0 ? (
                      <div className="text-center text-gray-500 py-4 text-sm">Bu dönemde harcama bulunamadı.</div>
                  ) : (
                    reportCategoryStats.map(([catName, amount]) => {
                      const catDetails = getCategoryDetails(catName);
                      const percentage = currentTotal > 0 ? (amount / currentTotal) * 100 : 0;
                      return (
                          <div key={catName} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${catDetails.color}20`, color: catDetails.color }}>
                                     <span className="material-symbols-outlined">{catDetails.icon}</span>
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="font-bold text-gray-900 dark:text-white">{catName}</span>
                                 </div>
                             </div>
                             <div className="flex flex-col items-end">
                                 <span className="font-bold text-gray-900 dark:text-white">₺{amount.toLocaleString('tr-TR')}</span>
                                 <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                             </div>
                          </div>
                      )
                    })
                  )}
              </div>
          </div>
      </div>
    );
  };

  const renderSettingsView = () => (
      <div className="px-4 pb-20 pt-2 animate-in slide-in-from-right-4 fade-in duration-300 flex flex-col gap-6">
           <div className="flex flex-col items-center gap-3 py-4">
              <div className="size-24 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center shadow-sm border-4 border-white dark:border-zinc-800">
                  <span className="material-symbols-outlined text-4xl text-primary">person</span>
              </div>
              <div className="text-center">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{user ? `${user.name} ${user.surname}` : 'Misafir Kullanıcı'}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{user ? user.email : 'Yerel Hesap'}</p>
              </div>
           </div>
           <div className="flex flex-col gap-2">
               <h3 className="text-sm font-bold text-zinc-900 dark:text-white ml-1">Profil</h3>
               <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                   <button onClick={() => navigate('/edit-profile')} className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                       <div className="flex items-center gap-3">
                           <div className="size-10 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"><span className="material-symbols-outlined text-xl">person</span></div>
                           <span className="font-medium text-zinc-900 dark:text-white">Profili Düzenle</span>
                       </div>
                       <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                   </button>
                   <button onClick={() => navigate('/change-password')} className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                       <div className="flex items-center gap-3">
                           <div className="size-10 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"><span className="material-symbols-outlined text-xl">lock</span></div>
                           <span className="font-medium text-zinc-900 dark:text-white">Şifre Değiştir</span>
                       </div>
                       <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                   </button>
               </div>
           </div>
           <div className="flex flex-col gap-2">
               <h3 className="text-sm font-bold text-zinc-900 dark:text-white ml-1">Uygulama Ayarları</h3>
               <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                   <div className="flex w-full items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/50">
                       <div className="flex items-center gap-3">
                           <div className="size-10 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"><span className="material-symbols-outlined text-xl">calendar_month</span></div>
                           <div className="flex flex-col items-start">
                                <span className="font-medium text-zinc-900 dark:text-white">Hesap Kesim Tarihi</span>
                                <span className="text-[10px] text-gray-500">Her ayın {statementDay}. günü</span>
                           </div>
                       </div>
                       <select value={statementDay} onChange={(e) => setStatementDay(parseInt(e.target.value))} className="bg-transparent border-none text-right font-bold text-primary focus:ring-0 cursor-pointer">
                            {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                       </select>
                   </div>
                   <button onClick={() => navigate('/categories')} className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition border-b border-gray-100 dark:border-gray-700/50">
                       <div className="flex items-center gap-3">
                           <div className="size-10 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"><span className="material-symbols-outlined text-xl">category</span></div>
                           <span className="font-medium text-zinc-900 dark:text-white">Kategorileri Yönet</span>
                       </div>
                       <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                   </button>
                   <div onClick={() => navigate('/notifications')} className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition border-b border-gray-100 dark:border-gray-700/50 cursor-pointer">
                       <div className="flex items-center gap-3">
                           <div className="size-10 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"><span className="material-symbols-outlined text-xl">notifications</span></div>
                           <span className="font-medium text-zinc-900 dark:text-white">Bildirimler</span>
                       </div>
                       <div className="flex items-center gap-2">
                           {notifications.filter(n => !n.read).length > 0 && <span className="size-3 bg-red-500 rounded-full animate-pulse"></span>}
                           <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                       </div>
                   </div>
                   <button onClick={toggleTheme} className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition border-b border-gray-100 dark:border-gray-700/50">
                       <div className="flex items-center gap-3">
                           <div className="size-10 rounded-lg bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-900 dark:text-white"><span className="material-symbols-outlined text-xl">dark_mode</span></div>
                           <span className="font-medium text-zinc-900 dark:text-white">Görünüm</span>
                       </div>
                       <div className="flex items-center gap-2 text-gray-500">
                           <span>{theme === 'dark' ? 'Koyu' : 'Açık'}</span>
                           <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                       </div>
                   </button>
               </div>
           </div>
           <div className="flex flex-col gap-2">
               <h3 className="text-sm font-bold text-zinc-900 dark:text-white ml-1">Veri Yedekleme</h3>
               <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                   <button onClick={exportData} className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition border-b border-gray-100 dark:border-gray-700/50">
                       <div className="flex items-center gap-3">
                           <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400"><span className="material-symbols-outlined text-xl">download</span></div>
                           <div className="flex flex-col items-start">
                               <span className="font-medium text-zinc-900 dark:text-white">Verileri Yedekle</span>
                               <span className="text-[10px] text-gray-500">Cihazına indir</span>
                           </div>
                       </div>
                       <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                   </button>
                   <button onClick={handleImportClick} className="flex w-full items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
                       <div className="flex items-center gap-3">
                           <div className="size-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400"><span className="material-symbols-outlined text-xl">upload</span></div>
                           <div className="flex flex-col items-start">
                               <span className="font-medium text-zinc-900 dark:text-white">Geri Yükle</span>
                               <span className="text-[10px] text-gray-500">Yedek dosyasından</span>
                           </div>
                       </div>
                       <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                   </button>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
               </div>
           </div>
           <div className="flex flex-col gap-2">
               <h3 className="text-sm font-bold text-zinc-900 dark:text-white ml-1">Hesap Yönetimi</h3>
               <div className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition group">
                       <div className="size-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500"><span className="material-symbols-outlined text-xl">restart_alt</span></div>
                       <span className="font-medium text-red-500">Uygulamayı Sıfırla (Yenile)</span>
                   </button>
               </div>
           </div>
      </div>
  )

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
      <div className="sticky top-0 z-30 bg-background-light dark:bg-background-dark/95 backdrop-blur-sm pt-safe border-b border-gray-200 dark:border-gray-800 transition-all">
        <div className="flex items-center bg-transparent p-4 pb-2 justify-between">
            {activeTab !== 'home' && (
                 <button onClick={() => setActiveTab('home')} className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"><span className="material-symbols-outlined text-2xl">arrow_back</span></button>
            )}
            {activeTab === 'home' ? (
                <div className="flex-1 flex justify-center">
                    <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                        <button onClick={() => setHomeViewMode('expenses')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${homeViewMode === 'expenses' ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Harcamalar</button>
                        <button onClick={() => setHomeViewMode('plans')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${homeViewMode === 'plans' ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Planlar</button>
                        <button onClick={() => setHomeViewMode('subscriptions')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${homeViewMode === 'subscriptions' ? 'bg-white dark:bg-zinc-600 shadow-sm text-black dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Abonelikler</button>
                    </div>
                </div>
            ) : (
                <h1 className="text-zinc-900 dark:text-zinc-100 text-2xl font-bold leading-tight tracking-tighter flex-1 text-center pr-10">
                    {activeTab === 'reports' ? 'Harcama Analizi' : activeTab === 'budgets' ? 'Bütçelerim' : 'Ayarlar'}
                </h1>
            )}
            {activeTab === 'home' && (
               <button onClick={() => navigate('/categories')} className="text-zinc-900 dark:text-zinc-100 flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700 transition" aria-label="Kategorileri Yönet"><span className="material-symbols-outlined text-[20px]">category</span></button>
            )}
            {activeTab === 'reports' && (
               <div className="text-zinc-900 dark:text-zinc-100 flex size-12 shrink-0 items-center justify-end"><span className="material-symbols-outlined text-3xl">more_vert</span></div>
            )}
        </div>
      </div>

      <main className="flex-grow pb-32">
        {activeTab === 'home' && renderHomeView()}
        {activeTab === 'reports' && renderReportsView()}
        {activeTab === 'budgets' && renderBudgetsView()}
        {activeTab === 'settings' && renderSettingsView()}
      </main>

      {isFabOpen && <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-md transition-opacity duration-300 animate-in fade-in" onClick={() => setIsFabOpen(false)} />}
      <div className={`fixed bottom-[calc(env(safe-area-inset-bottom)+80px)] left-1/2 -translate-x-1/2 flex flex-col gap-4 items-center z-50 pointer-events-none ${isFabOpen ? 'pointer-events-auto' : ''}`}>
         <button onClick={() => { navigate('/manual'); setIsFabOpen(false); }} className={`flex items-center gap-3 group w-48 bg-white dark:bg-zinc-800 p-2 pr-4 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 delay-75 transform ${isFabOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
             <div className="flex size-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg"><span className="material-symbols-outlined text-xl">edit</span></div>
             <span className="text-zinc-900 dark:text-zinc-100 text-sm font-bold">Elle Ekle</span>
         </button>
         <button onClick={() => { setIsVoiceModalOpen(true); setIsFabOpen(false); }} className={`flex items-center gap-3 group w-48 bg-white dark:bg-zinc-800 p-2 pr-4 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 delay-50 transform ${isFabOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
             <div className="flex size-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg"><span className="material-symbols-outlined text-xl">mic</span></div>
             <span className="text-zinc-900 dark:text-zinc-100 text-sm font-bold">Sesli Ekle</span>
         </button>
         <button onClick={() => { navigate('/scan'); setIsFabOpen(false); }} className={`flex items-center gap-3 group w-48 bg-white dark:bg-zinc-800 p-2 pr-4 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 transform ${isFabOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
             <div className="flex size-10 items-center justify-center rounded-full bg-primary text-white shadow-lg"><span className="material-symbols-outlined text-xl">photo_camera</span></div>
             <span className="text-zinc-900 dark:text-zinc-100 text-sm font-bold">Fiş Tara</span>
         </button>
      </div>

      <BottomNavbar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); window.scrollTo(0,0); }} onAddClick={() => setIsFabOpen(!isFabOpen)} isOpen={isFabOpen} />
      {isBudgetEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Ek Bütçe / Gelir Ekle</h3>
                    <p className="text-xs text-gray-500">Mevcut Bakiyeye Eklenecek Tutar</p>
                </div>
                <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">+ ₺</span>
                    <input type="number" value={budgetToAdd} onChange={e => setBudgetToAdd(e.target.value)} className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl py-4 pl-12 pr-4 text-2xl font-bold text-center text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-zinc-800 transition-all placeholder-gray-300 dark:placeholder-gray-700" autoFocus placeholder="0" />
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 mb-6 flex justify-between items-center border border-gray-100 dark:border-gray-700/50">
                    <span className="text-xs text-gray-500">Güncel Toplam Bütçe</span>
                    <span className="font-bold text-gray-900 dark:text-white">₺{budget.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsBudgetEditOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition">İptal</button>
                    <button onClick={handleSaveBudget} className="flex-1 py-3 rounded-xl bg-primary font-bold text-white hover:bg-primary/90 transition shadow-lg shadow-primary/20">Ekle</button>
                </div>
            </div>
        </div>
      )}
      <VoiceExpenseModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
