import { useState, useEffect, useCallback } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { motion, AnimatePresence } from 'framer-motion';

export interface TxNotification {
  id: string;
  type: 'success' | 'error' | 'pending';
  title: string;
  txHash?: string;
}

// Global notification state
let listeners: Array<(n: TxNotification) => void> = [];

export function notifyTx(notification: Omit<TxNotification, 'id'>) {
  const n = { ...notification, id: Date.now().toString() };
  listeners.forEach((fn) => fn(n));
}

export default function TxToast() {
  const [notifications, setNotifications] = useState<TxNotification[]>([]);

  const addNotification = useCallback((n: TxNotification) => {
    setNotifications((prev) => [...prev, n]);
    // Auto-remove after 8s
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== n.id));
    }, 8000);
  }, []);

  useEffect(() => {
    listeners.push(addNotification);
    return () => {
      listeners = listeners.filter((fn) => fn !== addNotification);
    };
  }, [addNotification]);

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
            className={`bg-white rounded-xl shadow-card-lg border p-4 cursor-pointer ${
              n.type === 'success'
                ? 'border-emerald-200'
                : n.type === 'error'
                  ? 'border-red-200'
                  : 'border-brand-200'
            }`}
            onClick={() => dismiss(n.id)}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  n.type === 'success'
                    ? 'bg-emerald-50 text-emerald-600'
                    : n.type === 'error'
                      ? 'bg-red-50 text-red-500'
                      : 'bg-brand-50 text-brand-600'
                }`}
              >
                {n.type === 'success' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {n.type === 'error' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {n.type === 'pending' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                {n.txHash && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">TX:</span>
                      <code className="text-xs text-brand-600 font-mono truncate">
                        {n.txHash.slice(0, 16)}...{n.txHash.slice(-8)}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(n.txHash!);
                        }}
                        className="text-gray-300 hover:text-gray-500 flex-shrink-0"
                        title="Copy TX hash"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <a
                      href="https://preprod.midnightexplorer.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] text-brand-500 hover:text-brand-700 transition-colors font-medium"
                    >
                      View on Explorer
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(n.id)}
                className="text-gray-300 hover:text-gray-500 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
