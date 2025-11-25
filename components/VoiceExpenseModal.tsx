
import React, { useState, useEffect, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { parseVoiceExpense } from '../services/geminiService';
import { v4 as uuidv4 } from 'uuid';

interface VoiceExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Add Web Speech API types
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const VoiceExpenseModal: React.FC<VoiceExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, categories } = useExpenses();
  const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<{ merchant: string; amount: number; category: string; date: string } | null>(null);
  
  // Use refs to keep track of latest values inside event callbacks without re-binding
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
      resetState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const resetState = () => {
    setState('idle');
    setTranscript('');
    transcriptRef.current = ''; // Reset ref too
    setParsedData(null);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Tarayıcınız sesli komut özelliğini desteklemiyor.");
      onClose();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false; 
    recognition.interimResults = true;

    recognition.onstart = () => {
      setState('listening');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      
      // Update both state (for UI) and ref (for logic)
      setTranscript(transcriptText);
      transcriptRef.current = transcriptText;
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error", event.error);
      if (event.error === 'no-speech') {
          // Ignore no-speech errors often caused by silence
          return;
      }
      setState('error');
    };

    recognition.onend = () => {
        // When speech ends, check if we have text in the ref
        const finalTranscript = transcriptRef.current;
        
        if (finalTranscript && finalTranscript.trim().length > 0) {
            processVoiceCommand(finalTranscript);
        } else {
            // If we are still in listening state but stopped without text
            if (state === 'listening') {
                 setState('error');
            }
        }
    };

    recognitionRef.current = recognition;
    try {
        recognition.start();
    } catch (e) {
        console.error("Start failed", e);
        setState('error');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(e) {
          // ignore stop errors
      }
    }
  };

  const processVoiceCommand = async (text: string) => {
    setState('processing');
    try {
      const categoryNames = categories.map(c => c.name);
      const result = await parseVoiceExpense(text, categoryNames);
      setParsedData(result);
      setState('success');
    } catch (error) {
      console.error(error);
      setState('error');
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      addExpense({
        id: uuidv4(),
        merchant: parsedData.merchant,
        total: parsedData.amount,
        category: parsedData.category,
        date: parsedData.date,
        items: [],
        timestamp: Date.now(),
        currency: '₺'
      });
      onClose();
    }
  };

  const handleRetry = () => {
      resetState();
      startListening();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <span className="material-symbols-outlined">close</span>
        </button>

        {state === 'listening' && (
          <>
            <div className="relative size-24 flex items-center justify-center mb-6">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-20"></span>
               <div className="size-20 bg-primary rounded-full flex items-center justify-center text-black shadow-lg shadow-primary/30 z-10">
                   <span className="material-symbols-outlined text-4xl">mic</span>
               </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Dinliyorum...</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm min-h-[40px] px-4">
                {transcript || "Örn: 'Migros 350 TL'"}
            </p>
          </>
        )}

        {state === 'processing' && (
          <>
             <div className="size-20 mb-6 flex items-center justify-center">
                <div className="size-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">İşleniyor...</h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 px-4">"{transcript}"</p>
          </>
        )}

        {state === 'error' && (
           <>
             <div className="size-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-6">
                 <span className="material-symbols-outlined text-4xl">mic_off</span>
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Anlaşılamadı</h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Sesli komut net duyulamadı veya işlenemedi.</p>
             <button onClick={handleRetry} className="bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold transition hover:bg-gray-200 dark:hover:bg-zinc-700">Tekrar Dene</button>
           </>
        )}

        {state === 'success' && parsedData && (
          <div className="w-full animate-in zoom-in-95 duration-300">
             <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mx-auto mb-4">
                 <span className="material-symbols-outlined text-3xl">check</span>
             </div>
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Bunu mu demek istedin?</h3>
             
             <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 mb-6 text-left space-y-3 border border-gray-100 dark:border-zinc-700">
                 <div className="flex justify-between items-center">
                     <span className="text-gray-500 text-sm font-medium">Mağaza</span>
                     <span className="font-bold text-gray-900 dark:text-white">{parsedData.merchant}</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-gray-500 text-sm font-medium">Tutar</span>
                     <span className="font-bold text-gray-900 dark:text-white text-xl">₺{parsedData.amount}</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-gray-500 text-sm font-medium">Kategori</span>
                     <span className="font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg text-xs">{parsedData.category}</span>
                 </div>
                 <div className="flex justify-between items-center">
                     <span className="text-gray-500 text-sm font-medium">Tarih</span>
                     <span className="text-gray-900 dark:text-white text-sm">{parsedData.date}</span>
                 </div>
             </div>

             <div className="flex gap-3">
                 <button onClick={handleRetry} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition">Vazgeç</button>
                 <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl bg-primary text-black font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition transform active:scale-95">Onayla</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VoiceExpenseModal;
