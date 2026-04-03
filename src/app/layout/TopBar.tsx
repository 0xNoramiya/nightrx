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
    <header className="border-b border-midnight-700/30 bg-midnight-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-midnight-400 to-medical-green flex items-center justify-center text-sm font-bold">
            Rx
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Night<span className="text-midnight-400">Rx</span>
          </span>
        </div>

        {/* Role Switcher */}
        <nav className="flex items-center bg-midnight-800/50 rounded-xl p-1 gap-1">
          {roles.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setRole(value)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                role === value
                  ? 'text-white'
                  : 'text-midnight-400 hover:text-midnight-200'
              }`}
            >
              {role === value && (
                <motion.div
                  layoutId="activeRole"
                  className="absolute inset-0 bg-midnight-600/50 rounded-lg"
                  transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <span>{icon}</span>
                <span>{label}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Wallet Connection */}
        <ConnectWallet />
      </div>
    </header>
  );
}
