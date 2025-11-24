
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationRead, clearNotifications } = useExpenses();

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (id: string, link?: string) => {
      markNotificationRead(id);
      if (link) {
          navigate(link);
      }
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'warning': return 'warning';
          case 'alert': return 'error';
          case 'success': return 'check_circle';
          default: return 'info';
      }
  };

  const getColor = (type: string) => {
      switch(type) {
          case 'warning': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
          case 'alert': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
          case 'success': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
          default: return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
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
          Bildirimler
        </h2>
        <div className="size-10">
            {notifications.length > 0 && (
                <button onClick={clearNotifications} className="text-gray-500 text-xs font-bold mt-3">Temizle</button>
            )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 pb-24">
          {notifications.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                   <div className="size-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                       <span className="material-symbols-outlined text-5xl text-gray-400">notifications_off</span>
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bildirim Yok</h3>
                   <p className="text-gray-500">Şu an için her şey yolunda görünüyor.</p>
              </div>
          ) : (
              notifications.map(notif => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id, notif.actionLink)}
                    className={`p-4 rounded-2xl shadow-sm border flex gap-4 cursor-pointer transition-all ${notif.read ? 'bg-white dark:bg-zinc-900 opacity-60 border-gray-100 dark:border-gray-800' : 'bg-white dark:bg-zinc-800 border-primary/20 shadow-md transform scale-[1.01]'}`}
                  >
                      <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${getColor(notif.type)}`}>
                          <span className="material-symbols-outlined text-2xl">{getIcon(notif.type)}</span>
                      </div>
                      <div className="flex flex-col flex-1">
                          <div className="flex justify-between items-start">
                              <h4 className={`font-bold text-sm ${notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{notif.title}</h4>
                              {!notif.read && <span className="size-2 rounded-full bg-primary mt-1.5"></span>}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                          <span className="text-[10px] text-gray-400 mt-2 text-right">{new Date(notif.date).toLocaleDateString('tr-TR')}</span>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};

export default Notifications;
