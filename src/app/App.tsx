import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/store';
import TopBar from './layout/TopBar';
import ConnectPrompt from './layout/ConnectPrompt';
import ClinicDashboard from './clinic/ClinicDashboard';
import PatientWallet from './patient/PatientWallet';
import PharmacyVerifier from './pharmacy/PharmacyVerifier';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function App() {
  const { role, walletConnected, error, setError } = useStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border-b border-red-100 px-6 py-3 text-sm text-red-600 flex items-center justify-between max-w-6xl mx-auto"
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 ml-4"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={walletConnected ? role : 'connect'}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {!walletConnected ? (
              <ConnectPrompt role={role} />
            ) : (
              <>
                {role === 'clinic' && <ClinicDashboard />}
                {role === 'patient' && <PatientWallet />}
                {role === 'pharmacy' && <PharmacyVerifier />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
