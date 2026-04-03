import { useEffect, useState } from 'react';
import { useStore } from '../../store/store';
import type { Credential } from '../../midnight/types';
import CredentialCard from './CredentialCard';
import ImportCredential from './ImportCredential';
import ProofGenerator from './ProofGenerator';

export default function PatientWallet() {
  const { credentials, loadCredentials } = useStore();
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Patient Wallet</h2>
        <p className="text-midnight-400 text-sm mt-1">Your credentials are stored privately on this device</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ImportCredential />
          {credentials.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">My Credentials</h3>
              <div className="space-y-3">
                {credentials.map((cred, i) => (
                  <CredentialCard key={i} credential={cred} selected={selectedCredential === cred} onSelect={() => setSelectedCredential(cred)} />
                ))}
              </div>
            </div>
          )}
          {credentials.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-midnight-400">No credentials yet</p>
              <p className="text-midnight-500 text-sm mt-1">Import a credential from your clinic</p>
            </div>
          )}
        </div>
        <div>
          {selectedCredential ? (
            <ProofGenerator credential={selectedCredential} />
          ) : (
            <div className="card text-center py-12">
              <p className="text-midnight-400">Select a credential</p>
              <p className="text-midnight-500 text-sm mt-1">Choose a credential to generate a proof</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
