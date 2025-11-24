import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { analyzeReceiptImage } from '../services/geminiService';
import { ReceiptData, ReceiptItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

const ConfirmReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { capturedImage, addExpense } = useExpenses();
  const [loading, setLoading] = useState(true);
  
  // Default structure
  const [data, setData] = useState<ReceiptData>({
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    total: 0,
    currency: '₺'
  });

  // Fallback image URL if no captured image (e.g., direct navigation)
  const displayImage = capturedImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuBOa-SzgrPk6NTc7mYZS2tckzNvNFwXzqR1vU5CM8Dbvny7QJRs-wQFeyp0V1ufZgpKNotYyAcE0TIsjJtk5rrFwa8S4c2wwJ8yh5kHaTFn-1kcd8RAUe0qNf2Fk4LCpjHNR9AzzVhAo4YR8g84nAzHI7wJTsQvQbFxcy_qZ7SbNT_2lZM0pVoMNhTBL_wZAFGD1joBBaMcb6NHDT4IchwGz4p0SF0N-A3DbuxY1LdfRJgXIi1mRWZdp9CtjiScKgQ5RAmdR78NUoE";

  useEffect(() => {
    const processImage = async () => {
      if (capturedImage) {
        setLoading(true);
        try {
          const result = await analyzeReceiptImage(capturedImage);
          setData(result);
        } catch (error) {
          console.error("Analysis failed", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Mock data loading if we're just viewing the placeholder
         setTimeout(() => {
            setData({
                merchant: "Market",
                date: "2023-10-25",
                items: [
                    { name: "Süt 1L", price: 32.50, quantity: "1 adet" },
                    { name: "Domates", price: 25.00, quantity: "0,85 kg" }
                ],
                total: 57.50,
                currency: '₺'
            });
            setLoading(false);
         }, 1000);
      }
    };

    processImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recalculateTotal = (items: ReceiptItem[]) => {
      return items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    const newTotal = recalculateTotal(newItems);
    setData({ ...data, items: newItems, total: newTotal });
  };

  const handleAddItem = () => {
    const newItem: ReceiptItem = { name: "Yeni Ürün", price: 0, quantity: "1" };
    const newItems = [...data.items, newItem];
    setData({ ...data, items: newItems }); // Price is 0 so total doesn't change immediately
  };

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...data.items];
    // We construct the updated item safely
    const updatedItem = { ...newItems[index], [field]: value };
    newItems[index] = updatedItem;

    const newTotal = recalculateTotal(newItems);
    setData({ ...data, items: newItems, total: newTotal });
  };

  const handleSave = () => {
    addExpense({
      id: uuidv4(),
      ...data,
      category: 'Market', // Default category for now
      timestamp: Date.now()
    });
    navigate('/');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
      {/* TopAppBar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-gray-800 dark:text-gray-200 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          {loading ? 'Analiz Ediliyor...' : 'Fiş Detaylarını Onayla'}
        </h2>
        <div className="flex size-10 shrink-0 items-center"></div>
      </div>

      {/* HeaderImage */}
      <div className="px-4 py-4">
        <div 
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-2xl min-h-[160px] shadow-md relative group border border-gray-100 dark:border-gray-800"
            style={{ backgroundImage: `url("${displayImage}")` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-black/40 transition duration-500"></div>
            {loading && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="text-white font-medium text-sm">Gemini fişi okuyor...</p>
                    </div>
                 </div>
            )}
        </div>
      </div>

      {/* SectionHeader */}
      <div className="flex items-center justify-between px-4 pb-2">
        <h3 className="text-gray-900 dark:text-gray-100 text-lg font-bold leading-tight tracking-tight">
            Algılanan Ürünler
        </h3>
        {!loading && (
             <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                {data.items.length} Kalem
             </span>
        )}
      </div>

      {/* Product List */}
      <div className="flex flex-col gap-3 px-4 pb-32">
        {data.items.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">receipt_long</span>
                <p>Ürün bulunamadı.</p>
                <button onClick={handleAddItem} className="mt-2 text-primary font-bold text-sm hover:underline">Manuel Ekle</button>
            </div>
        )}
        
        {data.items.map((item, index) => (
            <div key={index} className="flex gap-4 bg-white dark:bg-gray-900 p-4 justify-between items-start rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
            <div className="flex items-start gap-4 flex-1">
                <div className="text-gray-800 dark:text-gray-200 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 shrink-0 size-12 mt-1 shadow-inner">
                <span className="material-symbols-outlined text-2xl">
                    {item.name.toLowerCase().includes('süt') || item.name.toLowerCase().includes('içecek') || item.name.toLowerCase().includes('kahve') ? 'local_drink' : 'shopping_bag'}
                </span>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-3">
                {/* Editable Name */}
                <div className="relative group/input">
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold absolute -top-1.5 left-0 opacity-0 group-focus-within/input:opacity-100 transition-opacity">Ürün Adı</label>
                    <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary p-1 text-gray-900 dark:text-gray-100 text-base font-semibold leading-normal focus:ring-0 placeholder-gray-300 dark:placeholder-gray-600 transition-colors rounded-t-lg hover:bg-gray-50 dark:hover:bg-white/5 focus:bg-gray-50 dark:focus:bg-white/10"
                        placeholder="Ürün Adı"
                    />
                     <span className="material-symbols-outlined absolute right-1 top-2 text-[16px] text-gray-400 opacity-0 group-hover/input:opacity-100 pointer-events-none transition-opacity">edit</span>
                </div>
                
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Editable Price */}
                    <div className="flex flex-col relative group/price">
                        <label className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold mb-0.5 ml-1">Fiyat</label>
                        <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                            <input
                                type="number"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                                className="w-20 bg-transparent border-none p-0 text-gray-900 dark:text-gray-100 font-bold text-sm focus:ring-0"
                                step="0.01"
                            />
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-bold">{data.currency || '₺'}</span>
                        </div>
                    </div>

                    {/* Editable Quantity */}
                    <div className="flex flex-col relative group/qty">
                         <label className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold mb-0.5 ml-1">Miktar</label>
                         <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                            <input
                                type="text"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-20 bg-transparent border-none p-0 text-gray-900 dark:text-gray-100 font-bold text-sm focus:ring-0"
                                placeholder="1"
                            />
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <div className="shrink-0 pt-2">
                <button 
                    onClick={() => handleDeleteItem(index)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 flex size-9 items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 active:bg-red-100 dark:active:bg-red-500/20 transition"
                >
                    <span className="material-symbols-outlined text-xl">delete</span>
                </button>
            </div>
            </div>
        ))}
        
        {/* Add Item Button */}
        <button 
            onClick={handleAddItem}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 px-4 py-4 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:border-primary hover:text-primary transition-all group shadow-sm hover:shadow"
        >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
            <span className="text-base font-medium">Ürün Ekle</span>
        </button>
      </div>

      {/* Summary & CTA Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900/95 backdrop-blur-xl p-4 pt-4 border-t border-gray-200 dark:border-gray-800 z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="flex justify-between items-center mb-4 max-w-2xl mx-auto px-2">
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Toplam Tutar</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{data.total.toFixed(2)} <span className="text-xl text-gray-500">{data.currency || '₺'}</span></p>
        </div>
        <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full max-w-2xl mx-auto block rounded-2xl bg-primary px-6 py-4 text-center text-lg font-bold text-black shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transform"
        >
            {loading ? 'Lütfen bekleyin...' : 'Harcamayı Kaydet'}
        </button>
      </div>
    </div>
  );
};

export default ConfirmReceipt;