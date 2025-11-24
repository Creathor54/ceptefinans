import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';

const CameraScan: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const navigate = useNavigate();
  const { setCapturedImage } = useExpenses();
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    // Stop any existing tracks first
    if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
    }

    try {
      // Request HD resolution if possible
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Ensure video plays (needed for some mobile browsers)
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Video play failed:", e));
            setIsStreaming(true);
        };
      }
      setError('');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Kameraya erişilemedi. Lütfen izinleri kontrol edin veya HTTPS kullanıldığından emin olun.");
    }
  };

  // Restart camera when facingMode changes
  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
      setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure we have valid dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn("Video dimensions not ready");
        return;
      }

      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas to match video stream resolution for maximum quality
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // If using front camera, we might want to mirror the capture too, 
        // but typically for receipts we want text to be readable, so we draw it 'as is' from the video feed.
        // However, if the user sees it mirrored, the capture should probably match what they see?
        // Actually for OCR, we ALWAYS want the text to be readable (not mirrored).
        // The raw video stream from 'user' camera is usually NOT mirrored (it captures reality), 
        // but the preview is often mirrored by CSS for UX.
        // So drawing raw video to canvas should be correct for OCR.
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to high quality JPEG
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageDataUrl);
        
        // Stop camera tracks before navigating to save resources
        if (video.srcObject) {
           (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        
        navigate('/confirm');
      }
    }
  }, [navigate, setCapturedImage]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        navigate('/confirm');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative flex h-[100dvh] w-full flex-col bg-gray-900 group/design-root overflow-hidden">
      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video Stream / Background */}
      <div className="absolute inset-0 z-0 bg-black">
        {error ? (
           <div className="flex h-full items-center justify-center p-6 text-center text-white">
             <div className="flex flex-col items-center gap-4">
               <span className="material-symbols-outlined text-4xl text-red-400">videocam_off</span>
               <p>{error}</p>
               <button onClick={startCamera} className="px-4 py-2 bg-white/20 rounded-lg">Tekrar Dene</button>
             </div>
           </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover opacity-90 transition-transform duration-300"
            // Apply mirroring ONLY for front camera ('user'), Back camera should be 'scaleX(1)' (Normal)
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
          />
        )}
      </div>
      
      {/* Overlay UI */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between">
        
        {/* Top App Bar */}
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate('/')}
            className="flex size-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
          >
            <span className="material-symbols-outlined text-inherit">close</span>
          </button>
          <button className="flex size-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition">
            <span className="material-symbols-outlined text-inherit">flash_on</span>
          </button>
        </div>

        {/* Main Content: Scanner Frame */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 pointer-events-none">
          <p className="text-center text-base font-normal leading-normal text-white drop-shadow-md mb-8">
            Net bir fotoğraf için fişi çerçevenin içine yerleştirin.
          </p>
          <div className="relative aspect-[2/3] w-full max-w-sm rounded-xl border-2 border-dashed border-white/50 p-2 shadow-2xl">
            <div className="absolute -top-1.5 -left-1.5 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-primary"></div>
            <div className="absolute -top-1.5 -right-1.5 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-primary"></div>
            <div className="absolute -bottom-1.5 -left-1.5 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-primary"></div>
            <div className="absolute -bottom-1.5 -right-1.5 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-primary"></div>
            {/* Scan animation line */}
             <div className="absolute left-0 top-0 h-1 w-full bg-primary/50 shadow-[0_0_15px_rgba(19,236,128,0.8)] animate-[scan_2s_infinite_linear]"></div>
          </div>
        </div>

        {/* Bottom Camera Controls */}
        <div className="flex items-center justify-center gap-8 p-8 pb-12 bg-gradient-to-t from-black/80 to-transparent">
          
          {/* Gallery/File Upload */}
          <label className="flex size-14 shrink-0 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md cursor-pointer hover:bg-black/60 transition">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <span className="material-symbols-outlined text-inherit !text-2xl">photo_library</span>
          </label>

          {/* Shutter Button */}
          <button 
            onClick={captureImage}
            disabled={!!error}
            className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary p-1 hover:scale-105 active:scale-95 transition shadow-lg shadow-primary/30 disabled:opacity-50 disabled:grayscale"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-gray-900 bg-transparent">
              <div className="h-full w-full rounded-full bg-white/10 opacity-0 active:opacity-100 transition"></div>
            </div>
          </button>

          {/* Flip Camera */}
          <button 
            onClick={toggleCamera}
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition active:rotate-180 duration-500"
          >
            <span className="material-symbols-outlined text-inherit !text-2xl">flip_camera_android</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CameraScan;