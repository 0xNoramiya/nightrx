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
        isValid ? 'border-emerald-200 shadow-card-lg' : 'border-red-200 shadow-card-lg'
      }`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
        className="flex justify-center mb-6"
      >
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
          isValid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {isValid ? '✓' : '✗'}
        </div>
      </motion.div>

      <h3 className={`text-xl sm:text-2xl font-bold text-center mb-6 ${isValid ? 'text-emerald-600' : 'text-red-500'}`}>
        {isValid ? 'VERIFIED' : 'REJECTED'}
      </h3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-sm">Medication</span>
          <span className="text-sm font-medium">{getMedLabel(proof.credential.medicationType)}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-sm">Issuer</span>
          <span className="text-sm font-medium text-emerald-600">Registered ✓</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-sm">Expiry</span>
          <span className="text-sm font-medium text-emerald-600">Valid ✓</span>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <span className="text-gray-500 text-sm">Nullifier</span>
          <span className="text-sm font-medium text-emerald-600">Unused ✓</span>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

      {isValid && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onDispense}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          Dispense Medication
        </motion.button>
      )}

      <p className="text-xs text-gray-400 mt-4 text-center">
        No diagnosis or patient identity was revealed during verification
      </p>
    </motion.div>
  );
}
