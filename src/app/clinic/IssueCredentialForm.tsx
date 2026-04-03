import { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { useStore } from '../../store/store';
import { MEDICATION_TYPES } from '../../midnight/types';
import { createCredential } from '../../credential/credential';
import { computeCommitment } from '../../midnight/contract';
import { credentialToQR } from '../../credential/qr';

export default function IssueCredentialForm() {
  const { issuerId, issuerRegistered, addIssuedCredential, setLoading, setError } = useStore();

  const [medicationType, setMedicationType] = useState(MEDICATION_TYPES[0].value);
  const [validMonths, setValidMonths] = useState(6);
  const [issuedCredentialQR, setIssuedCredentialQR] = useState<string | null>(null);

  const handleIssue = async () => {
    if (!issuerId || !issuerRegistered) {
      setError('Register as an issuer first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + validMonths);

      const credential = createCredential({
        issuerId,
        medicationType,
        validFrom: now,
        expiryDate: expiry,
      });

      const commitment = computeCommitment(credential);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      addIssuedCredential({
        credential,
        commitment,
        issuedAt: Date.now(),
      });

      setIssuedCredentialQR(credentialToQR(credential));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Issue New Credential</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-midnight-300 mb-1.5">Medication Type</label>
          <select value={medicationType} onChange={(e) => setMedicationType(e.target.value)} className="input w-full">
            {MEDICATION_TYPES.map((med) => (
              <option key={med.value} value={med.value}>{med.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-midnight-300 mb-1.5">Validity Period</label>
          <select value={validMonths} onChange={(e) => setValidMonths(Number(e.target.value))} className="input w-full">
            <option value={1}>1 month</option>
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
        </div>
        <button onClick={handleIssue} className="btn-primary w-full">Issue Credential</button>
      </div>
      {issuedCredentialQR && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 p-6 bg-white rounded-xl flex flex-col items-center gap-4">
          <p className="text-midnight-900 text-sm font-medium">Scan to import credential</p>
          <QRCode value={issuedCredentialQR} size={200} />
          <button onClick={() => navigator.clipboard.writeText(issuedCredentialQR)} className="text-xs text-midnight-500 hover:text-midnight-700 underline">Copy as JSON</button>
        </motion.div>
      )}
    </div>
  );
}
