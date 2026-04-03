import { motion } from 'framer-motion';

export default function ConnectPrompt({ role }: { role: string }) {
  const roleMessages: Record<string, { title: string; description: string }> = {
    clinic: {
      title: 'Connect to Issue Credentials',
      description: 'Connect your wallet to register as a trusted issuer and start issuing private medication credentials.',
    },
    patient: {
      title: 'Connect to Manage Credentials',
      description: 'Connect your wallet to import credentials, generate zero-knowledge proofs, and prove medication eligibility privately.',
    },
    pharmacy: {
      title: 'Connect to Verify Patients',
      description: 'Connect your wallet to verify patient eligibility proofs on Midnight without seeing any diagnosis information.',
    },
  };

  const msg = roleMessages[role] || roleMessages.clinic;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Shield icon */}
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(99, 102, 241, 0)',
            '0 0 0 20px rgba(99, 102, 241, 0.05)',
            '0 0 0 0 rgba(99, 102, 241, 0)',
          ],
        }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="w-20 h-20 rounded-2xl bg-midnight-800/50 border border-midnight-700/30 flex items-center justify-center mb-8"
      >
        <svg className="w-10 h-10 text-midnight-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </motion.div>

      <h2 className="text-2xl font-semibold mb-3">{msg.title}</h2>
      <p className="text-midnight-400 max-w-md mb-8 leading-relaxed">
        {msg.description}
      </p>

      <div className="flex items-center gap-2 text-sm text-midnight-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        Click <span className="text-midnight-300 font-medium">"Connect Wallet"</span> above to get started
      </div>
    </motion.div>
  );
}
