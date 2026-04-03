import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';
import { checkServerStatus } from '../../midnight/api';

export default function ConnectWallet() {
  const {
    walletConnected,
    walletAddress,
    contractDeployed,
    setWalletConnected,
    setContractDeployed,
    setError,
    runDemoSetup,
  } = useStore();
  const [connecting, setConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      // Check if backend server is running (real on-chain mode)
      const serverOnline = await checkServerStatus();

      if (serverOnline) {
        // Real mode — backend handles wallet
        setWalletConnected(true, 'mn_addr_preprod1...connected');
        setContractDeployed('05d3e2900cf0a09f73dca91225f1594928d7dbcfcfa22bbcc4990ffcddf98ea5');
      } else {
        // Demo mode fallback
        runDemoSetup();
      }
    } catch {
      // Fallback to demo mode
      runDemoSetup();
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setShowDropdown(false);
  };

  if (walletConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-midnight-800/50 border border-midnight-600/30 px-3 py-1.5 rounded-xl text-sm hover:border-midnight-500/50 transition-colors"
        >
          <div className="w-2 h-2 bg-medical-green rounded-full" />
          <span className="text-midnight-200 font-mono text-xs">
            {walletAddress
              ? `${walletAddress.slice(0, 12)}...${walletAddress.slice(-4)}`
              : 'Connected'}
          </span>
          <svg
            className={`w-3 h-3 text-midnight-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-56 bg-midnight-900 border border-midnight-700/30 rounded-xl p-3 shadow-xl z-50"
            >
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-midnight-400">Network</span>
                  <span className="text-midnight-200">
                    {contractDeployed ? 'Preprod' : 'Demo'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-midnight-400">Contract</span>
                  <span className="text-medical-green">Deployed</span>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full text-xs text-medical-red/80 hover:text-medical-red py-2 border-t border-midnight-700/30 transition-colors"
              >
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="flex items-center gap-2 bg-gradient-to-r from-midnight-500 to-midnight-400 hover:from-midnight-400 hover:to-midnight-300 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-midnight-500/25 disabled:opacity-50"
    >
      {connecting ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
          />
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
}
