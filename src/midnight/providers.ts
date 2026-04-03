import { getNetworkConfig, type NetworkName } from './config';

export interface MidnightProviders {
  proofServerUrl: string;
  indexerUrl: string;
  indexerWsUrl: string;
  nodeUrl: string;
  networkId: string;
}

export function createProviders(network: NetworkName = 'local'): MidnightProviders {
  const config = getNetworkConfig(network);
  return {
    proofServerUrl: config.proofServer,
    indexerUrl: config.indexer,
    indexerWsUrl: config.indexerWS,
    nodeUrl: config.node,
    networkId: config.networkId,
  };
}
