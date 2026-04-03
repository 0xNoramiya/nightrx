import { motion } from 'framer-motion';
import type { Credential } from '../../midnight/types';
import { MEDICATION_TYPES } from '../../midnight/types';
import { isCredentialActive, isCredentialExpired } from '../../credential/credential';

function getMedLabel(value: string): string {
  return MEDICATION_TYPES.find((m) => m.value === value)?.label ?? value;
}

interface Props {
  credential: Credential;
  selected: boolean;
  onSelect: () => void;
}

export default function CredentialCard({ credential, selected, onSelect }: Props) {
  const active = isCredentialActive(credential);
  const expired = isCredentialExpired(credential);

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left card transition-all ${
        selected ? 'ring-2 ring-midnight-400 border-midnight-400/50' : 'hover:border-midnight-600/50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{getMedLabel(credential.medicationType)}</p>
          <p className="text-sm text-midnight-400 mt-1 font-mono">Issuer: {credential.issuerId.slice(0, 12)}...</p>
        </div>
        <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          active ? 'bg-medical-green/10 text-medical-green' : expired ? 'bg-medical-red/10 text-medical-red' : 'bg-medical-amber/10 text-medical-amber'
        }`}>
          {active ? 'Active' : expired ? 'Expired' : 'Pending'}
        </div>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-midnight-400">
        <span>From: {new Date(credential.validFrom * 1000).toLocaleDateString()}</span>
        <span>Expires: {new Date(credential.expiryDate * 1000).toLocaleDateString()}</span>
      </div>
    </motion.button>
  );
}
