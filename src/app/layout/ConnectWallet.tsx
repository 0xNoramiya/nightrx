import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';
import { checkServerStatus } from '../../midnight/api';
import { copyToClipboard } from '../../utils/clipboard';

const CONTRACT_ADDRESS = '05d3e2900cf0a09f73dca91225f1594928d7dbcfcfa22bbcc4990ffcddf98ea5';

export default function ConnectWallet() {
  const {
    walletConnected,
    contractDeployed,
    contractAddress,
    setWalletConnected,
    setContractDeployed,
    setError,
    runDemoSetup,
  } = useStore();
  const [connecting, setConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOnChain, setIsOnChain] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const serverOnline = await checkServerStatus();
      if (serverOnline) {
        setWalletConnected(true, 'preprod');
        setContractDeployed(CONTRACT_ADDRESS);
        setIsOnChain(true);
      } else {
        runDemoSetup();
        setIsOnChain(false);
        setError('Backend not reachable — running in demo mode.');
      }
    } catch {
      runDemoSetup();
      setIsOnChain(false);
      setError('Backend not reachable — running in demo mode.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setShowDropdown(false);
    setIsOnChain(false);
  };

  if (walletConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-sm hover:bg-gray-100 transition-colors"
        >
          <div className={`w-2 h-2 rounded-full ${isOnChain ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span className="text-gray-700 text-xs font-medium">
            {isOnChain ? 'Preprod' : 'Demo Mode'}
          </span>
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
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
              className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl p-4 shadow-card-lg z-50"
            >
              <div className="space-y-3 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Network</span>
                  <span className={`font-medium ${isOnChain ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isOnChain ? 'Midnight Preprod' : 'Demo (Simulated)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Status</span>
                  <span className={`font-medium ${isOnChain ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {isOnChain ? 'On-Chain' : 'Off-Chain'}
                  </span>
                </div>
                {contractAddress && (
                  <div className="text-xs">
                    <span className="text-gray-400 block mb-1">Contract</span>
                    <div className="flex items-center gap-1.5">
                      <code className="text-gray-600 font-mono text-[10px] truncate flex-1">
                        {contractAddress}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(contractAddress);
                        }}
                        className="text-gray-300 hover:text-gray-500 flex-shrink-0"
                        title="Copy contract address"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full text-xs text-red-500 hover:text-red-600 py-2 border-t border-gray-100 transition-colors"
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
      className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Connect
        </>
      )}
    </button>
  );
}
