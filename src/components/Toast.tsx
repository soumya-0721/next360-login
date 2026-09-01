'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: 'bg-green-50 border-green-200', icon: <CheckCircle className="w-5 h-5 text-green-600" />, text: 'text-green-800' },
    error: { bg: 'bg-red-50 border-red-200', icon: <XCircle className="w-5 h-5 text-red-600" />, text: 'text-red-800' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: <Info className="w-5 h-5 text-blue-600" />, text: 'text-blue-800' },
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${config.bg}`}>
      {config.icon}
      <span className={`text-sm font-medium ${config.text}`}>{message}</span>
      <button onClick={onClose} className="ml-2 p-1 rounded-full hover:bg-black/5">
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}
