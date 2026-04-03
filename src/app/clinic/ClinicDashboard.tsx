import { motion } from 'framer-motion';
import { useStore } from '../../store/store';
import { generateRandomSecret } from '../../midnight/wallet';
import { computeIssuerIdFromSecret } from '../../midnight/contract';
import { registerIssuerOnChain } from '../../midnight/api';
import IssueCredentialForm from './IssueCredentialForm';
import IssuedCredentialsList from './IssuedCredentialsList';

export default function ClinicDashboard() {
  const { issuerRegistered, issuerId, setIssuerKeys, setIssuerRegistered, setLoading, setError, loading } = useStore();

  const handleRegisterIssuer = async () => {
    setLoading(true);
    setError(null);
    try {
      const secret = generateRandomSecret();
      const id = computeIssuerIdFromSecret(secret);
      setIssuerKeys(id, secret);
      await registerIssuerOnChain(id);
      setIssuerRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register issuer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold">Clinic Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Issue private medication credentials</p>
        </div>
        {!issuerRegistered ? (
          <button onClick={handleRegisterIssuer} disabled={loading} className="btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full" />
                Registering...
              </span>
            ) : 'Register as Issuer'}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            Registered Issuer
          </div>
        )}
      </div>
      {issuerRegistered && issuerId && (
        <div className="text-xs text-gray-400 mb-6 font-mono truncate">
          Issuer ID: {issuerId.slice(0, 16)}...{issuerId.slice(-8)}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <IssueCredentialForm />
        <IssuedCredentialsList />
      </div>
    </div>
  );
}
