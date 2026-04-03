import { useStore } from '../../store/store';

export default function StatusIndicator() {
  const { walletConnected, contractDeployed } = useStore();

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            walletConnected ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        />
        <span className="text-gray-500">
          {walletConnected ? 'Wallet' : 'No Wallet'}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            contractDeployed ? 'bg-emerald-500' : 'bg-gray-300'
          }`}
        />
        <span className="text-gray-500">
          {contractDeployed ? 'Contract' : 'No Contract'}
        </span>
      </div>
    </div>
  );
}
