'use client';

import { useEffect, useState } from 'react';

interface Props {
  message: string;
  type?: 'error' | 'warning' | 'success';
  onClose: () => void;
  duration?: number;
}

export default function ErrorToast({ message, type = 'error', onClose, duration = 5000 }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    error: 'bg-red-950/90 border-red-800',
    warning: 'bg-yellow-950/90 border-yellow-800',
    success: 'bg-green-950/90 border-green-800',
  }[type];

  const textColor = {
    error: 'text-red-300',
    warning: 'text-yellow-300',
    success: 'text-green-300',
  }[type];

  const iconColor = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    success: 'text-green-400',
  }[type];

  const icons = {
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${bgColor} border rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={iconColor}>{icons[type]}</div>
        <p className={`text-sm ${textColor}`}>{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 text-gray-400 hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
