import { useStore } from '../../store/store';
import { MEDICATION_TYPES } from '../../midnight/types';

function getMedLabel(value: string): string {
  return MEDICATION_TYPES.find((m) => m.value === value)?.label ?? value;
}

export default function DispensationLog() {
  const { dispensations } = useStore();

  if (dispensations.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Dispensation Log</h3>
        <p className="text-midnight-400 text-sm">No dispensations yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Dispensation Log</h3>
      <div className="space-y-3">
        {dispensations.map((record, i) => (
          <div key={i} className="flex items-center justify-between py-3 px-4 bg-midnight-800/30 rounded-xl">
            <div>
              <p className="text-sm font-medium">{getMedLabel(record.medicationType)}</p>
              <p className="text-xs text-midnight-400">{new Date(record.verifiedAt).toLocaleString()}</p>
            </div>
            <div className="text-medical-green text-xs font-medium">Dispensed</div>
          </div>
        ))}
      </div>
    </div>
  );
}
