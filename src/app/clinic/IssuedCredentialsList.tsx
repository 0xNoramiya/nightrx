import { useStore } from '../../store/store';
import { MEDICATION_TYPES } from '../../midnight/types';

function getMedLabel(value: string): string {
  return MEDICATION_TYPES.find((m) => m.value === value)?.label ?? value;
}

export default function IssuedCredentialsList() {
  const { issuedCredentials } = useStore();

  if (issuedCredentials.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Issued Credentials</h3>
        <p className="text-midnight-400 text-sm">No credentials issued yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Issued Credentials</h3>
      <div className="space-y-3">
        {issuedCredentials.map((record, i) => (
          <div key={i} className="flex items-center justify-between py-3 px-4 bg-midnight-800/30 rounded-xl">
            <div>
              <p className="text-sm font-medium">{getMedLabel(record.credential.medicationType)}</p>
              <p className="text-xs text-midnight-400">Issued {new Date(record.issuedAt).toLocaleDateString()}</p>
            </div>
            <div className="text-medical-green text-xs font-medium">Issued</div>
          </div>
        ))}
      </div>
    </div>
  );
}
