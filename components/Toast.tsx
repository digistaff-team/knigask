import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce-in">
      <div className={`rounded-lg shadow-lg p-4 flex items-center justify-between min-w-[300px] ${
        type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        <div className="flex items-center">
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-3" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-3" />
          )}
          <span className="font-medium text-sm">{message}</span>
        </div>
        <button onClick={onClose} className="ml-4 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};