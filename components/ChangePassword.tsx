
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useExpenses();
  
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleSave = () => {
    if (!currentPass || !newPass) {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }
    if (newPass !== confirmPass) {
        alert("Yeni şifreler eşleşmiyor.");
        return;
    }

    // In a real app, verify currentPass here.
    updateUser({ password: newPass });
    alert("Şifreniz başarıyla güncellendi.");
    navigate(-1);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
       {/* Header */}
       <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Şifre Değiştir
        </h2>
        <div className="size-10"></div>
      </div>

      <div className="flex flex-col p-6 gap-6 max-w-lg mx-auto w-full pt-10">
          
          <div className="space-y-4">
              <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Mevcut Şifre</label>
                  <div className="relative">
                    <input 
                        type="password" 
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white focus:ring-primary focus:border-primary font-medium shadow-sm"
                        placeholder="••••••"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">lock</span>
                  </div>
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Yeni Şifre</label>
                  <div className="relative">
                    <input 
                        type="password" 
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white focus:ring-primary focus:border-primary font-medium shadow-sm"
                        placeholder="••••••"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">key</span>
                  </div>
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Yeni Şifre (Tekrar)</label>
                  <div className="relative">
                    <input 
                        type="password" 
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white focus:ring-primary focus:border-primary font-medium shadow-sm"
                        placeholder="••••••"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400">check_circle</span>
                  </div>
              </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 items-start border border-blue-100 dark:border-blue-900/30">
              <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                  Güvenliğiniz için şifreniz en az 6 karakterden oluşmalı, harf ve rakam içermelidir.
              </p>
          </div>

          <button 
            onClick={handleSave}
            className="w-full mt-2 bg-primary text-black font-bold py-4 rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
              Şifreyi Güncelle
          </button>
      </div>
    </div>
  );
};

export default ChangePassword;
