import { motion } from 'framer-motion';
import { useStore } from '../../store/store';
import type { Role } from '../../midnight/types';
import ConnectWallet from './ConnectWallet';

const roles: { value: Role; label: string; icon: string }[] = [
  { value: 'clinic', label: 'Clinic', icon: '🏥' },
  { value: 'patient', label: 'Patient', icon: '👤' },
  { value: 'pharmacy', label: 'Pharmacy', icon: '💊' },
];

export default function TopBar() {
  const { role, setRole } = useStore();

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white shadow-sm">
            Rx
          </div>
          <span className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900">
            Night<span className="text-brand-600">Rx</span>
          </span>
        </div>

        <nav className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
          {roles.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setRole(value)}
              className={`relative px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                role === value
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {role === value && (
                <motion.div
                  layoutId="activeRole"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                />
              )}
              <span className="relative flex items-center gap-1 sm:gap-2">
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
            </button>
          ))}
        </nav>

        <ConnectWallet />
      </div>
    </header>
  );
}
