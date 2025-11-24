import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { v4 as uuidv4 } from 'uuid';

const ManualEntry: React.FC = () => {
  const navigate = useNavigate();
  const { addExpense, categories } = useExpenses();

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!amount || !merchant || !category) {
        // Simple validation visualization
        if (!amount) alert("Lütfen tutar giriniz.");
        else if (!merchant) alert("Lütfen mağaza adı giriniz.");
        else if (!category) alert("Lütfen kategori seçiniz.");
        return;
    }

    addExpense({
      id: uuidv4(),
      merchant,
      date,
      items: [],
      total: parseFloat(amount),
      category,
      timestamp: Date.now(),
      currency: '₺'
    });
    navigate('/');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden font-display">
      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Harcama Ekle
        </h2>
        <div className="size-10"></div>
      </div>

      {/* Form Content */}
      <div className="flex flex-col px-4 pt-6 pb-24 gap-6">
        
        {/* Amount Input */}
        <div className="flex flex-col items-center justify-center py-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Tutar</p>
          <div className="flex items-center gap-1">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">₺</span>
            <input 
                type="number" 
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-48 text-5xl font-bold text-gray-900 dark:text-gray-100 text-center bg-transparent border-none focus:ring-0 p-0 placeholder-gray-300 dark:placeholder-gray-700"
            />
          </div>
        </div>

        {/* Merchant & Date */}
        <div className="flex flex-col gap-4">
             <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center gap-4">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">storefront</span>
                <input 
                    type="text" 
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Mağaza veya Açıklama"
                    className="flex-1 bg-transparent border-none p-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-0 font-medium"
                />
             </div>
             <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center gap-4">
                <span className="material-symbols-outlined text-gray-400 dark:text-gray-500">calendar_month</span>
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="flex-1 bg-transparent border-none p-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-0 font-medium"
                />
             </div>
        </div>

        {/* Category Selection */}
        <div>
            <h3 className="text-gray-700 dark:text-gray-300 text-sm font-bold mb-3 px-1">Kategori Seç</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.name)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl gap-2 transition-all border ${
                            category === cat.name 
                            ? 'bg-primary/20 border-primary' 
                            : 'bg-white dark:bg-zinc-800 border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-zinc-700'
                        }`}
                    >
                        <div 
                           className="size-8 rounded-full flex items-center justify-center"
                           style={{ color: cat.color }}
                        >
                             <span className={`material-symbols-outlined text-2xl ${category === cat.name ? 'fill-1' : ''}`}>{cat.icon}</span>
                        </div>
                        <span className={`text-sm font-medium ${category === cat.name ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}>{cat.name}</span>
                    </button>
                ))}
            </div>
        </div>

      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 p-4 border-t border-gray-200 dark:border-gray-800">
        <button 
            onClick={handleSave}
            disabled={!amount || !merchant || !category}
            className="w-full rounded-xl bg-primary px-6 py-4 text-center text-base font-bold text-black shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Harcamayı Kaydet
        </button>
      </div>

    </div>
  );
};

export default ManualEntry;