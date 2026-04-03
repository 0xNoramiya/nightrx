import { motion } from 'framer-motion';
import type { ProofData } from '../../midnight/types';
import { MEDICATION_TYPES } from '../../midnight/types';

function getMedLabel(value: string): string {
  return MEDICATION_TYPES.find((m) => m.value === value)?.label ?? value;
}

interface Props {
  result: 'valid' | 'invalid';
  proof: ProofData;
  error?: string;
  onDispense: () => void;
}

export default function VerificationResult({ result, proof, error, onDispense }: Props) {
  const isValid = result === 'valid';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
      className={`card border-2 ${
        isValid ? 'border-medical-green/50 shadow-lg shadow-medical-green/10' : 'border-medical-red/50 shadow-lg shadow-medical-red/10'
      }`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
        className="flex justify-center mb-6"
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
          isValid ? 'bg-medical-green/10 text-medical-green' : 'bg-medical-red/10 text-medical-red'
        }`}>
          {isValid ? '✓' : '✗'}
        </div>
      </motion.div>

      <h3 className={`text-2xl font-bold text-center mb-6 ${isValid ? 'text-medical-green' : 'text-medical-red'}`}>
        {isValid ? 'VERIFIED' : 'REJECTED'}
      </h3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between py-2 border-b border-midnight-700/30">
          <span className="text-midnight-400 text-sm">Medication</span>
          <span className="text-sm font-medium">{getMedLabel(proof.credential.medicationType)}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-midnight-700/30">
          <span className="text-midnight-400 text-sm">Issuer</span>
          <span className="text-sm font-medium text-medical-green">Registered ✓</span>
        </div>
        <div className="flex justify-between py-2 border-b border-midnight-700/30">
          <span className="text-midnight-400 text-sm">Expiry</span>
          <span className="text-sm font-medium text-medical-green">Valid ✓</span>
        </div>
        <div className="flex justify-between py-2 border-b border-midnight-700/30">
          <span className="text-midnight-400 text-sm">Nullifier</span>
          <span className="text-sm font-medium text-medical-green">Unused ✓</span>
        </div>
      </div>

      {error && <p className="text-medical-red text-sm mb-4 text-center">{error}</p>}

      {isValid && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onDispense}
          className="w-full py-4 bg-medical-green hover:bg-medical-green/80 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          Dispense Medication
        </motion.button>
      )}

      <p className="text-xs text-midnight-500 mt-4 text-center">
        No diagnosis or patient identity was revealed during verification
      </p>
    </motion.div>
  );
}
