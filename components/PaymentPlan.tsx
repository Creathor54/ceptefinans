
import React, { useState, useMemo } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { v4 as uuidv4 } from 'uuid';
import { PaymentPlan as PaymentPlanType } from '../types';

// Helper to calculate plan status on the fly
const calculatePlanDetails = (plan: PaymentPlanType) => {
    const totalAmount = plan.totalAmount;
    const totalInstallments = plan.totalInstallments;
    const monthlyPayment = totalAmount / totalInstallments;
    
    const startDate = new Date(plan.startDate);
    const today = new Date();
    
    // Calculate months passed
    let monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
    
    let currentInstallment = monthsDiff + 1;
    
    // Adjust if today is before start date
    if (today < startDate) currentInstallment = 0;

    // Cap at total installments
    const isCompleted = currentInstallment > totalInstallments;
    if (isCompleted) currentInstallment = totalInstallments;
    
    const remainingAmount = Math.max(0, totalAmount - (currentInstallment * monthlyPayment));
    
    // Calculate Next Payment Date
    let nextPaymentDate = new Date(startDate);
    if (!isCompleted) {
        let targetDate = new Date(startDate);
        targetDate.setMonth(startDate.getMonth() + (monthsDiff)); // This month candidate
        
        if (targetDate < today) {
             targetDate.setMonth(targetDate.getMonth() + 1);
        }
        nextPaymentDate = targetDate;
    }

    const daysLeft = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    return {
        ...plan,
        monthlyPayment,
        currentInstallment,
        remainingAmount,
        status: (isCompleted ? 'completed' : 'active') as 'active' | 'completed',
        nextPaymentDate: nextPaymentDate.toISOString(),
        daysLeft: isCompleted ? 0 : daysLeft
    };
};

const PaymentPlan: React.FC = () => {
  const { paymentPlans, addPaymentPlan, removePaymentPlan, updatePaymentPlan } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [newPlan, setNewPlan] = useState({
      title: '',
      totalAmount: '',
      totalInstallments: '',
      startDate: new Date().toISOString().split('T')[0],
      category: 'credit_card'
  });

  const processedPlans = useMemo(() => {
      return paymentPlans.map(calculatePlanDetails);
  }, [paymentPlans]);

  const activePlans = processedPlans.filter(p => p.status === 'active');
  const completedPlans = processedPlans.filter(p => p.status === 'completed');
  
  const displayPlans = showCompleted ? completedPlans : activePlans;

  const totalDebt = activePlans.reduce((acc, curr) => acc + curr.remainingAmount, 0);
  const thisMonthTotal = activePlans.reduce((acc, curr) => acc + curr.monthlyPayment, 0);

  // Find closest upcoming payment
  const upcoming = [...activePlans].sort((a, b) => a.daysLeft - b.daysLeft)[0];

  const handleSavePlan = () => {
      if (!newPlan.title || !newPlan.totalAmount || !newPlan.totalInstallments) return;

      const planData = {
          title: newPlan.title,
          totalAmount: parseFloat(newPlan.totalAmount),
          totalInstallments: parseInt(newPlan.totalInstallments),
          startDate: newPlan.startDate,
          category: newPlan.category
      };

      if (editingId) {
          updatePaymentPlan(editingId, planData);
      } else {
          addPaymentPlan({
              id: uuidv4(),
              ...planData
          });
      }
      setIsModalOpen(false);
      resetForm();
  };

  const resetForm = () => {
      setNewPlan({
        title: '',
        totalAmount: '',
        totalInstallments: '',
        startDate: new Date().toISOString().split('T')[0],
        category: 'credit_card'
      });
      setEditingId(null);
  };

  const openAddModal = () => {
      resetForm();
      setIsModalOpen(true);
  };

  const openEditModal = (plan: PaymentPlanType) => {
      setNewPlan({
          title: plan.title,
          totalAmount: plan.totalAmount.toString(),
          totalInstallments: plan.totalInstallments.toString(),
          startDate: plan.startDate,
          category: plan.category
      });
      setEditingId(plan.id);
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if (window.confirm("Bu ödeme planını silmek istediğinize emin misiniz?")) {
          removePaymentPlan(id);
      }
  };

  return (
    <div className="flex flex-col gap-6 px-4 pb-20 pt-2 animate-in slide-in-from-right-4 fade-in duration-300">
        
        {/* Summary Card */}
        <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Toplam Kalan Borç</p>
                <h1 className="text-4xl font-black text-[#1e3a8a] dark:text-blue-400 mb-6">
                    ₺{totalDebt.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </h1>
                
                <div className="flex justify-between items-end border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Bu Ay Ödenecek</span>
                        <span className="font-bold text-xl text-gray-900 dark:text-white">₺{thisMonthTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase">Sonraki Ödeme</span>
                        <span className="font-bold text-orange-500 text-right">
                            {upcoming 
                                ? `${new Date(upcoming.nextPaymentDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short'})} (${upcoming.daysLeft} gün)` 
                                : '-'}
                        </span>
                    </div>
                </div>
            </div>
            {/* Decorative BG */}
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[140px] text-blue-50 dark:text-blue-900/10 z-0">event_note</span>
        </div>

        {/* Filter / Toggle */}
        <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Planlarım</h3>
            <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                <button 
                    onClick={() => setShowCompleted(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!showCompleted ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-gray-500'}`}
                >
                    Aktif
                </button>
                <button 
                    onClick={() => setShowCompleted(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${showCompleted ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-gray-500'}`}
                >
                    Biten
                </button>
            </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
            {displayPlans.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="size-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-500">
                        <span className="material-symbols-outlined text-4xl">history_edu</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Henüz Plan Yok</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-6">
                        Taksitli alışverişlerini, kredilerini veya borçlarını ekleyerek ödemelerini takip et.
                    </p>
                    <button 
                        onClick={openAddModal}
                        className="px-6 py-2.5 bg-white dark:bg-zinc-700 rounded-xl text-primary font-bold shadow-sm hover:shadow transition"
                    >
                        Yeni Plan Ekle
                    </button>
                </div>
            )}

            {displayPlans.map(plan => {
                const progressPercent = (plan.currentInstallment / plan.totalInstallments) * 100;
                
                return (
                    <div key={plan.id} className="bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 flex flex-col gap-4 relative group">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-gray-50 dark:bg-zinc-700/50 flex items-center justify-center text-gray-600 dark:text-gray-300">
                                    <span className="material-symbols-outlined text-2xl">{plan.category}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{plan.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        ₺{plan.monthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ay
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${plan.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                    {plan.status === 'completed' ? 'Bitti' : `${plan.currentInstallment}/${plan.totalInstallments}`}
                                </span>
                                
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openEditModal(plan)}
                                        className="size-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(plan.id)}
                                        className="size-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-700 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-gray-400 font-medium">
                                <span>İlerleme</span>
                                <span>% {Math.round(progressPercent)}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${plan.status === 'completed' ? 'bg-green-500' : 'bg-[#1e3a8a] dark:bg-blue-500'}`}
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>

                         {/* Info Footer */}
                         {!showCompleted && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-zinc-900/50 p-2 rounded-lg">
                                <span className="material-symbols-outlined text-sm">calendar_clock</span>
                                <span>Sonraki: <span className="font-bold text-gray-700 dark:text-gray-200">{new Date(plan.nextPaymentDate).toLocaleDateString('tr-TR')}</span></span>
                            </div>
                         )}
                    </div>
                )
            })}
        </div>

        {/* Floating Add Button specific for this view */}
        <button 
             onClick={openAddModal}
             className="fixed bottom-24 right-6 size-14 bg-primary hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 z-30"
        >
            <span className="material-symbols-outlined text-2xl">add</span>
        </button>

        {/* Add/Edit Plan Modal */}
        {isModalOpen && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        {editingId ? 'Planı Düzenle' : 'Yeni Ödeme Planı'}
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500">Plan Adı</label>
                            <input 
                                type="text" 
                                value={newPlan.title}
                                onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Örn: Telefon Taksiti"
                            />
                        </div>
                        <div className="flex gap-3">
                             <div className="flex flex-col gap-1 flex-1">
                                <label className="text-xs font-bold text-gray-500">Toplam Tutar</label>
                                <input 
                                    type="number" 
                                    value={newPlan.totalAmount}
                                    onChange={e => setNewPlan({...newPlan, totalAmount: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex flex-col gap-1 flex-1">
                                <label className="text-xs font-bold text-gray-500">Taksit Sayısı</label>
                                <input 
                                    type="number" 
                                    value={newPlan.totalInstallments}
                                    onChange={e => setNewPlan({...newPlan, totalInstallments: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="12"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500">Başlangıç Tarihi</label>
                            <input 
                                type="date" 
                                value={newPlan.startDate}
                                onChange={e => setNewPlan({...newPlan, startDate: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                         <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500">İkon</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {['credit_card', 'phone_iphone', 'chair', 'directions_car', 'checkroom', 'laptop_mac', 'school', 'home', 'fitness_center', 'flight'].map(icon => (
                                    <button
                                        key={icon}
                                        onClick={() => setNewPlan({...newPlan, category: icon})}
                                        className={`size-10 shrink-0 rounded-lg flex items-center justify-center transition-all ${newPlan.category === icon ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}
                                    >
                                        <span className="material-symbols-outlined">{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                        >
                            İptal
                        </button>
                        <button 
                            onClick={handleSavePlan}
                            disabled={!newPlan.title || !newPlan.totalAmount}
                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {editingId ? 'Kaydet' : 'Ekle'}
                        </button>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};

export default PaymentPlan;
