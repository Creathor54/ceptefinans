import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { Category } from '../types';

const ICONS = [
  'shopping_cart', 'restaurant', 'directions_bus', 'receipt_long', 'movie', 
  'medical_services', 'sell', 'play_circle', 'school', 'fitness_center', 
  'pets', 'flight', 'home', 'work', 'build'
];

const COLORS = [
  '#13ec80', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#ec4899', '#94a3b8', '#10b981', '#6366f1'
];

const ManageCategories: React.FC = () => {
  const navigate = useNavigate();
  const { categories, removeCategory, addCategory, updateCategory } = useExpenses();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('sell');
  const [selectedColor, setSelectedColor] = useState('#94a3b8');
  const [budgetLimit, setBudgetLimit] = useState<string>('');

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSelectedIcon('sell');
    setSelectedColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setBudgetLimit('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    setBudgetLimit(cat.budgetLimit ? cat.budgetLimit.toString() : '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const limit = parseFloat(budgetLimit) || 1000; // Default to 1000 if empty or invalid

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name,
        icon: selectedIcon,
        color: selectedColor,
        budgetLimit: limit
      });
    } else {
      addCategory({
        name,
        icon: selectedIcon,
        color: selectedColor,
        budgetLimit: limit
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Kategorileri Yönet
        </h2>
        <div className="size-10"></div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 p-4 pb-24">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center justify-center size-12 rounded-xl bg-opacity-20"
                style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
              >
                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">{cat.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Bütçe: ₺{cat.budgetLimit?.toLocaleString('tr-TR') || 1000}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => openEditModal(cat)}
                className="p-2 text-gray-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(`${cat.name} kategorisini silmek istediğinize emin misiniz?`)) {
                    removeCategory(cat.id);
                  }
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
              <div className="p-2 text-gray-300 cursor-move">
                <span className="material-symbols-outlined text-xl">drag_indicator</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-20">
        <button 
          onClick={openAddModal}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-4xl text-black">add</span>
        </button>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
            </h3>
            
            <div className="space-y-4">
              {/* Name Input */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">Kategori Adı</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                  placeholder="Örn: Giyim"
                />
              </div>

               {/* Budget Limit Input */}
               <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">Aylık Bütçe Limiti (₺)</label>
                <input 
                  type="number" 
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-primary focus:border-primary"
                  placeholder="Örn: 1500"
                />
              </div>

              {/* Icon Picker */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">İkon Seç</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={`size-10 rounded-lg flex items-center justify-center transition-all ${
                        selectedIcon === icon 
                          ? 'bg-primary text-black' 
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">Renk Seç</label>
                <div className="flex flex-wrap gap-2">
                   {COLORS.map(color => (
                     <button
                       key={color}
                       onClick={() => setSelectedColor(color)}
                       className={`size-8 rounded-full border-2 transition-transform ${
                         selectedColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                       }`}
                       style={{ backgroundColor: color }}
                     />
                   ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
              >
                İptal
              </button>
              <button 
                onClick={handleSave}
                disabled={!name.trim()}
                className="flex-1 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition disabled:opacity-50"
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

export default ManageCategories;