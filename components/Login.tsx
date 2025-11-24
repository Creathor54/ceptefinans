
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';

const Login: React.FC = () => {
  const { login } = useExpenses();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('berk.yilmaz@email.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        const success = login(email, password);
        if (success) {
            navigate('/');
        } else {
            alert('Giriş başarısız. Lütfen bilgileri kontrol edin.');
            setIsLoading(false);
        }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark font-display p-6 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

      {/* Brand Section */}
      <div className="flex flex-col items-center gap-4 mb-12 animate-in slide-in-from-top-10 duration-700">
        <div className="relative size-24 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 transform rotate-6">
            <span className="material-symbols-outlined text-white text-5xl">account_balance_wallet</span>
        </div>
        <div className="text-center">
            <h1 className="text-4xl font-[900] tracking-tighter text-zinc-900 dark:text-white mt-4">
                Cepte<span className="text-primary">Finans</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Paranızın Kontrolü Cebinizde</p>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-5 animate-in slide-in-from-bottom-10 duration-700 delay-150">
          <div className="bg-white dark:bg-zinc-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400">mail</span>
                </div>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="E-posta Adresi"
                    className="block w-full pl-12 pr-4 py-4 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0"
                />
             </div>
             <div className="h-px bg-gray-100 dark:bg-gray-700 mx-4"></div>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-gray-400">lock</span>
                </div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Şifre"
                    className="block w-full pl-12 pr-4 py-4 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0"
                />
             </div>
          </div>

          <div className="flex items-center justify-end">
              <button type="button" className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                  Şifremi Unuttum?
              </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/25 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <>
                    <span>Giriş Yap</span>
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
            )}
          </button>
      </form>

      <div className="mt-12 text-center animate-in fade-in duration-1000 delay-300">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
              Hesabınız yok mu? <button className="font-bold text-primary hover:underline">Kayıt Ol</button>
          </p>
      </div>

    </div>
  );
};

export default Login;
