import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';
import type { ProofData } from '../../midnight/types';
import { parseQR } from '../../credential/qr';
import { verifyPickupOnChain } from '../../midnight/api';
import { notifyTx } from '../layout/TxToast';
import VerificationResult from './VerificationResult';
import DispensationLog from './DispensationLog';

export default function PharmacyVerifier() {
  const { addDispensation, setError } = useStore();
  const [proofInput, setProofInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [proof, setProof] = useState<ProofData | null>(null);
  const [result, setResult] = useState<'valid' | 'invalid' | null>(null);

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    setProof(null);

    try {
      let proofData: ProofData;
      try {
        const parsed = parseQR(proofInput.trim());
        if (parsed.type !== 'proof') {
          throw new Error('Expected proof data, got: ' + parsed.type);
        }
        proofData = parsed.data;
      } catch {
        proofData = JSON.parse(proofInput.trim());
      }

      setProof(proofData);

      const txHash = await verifyPickupOnChain(
        proofData.nullifier,
        proofData.medicationTypeHash,
        proofData.credential.patientSecret,
      );

      setResult('valid');
      notifyTx({ type: 'success', title: 'Pickup verified on Midnight', txHash });
    } catch (err) {
      setResult('invalid');
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDispense = () => {
    if (!proof) return;
    addDispensation({
      medicationType: proof.credential.medicationType,
      verifiedAt: Date.now(),
      nullifier: proof.nullifier,
    });
    setProofInput('');
    setProof(null);
    setResult(null);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold">Pharmacy Verifier</h2>
        <p className="text-gray-500 text-sm mt-1">Verify patient eligibility without seeing their diagnosis</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Verify Medication Access</h3>
            <textarea
              value={proofInput}
              onChange={(e) => setProofInput(e.target.value)}
              placeholder="Paste patient's proof data or QR content here..."
              rows={5}
              className="input w-full resize-none font-mono text-xs mb-4"
            />
            <button
              onClick={handleVerify}
              disabled={!proofInput.trim() || verifying}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full" />
                  Verifying on Midnight...
                </span>
              ) : 'Verify Proof'}
            </button>
          </div>

          <AnimatePresence>
            {result && proof && (
              <VerificationResult result={result} proof={proof} onDispense={handleDispense} />
            )}
          </AnimatePresence>
        </div>

        <DispensationLog />
      </div>
    </div>
  );
}
