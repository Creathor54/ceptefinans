
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useExpenses();
  
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
      if (user) {
          setName(user.name || '');
          setSurname(user.surname || '');
          setEmail(user.email || '');
      }
  }, [user]);

  const handleSave = () => {
    if (name && surname && email) {
        updateUser({ name, surname, email });
        alert("Bilgiler başarıyla güncellendi!");
        navigate('/'); // Go back to dashboard/settings
    } else {
        alert("Lütfen tüm alanları doldurun.");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
       {/* Header */}
       <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Profili Düzenle
        </h2>
        <div className="size-10"></div>
      </div>

      <div className="flex flex-col p-6 gap-6 max-w-lg mx-auto w-full">
          {/* Avatar Placeholder */}
          <div className="flex justify-center mb-4">
              <div className="relative size-28 rounded-full bg-[#FFEAD1] flex items-center justify-center shadow-md border-4 border-white dark:border-zinc-800">
                  <span className="material-symbols-outlined text-5xl text-[#E89E62]">person</span>
                  <button className="absolute bottom-0 right-0 bg-primary text-black size-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-800">
                      <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
              </div>
          </div>

          <div className="space-y-4">
              <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">İsim</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white focus:ring-primary focus:border-primary font-medium shadow-sm"
                  />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Soyisim</label>
                  <input 
                    type="text" 
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white focus:ring-primary focus:border-primary font-medium shadow-sm"
                  />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">E-posta</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-gray-900 dark:text-white focus:ring-primary focus:border-primary font-medium shadow-sm"
                  />
              </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full mt-6 bg-primary text-black font-bold py-4 rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
              Değişiklikleri Kaydet
          </button>
      </div>
    </div>
  );
};

export default EditProfile;
