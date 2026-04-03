import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import type { Credential } from '../../midnight/types';
import { MEDICATION_TYPES } from '../../midnight/types';
import { buildProofData } from '../../midnight/contract';
import { proofToQR } from '../../credential/qr';
import { useStore } from '../../store/store';
import { copyToClipboard } from '../../utils/clipboard';

function getMedLabel(value: string): string {
  return MEDICATION_TYPES.find((m) => m.value === value)?.label ?? value;
}

interface Props {
  credential: Credential;
}

export default function ProofGenerator({ credential }: Props) {
  const { setCurrentProof } = useStore();
  const [generating, setGenerating] = useState(false);
  const [proofQR, setProofQR] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    setGenerating(true);
    setProgress(0);
    setProofQR(null);

    for (let i = 0; i < 4; i++) {
      setProgress(((i + 1) / 4) * 100);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    const proofData = buildProofData(credential);
    setCurrentProof(proofData);
    setProofQR(proofToQR(proofData));
    setGenerating(false);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Generate Proof</h3>
      <p className="text-sm text-gray-500 mb-4">
        For: <span className="text-gray-900">{getMedLabel(credential.medicationType)}</span>
      </p>
      <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full">
        {generating ? 'Generating...' : 'Generate ZK Proof'}
      </button>

      <AnimatePresence>
        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full" />
              <span className="text-sm text-gray-600">Generating zero-knowledge proof...</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full" initial={{ width: '0%' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-xs text-gray-400 mt-2">Your private data never leaves this device</p>
            <div className="mt-4 flex justify-center">
              <motion.div
                animate={{ boxShadow: ['0 0 0 0 rgba(99, 102, 241, 0)', '0 0 0 12px rgba(99, 102, 241, 0.1)', '0 0 0 0 rgba(99, 102, 241, 0)'] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-xl"
              >🛡️</motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {proofQR && !generating && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6">
            <div className="p-4 sm:p-6 bg-white rounded-xl shadow-card-lg border border-gray-100 flex flex-col items-center gap-4 overflow-hidden">
              <p className="text-gray-900 text-sm font-medium">Show this to the pharmacy</p>
              <div className="w-full max-w-[200px]">
                <QRCode value={proofQR} size={200} style={{ width: '100%', height: 'auto' }} />
              </div>
              <button onClick={() => copyToClipboard(proofQR)} className="text-xs text-brand-600 hover:text-brand-700 underline">Copy proof data</button>
            </div>
            <p className="text-xs text-emerald-600 mt-3 text-center">Proof generated — no diagnosis information included</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
