
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from '../types';

interface SubscriptionsProps {
  isEmbedded?: boolean;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const { subscriptions, addSubscription, removeSubscription, updateSubscription } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
      platform: '',
      amount: '',
      firstPaymentDate: new Date().toISOString().split('T')[0],
      billingCycle: 'monthly',
      category: 'play_circle',
      color: '#3B82F6'
  });

  const CATEGORY_ICONS = [
      { name: 'play_circle', color: '#E50914', label: 'Eğlence' }, // Netflix Red
      { name: 'music_note', color: '#1DB954', label: 'Müzik' },    // Spotify Green
      { name: 'home', color: '#F59E0B', label: 'Kira' },           // Orange
      { name: 'sports_esports', color: '#8B5CF6', label: 'Oyun' }, // Purple
      { name: 'fitness_center', color: '#06B6D4', label: 'Spor' }, // Cyan
      { name: 'cloud', color: '#3B82F6', label: 'Bulut' },         // Blue
      { name: 'school', color: '#EC4899', label: 'Eğitim' },       // Pink
      { name: 'wifi', color: '#6366F1', label: 'İnternet' }        // Indigo
  ];

  const resetForm = () => {
      setForm({
        platform: '',
        amount: '',
        firstPaymentDate: new Date().toISOString().split('T')[0],
        billingCycle: 'monthly',
        category: 'play_circle',
        color: '#3B82F6'
      });
      setEditingId(null);
  };

  const handleOpenModal = (sub?: Subscription) => {
      if (sub) {
          setEditingId(sub.id);
          setForm({
              platform: sub.platform,
              amount: sub.amount.toString(),
              firstPaymentDate: sub.firstPaymentDate, // editing doesn't usually change next payment directly unless we reset
              billingCycle: sub.billingCycle,
              category: sub.category,
              color: sub.color
          });
      } else {
          resetForm();
      }
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if (!form.platform || !form.amount) return;

      const subData: Partial<Subscription> = {
          platform: form.platform,
          amount: parseFloat(form.amount),
          firstPaymentDate: form.firstPaymentDate,
          billingCycle: form.billingCycle as 'monthly' | 'yearly',
          category: form.category,
          color: form.color,
          currency: '₺',
          isActive: true
      };

      if (editingId) {
          updateSubscription(editingId, subData);
      } else {
          addSubscription({
              id: uuidv4(),
              ...subData,
              nextPaymentDate: form.firstPaymentDate // Init next date as start date
          } as Subscription);
      }
      setIsModalOpen(false);
      resetForm();
  };

  const calculateTotalMonthly = () => {
      return subscriptions.reduce((sum, sub) => {
          if (sub.billingCycle === 'monthly') return sum + sub.amount;
          return sum + (sub.amount / 12); // yearly prorated
      }, 0);
  };

  return (
    <div className={`relative flex flex-col ${isEmbedded ? 'pb-20 pt-2 animate-in slide-in-from-right-4 fade-in duration-300' : 'min-h-screen w-full bg-background-light dark:bg-background-dark font-display'}`}>
       {/* Header - Only show if NOT embedded */}
       {!isEmbedded && (
           <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
            <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <h2 className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Abonelikler
            </h2>
            <button 
                onClick={() => handleOpenModal()}
                className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
                <span className="material-symbols-outlined text-2xl">add</span>
            </button>
        </div>
       )}

      <div className={`flex flex-col gap-4 ${isEmbedded ? 'px-4' : 'p-4 pb-24 animate-in slide-in-from-right-4 fade-in duration-300'}`}>
          
          {/* Summary */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                  <p className="text-indigo-100 text-sm font-medium mb-1">Aylık Sabit Gider</p>
                  <h1 className="text-4xl font-black mb-4">₺{calculateTotalMonthly().toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</h1>
                  <p className="text-indigo-200 text-xs">Toplam {subscriptions.length} aktif abonelik</p>
              </div>
              <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white opacity-10 rotate-12">auto_renew</span>
          </div>

          {/* List */}
          <div className="flex flex-col gap-3">
              {subscriptions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <div className="size-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-purple-500">
                          <span className="material-symbols-outlined text-4xl">subscriptions</span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Abonelik Ekle</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mb-6">
                          Netflix, Spotify, Kira gibi her ay tekrarlayan ödemelerini buraya ekle, otomatik takip edelim.
                      </p>
                      <button 
                          onClick={() => handleOpenModal()}
                          className="px-6 py-2.5 bg-white dark:bg-zinc-700 rounded-xl text-primary font-bold shadow-sm hover:shadow transition"
                      >
                          Yeni Abonelik
                      </button>
                  </div>
              )}

              {subscriptions.map(sub => (
                  <div key={sub.id} className="bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                          <div 
                            className="size-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                            style={{ backgroundColor: sub.color }}
                          >
                              <span className="material-symbols-outlined">{sub.category}</span>
                          </div>
                          <div>
                              <h3 className="font-bold text-gray-900 dark:text-white">{sub.platform}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Sonraki: {new Date(sub.nextPaymentDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                              </p>
                          </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                          <span className="font-bold text-gray-900 dark:text-white">₺{sub.amount}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenModal(sub)} className="text-blue-500 hover:bg-blue-50 rounded-full p-1"><span className="material-symbols-outlined text-lg">edit</span></button>
                              <button onClick={() => removeSubscription(sub.id)} className="text-red-500 hover:bg-red-50 rounded-full p-1"><span className="material-symbols-outlined text-lg">delete</span></button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Floating Add Button for Embedded Mode */}
      {isEmbedded && (
          <button 
                onClick={() => handleOpenModal()}
                className="fixed bottom-24 right-6 size-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95 z-30"
          >
              <span className="material-symbols-outlined text-2xl">add</span>
          </button>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
             <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                 <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    {editingId ? 'Aboneliği Düzenle' : 'Yeni Abonelik'}
                 </h3>
                 
                 <div className="space-y-4">
                     <div className="flex flex-col gap-1">
                         <label className="text-xs font-bold text-gray-500">Platform Adı</label>
                         <input 
                            type="text" 
                            value={form.platform}
                            onChange={(e) => setForm({...form, platform: e.target.value})}
                            placeholder="Örn: Netflix"
                            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                         />
                     </div>
                     <div className="flex gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-bold text-gray-500">Tutar (₺)</label>
                            <input 
                                type="number" 
                                value={form.amount}
                                onChange={(e) => setForm({...form, amount: e.target.value})}
                                placeholder="0.00"
                                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-xs font-bold text-gray-500">Döngü</label>
                            <select 
                                value={form.billingCycle}
                                onChange={(e) => setForm({...form, billingCycle: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                            >
                                <option value="monthly">Aylık</option>
                                <option value="yearly">Yıllık</option>
                            </select>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1">
                         <label className="text-xs font-bold text-gray-500">Başlangıç Tarihi</label>
                         <input 
                            type="date" 
                            value={form.firstPaymentDate}
                            onChange={(e) => setForm({...form, firstPaymentDate: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                         />
                     </div>

                     {/* Quick Icon Select */}
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-500">Kategori</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {CATEGORY_ICONS.map(ic => (
                                <button
                                    key={ic.name}
                                    onClick={() => setForm({...form, category: ic.name, color: ic.color})}
                                    className={`size-10 shrink-0 rounded-lg flex items-center justify-center transition-all ${form.category === ic.name ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-70 grayscale'}`}
                                    style={{ backgroundColor: ic.color }}
                                >
                                    <span className="material-symbols-outlined text-white">{ic.name}</span>
                                </button>
                            ))}
                        </div>
                     </div>
                 </div>

                 <div className="flex gap-3 mt-6">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                    >
                        İptal
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={!form.platform || !form.amount}
                        className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        Kaydet
                    </button>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default Subscriptions;
