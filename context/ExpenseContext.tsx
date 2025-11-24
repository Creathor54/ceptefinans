
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Expense, Category, PaymentPlan, User, Subscription, AppNotification } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  capturedImage: string | null;
  setCapturedImage: (image: string | null) => void;
  budget: number;
  setBudget: (amount: number) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  paymentPlans: PaymentPlan[];
  addPaymentPlan: (plan: PaymentPlan) => void;
  removePaymentPlan: (id: string) => void;
  updatePaymentPlan: (id: string, updates: Partial<PaymentPlan>) => void;
  // Subscriptions
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  // Theme & Settings
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  statementDay: number;
  setStatementDay: (day: number) => void;
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  // Data Management
  exportData: () => void;
  importData: (file: File) => Promise<boolean>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Market', icon: 'shopping_cart', color: '#13ec80', budgetLimit: 3000 },
  { id: '2', name: 'Yiyecek & İçecek', icon: 'restaurant', color: '#f59e0b', budgetLimit: 1500 },
  { id: '3', name: 'Ulaşım', icon: 'directions_bus', color: '#3b82f6', budgetLimit: 1000 },
  { id: '4', name: 'Faturalar', icon: 'receipt_long', color: '#ef4444', budgetLimit: 2000 },
  { id: '5', name: 'Abonelikler', icon: 'play_circle', color: '#8b5cf6', budgetLimit: 500 },
  { id: '6', name: 'Sağlık', icon: 'medical_services', color: '#06b6d4', budgetLimit: 1000 },
  { id: '7', name: 'Eğlence', icon: 'movie', color: '#ec4899', budgetLimit: 1000 },
  { id: '8', name: 'Diğer', icon: 'sell', color: '#94a3b8', budgetLimit: 500 },
  { id: '9', name: 'Borçlar & Planlar', icon: 'credit_card', color: '#6366f1', budgetLimit: 5000 },
];

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Helper to get date string relative to today
  const getDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  // --- INITIALIZERS WITH LOCAL STORAGE ---

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
        const saved = localStorage.getItem('expenses');
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Failed to load expenses from local storage", e);
    }
    // Default Dummy Data
    return [
        {
          id: '1',
          merchant: 'Starbucks',
          date: getDate(0), 
          items: [{ name: 'Latte', price: 65.00, quantity: '1' }],
          total: 65.00,
          category: 'Yiyecek & İçecek',
          timestamp: Date.now(),
          currency: '₺'
        },
        {
          id: '2',
          merchant: 'Market Alışverişi',
          date: getDate(0),
          items: [],
          total: 180.50,
          category: 'Market',
          timestamp: Date.now() - 10000,
          currency: '₺'
        },
        {
            id: '3',
            merchant: 'İstanbulkart',
            date: getDate(1), 
            items: [],
            total: 15.00,
            category: 'Ulaşım',
            timestamp: Date.now() - 86400000,
            currency: '₺'
        },
        {
            id: '4',
            merchant: 'Elektrik Faturası',
            date: getDate(2),
            items: [],
            total: 450.00,
            category: 'Faturalar',
            timestamp: Date.now() - (2 * 86400000),
            currency: '₺'
        }
    ];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
      try {
        const saved = localStorage.getItem('categories');
        return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
      } catch (e) {
          return INITIAL_CATEGORIES;
      }
  });

  const [budget, setBudget] = useState<number>(() => {
      try {
        const saved = localStorage.getItem('budget');
        return saved ? parseFloat(saved) : 15000;
      } catch (e) {
          return 15000;
      }
  });
  
  const [statementDay, setStatementDay] = useState<number>(() => {
      try {
        const saved = localStorage.getItem('statementDay');
        return saved ? parseInt(saved) : 1;
      } catch (e) {
          return 1;
      }
  });

  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>(() => {
      try {
        const saved = localStorage.getItem('paymentPlans');
        if (saved) return JSON.parse(saved);
      } catch (e) {
          console.error("Failed to load payment plans", e);
      }
      return [
        {
            id: '1',
            title: 'Telefon Taksiti',
            totalAmount: 18000,
            totalInstallments: 12,
            startDate: getDate(90), 
            category: 'phone_iphone'
        },
        {
            id: '2',
            title: 'Kredi Kartı Borcu',
            totalAmount: 15000,
            totalInstallments: 12,
            startDate: getDate(180), 
            category: 'credit_card'
        }
      ];
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
      try {
        const saved = localStorage.getItem('subscriptions');
        if (saved) return JSON.parse(saved);
      } catch (e) {
          console.error("Failed to load subscriptions", e);
      }
      return [
          {
              id: 'sub1',
              platform: 'Netflix',
              amount: 199.99,
              currency: '₺',
              category: 'movie',
              firstPaymentDate: getDate(10), // Started 10 days ago
              nextPaymentDate: getDate(-20), // Due in 20 days
              billingCycle: 'monthly',
              color: '#E50914',
              isActive: true
          },
          {
              id: 'sub2',
              platform: 'Spotify',
              amount: 59.99,
              currency: '₺',
              category: 'music_note',
              firstPaymentDate: getDate(5),
              nextPaymentDate: getDate(-25),
              billingCycle: 'monthly',
              color: '#1DB954',
              isActive: true
          }
      ];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  // --- PERSISTENCE EFFECTS ---

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('budget', budget.toString());
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('paymentPlans', JSON.stringify(paymentPlans));
  }, [paymentPlans]);
  
  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);
  
  useEffect(() => {
    localStorage.setItem('statementDay', statementDay.toString());
  }, [statementDay]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
    } else {
        root.classList.add('light');
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Check auth on load
  useEffect(() => {
      const storedUser = localStorage.getItem('user_session');
      if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
      }
  }, []);

  // --- AUTOMATION & NOTIFICATIONS LOGIC ---

  useEffect(() => {
      processSubscriptions();
      generateNotifications();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, budget, paymentPlans]); 
  // We include subscriptions dependency in processSubscriptions internal logic to avoid infinite loops,
  // but generating notifications relies on latest data.

  const processSubscriptions = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    let subsUpdated = false;

    const newSubs = subscriptions.map(sub => {
        if (!sub.isActive) return sub;

        const nextDate = new Date(sub.nextPaymentDate);
        nextDate.setHours(0,0,0,0);

        if (nextDate <= today) {
            // It's due! Add expense.
            const newExpense: Expense = {
                id: uuidv4(),
                merchant: sub.platform,
                date: sub.nextPaymentDate, // Use the scheduled date
                items: [],
                total: sub.amount,
                category: 'Abonelikler',
                timestamp: Date.now(),
                currency: sub.currency
            };
            
            // Avoid adding duplicates if already processed today (basic check by date/merchant/amount)
            const exists = expenses.some(e => 
                e.merchant === sub.platform && 
                e.total === sub.amount && 
                e.date === sub.nextPaymentDate
            );

            if (!exists) {
                // We can't call setExpenses here directly in map without risk, 
                // but since we update subs which triggers effect, we need to be careful.
                // We'll queue the expense addition.
                setExpenses(prev => [...prev, newExpense]);
            }

            // Advance date
            const newNextDate = new Date(nextDate);
            if (sub.billingCycle === 'monthly') {
                newNextDate.setMonth(newNextDate.getMonth() + 1);
            } else {
                newNextDate.setFullYear(newNextDate.getFullYear() + 1);
            }
            
            // Format YYYY-MM-DD
            const y = newNextDate.getFullYear();
            const m = String(newNextDate.getMonth() + 1).padStart(2, '0');
            const d = String(newNextDate.getDate()).padStart(2, '0');
            
            subsUpdated = true;
            return { ...sub, nextPaymentDate: `${y}-${m}-${d}` };
        }
        return sub;
    });

    if (subsUpdated) {
        setSubscriptions(newSubs);
    }
  };

  const generateNotifications = () => {
    const alerts: AppNotification[] = [];
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    // 1. Check Subscriptions
    subscriptions.forEach(sub => {
        if (!sub.isActive) return;
        const due = new Date(sub.nextPaymentDate);
        if (due >= today && due <= threeDaysLater) {
            const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
            alerts.push({
                id: `sub-warn-${sub.id}-${sub.nextPaymentDate}`,
                type: 'info',
                title: 'Abonelik Ödemesi',
                message: `${sub.platform} ödemesi için ${diff === 0 ? 'bugün son gün' : diff + ' gün kaldı'}.`,
                date: new Date().toISOString(),
                read: false,
                actionLink: '/?view=subscriptions'
            });
        }
    });

    // 2. Check Payment Plans
    paymentPlans.forEach(plan => {
        // Simple logic: Calculate next payment date based on start date
        // This repeats logic from PaymentPlan component, ideally should be a shared helper.
        // For brevity, let's assume monthly from startDate.
        const start = new Date(plan.startDate);
        const nextPayment = new Date(start);
        
        // Find next future date
        while (nextPayment < today) {
            nextPayment.setMonth(nextPayment.getMonth() + 1);
        }
        
        if (nextPayment <= threeDaysLater) {
             const diff = Math.ceil((nextPayment.getTime() - today.getTime()) / (1000 * 3600 * 24));
             alerts.push({
                id: `plan-warn-${plan.id}-${nextPayment.toISOString()}`,
                type: 'warning',
                title: 'Taksit Hatırlatması',
                message: `${plan.title} taksiti yaklaşıyor (${diff === 0 ? 'Bugün' : diff + ' gün'}).`,
                date: new Date().toISOString(),
                read: false,
                actionLink: '/?view=plans'
             });
        }
    });

    // 3. Budget Check
    // Calculate current period spent (simplified for notification logic)
    const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).reduce((sum, e) => sum + e.total, 0);

    if (currentMonthExpenses > budget) {
        alerts.push({
            id: 'budget-overrun',
            type: 'alert',
            title: 'Bütçe Aşıldı',
            message: `Bu ayki bütçenizi aştınız! (Toplam: ₺${currentMonthExpenses.toLocaleString()})`,
            date: new Date().toISOString(),
            read: false,
            actionLink: '/?tab=budgets'
        });
    } else if (currentMonthExpenses > budget * 0.9) {
         alerts.push({
            id: 'budget-warning',
            type: 'warning',
            title: 'Bütçe Sınırında',
            message: `Bütçenizin %90'ına ulaştınız.`,
            date: new Date().toISOString(),
            read: false,
            actionLink: '/?tab=budgets'
        });
    }
    
    // De-duplicate based on IDs or content to avoid spam
    // In a real app we'd track 'seen' state better. Here we just replace notifications list
    // but keep 'read' status if ID matches? 
    // For MVP, simply setting them is fine, user will clear them.
    setNotifications(prev => {
        // Merge new alerts with old read states if ID matches
        const merged = alerts.map(newAlert => {
            const existing = prev.find(p => p.id === newAlert.id);
            return existing ? existing : newAlert;
        });
        return merged;
    });
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
      setNotifications([]);
  };

  // --- ACTIONS ---

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = (email: string, pass: string) => {
      if (email && pass) {
          const demoUser: User = {
              name: 'Berk',
              surname: 'Yılmaz',
              email: email,
              password: pass,
              avatar: ''
          };
          setUser(demoUser);
          setIsAuthenticated(true);
          localStorage.setItem('user_session', JSON.stringify(demoUser));
          return true;
      }
      return false;
  };

  const logout = () => {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user_session');
  };

  const updateUser = (updates: Partial<User>) => {
      setUser(prev => {
          if (!prev) return null;
          const updated = { ...prev, ...updates };
          localStorage.setItem('user_session', JSON.stringify(updated));
          return updated;
      });
  };

  const addExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory = { 
        budgetLimit: 1000, 
        ...categoryData, 
        id: uuidv4() 
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };

  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const addPaymentPlan = (plan: PaymentPlan) => {
    setPaymentPlans(prev => [...prev, plan]);
  };

  const removePaymentPlan = (id: string) => {
    setPaymentPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const updatePaymentPlan = (id: string, updates: Partial<PaymentPlan>) => {
    setPaymentPlans(prev => prev.map(plan => plan.id === id ? { ...plan, ...updates } : plan));
  };

  // Subscriptions Actions
  const addSubscription = (sub: Subscription) => {
      setSubscriptions(prev => [...prev, sub]);
  };
  const removeSubscription = (id: string) => {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
  };
  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // --- DATA BACKUP / RESTORE ---
  
  const exportData = () => {
    const data = {
        expenses,
        categories,
        paymentPlans,
        subscriptions,
        budget,
        statementDay,
        theme,
        user
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ceptefinans_yedek_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = e.target?.result as string;
                const data = JSON.parse(json);
                
                // Basic validation
                if (data.expenses && Array.isArray(data.expenses)) {
                    setExpenses(data.expenses);
                    setCategories(data.categories || INITIAL_CATEGORIES);
                    setPaymentPlans(data.paymentPlans || []);
                    setSubscriptions(data.subscriptions || []);
                    setBudget(data.budget || 15000);
                    setStatementDay(data.statementDay || 1);
                    if (data.theme) setTheme(data.theme);
                    if (data.user) {
                        setUser(data.user);
                        localStorage.setItem('user_session', JSON.stringify(data.user));
                    }
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (err) {
                console.error("Import failed", err);
                resolve(false);
            }
        };
        reader.readAsText(file);
    });
  };

  return (
    <ExpenseContext.Provider value={{ 
      expenses, 
      addExpense, 
      removeExpense, 
      capturedImage, 
      setCapturedImage, 
      budget, 
      setBudget,
      categories,
      addCategory,
      updateCategory,
      removeCategory,
      paymentPlans,
      addPaymentPlan,
      removePaymentPlan,
      updatePaymentPlan,
      subscriptions,
      addSubscription,
      removeSubscription,
      updateSubscription,
      notifications,
      markNotificationRead,
      clearNotifications,
      theme,
      toggleTheme,
      statementDay,
      setStatementDay,
      user,
      isAuthenticated,
      login,
      logout,
      updateUser,
      exportData,
      importData
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
