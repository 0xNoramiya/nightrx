import { useStore } from '../../store/store';

export default function StatusIndicator() {
  const { walletConnected, contractDeployed } = useStore();

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            walletConnected ? 'bg-medical-green' : 'bg-midnight-600'
          }`}
        />
        <span className="text-midnight-400">
          {walletConnected ? 'Wallet' : 'No Wallet'}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            contractDeployed ? 'bg-medical-green' : 'bg-midnight-600'
          }`}
        />
        <span className="text-midnight-400">
          {contractDeployed ? 'Contract' : 'No Contract'}
        </span>
      </div>
    </div>
  );
}
