import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';
import { deserializeCredential } from '../../credential/credential';
import { parseQR } from '../../credential/qr';

export default function ImportCredential() {
  const { addCredential, setError } = useStore();
  const [jsonInput, setJsonInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleImport = () => {
    try {
      let credential;
      try {
        const parsed = parseQR(jsonInput.trim());
        if (parsed.type !== 'credential') {
          throw new Error('Expected a credential QR, got: ' + parsed.type);
        }
        credential = parsed.data;
      } catch {
        credential = deserializeCredential(jsonInput.trim());
      }
      addCredential(credential);
      setJsonInput('');
      setShowInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credential data');
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Import Credential</h3>
      <div className="flex gap-3">
        <button onClick={() => setShowInput(!showInput)} className="btn-secondary flex-1">Paste JSON / QR Data</button>
      </div>
      <AnimatePresence>
        {showInput && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-4 space-y-3">
              <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} placeholder="Paste credential JSON or QR data here..." rows={4} className="input w-full resize-none font-mono text-xs" />
              <button onClick={handleImport} disabled={!jsonInput.trim()} className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">Import</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
