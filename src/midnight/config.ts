export const NETWORK_CONFIG = {
  local: {
    networkId: 'undeployed' as const,
    indexer: 'http://localhost:8088/api/v3/graphql',
    indexerWS: 'ws://localhost:8088/api/v3/graphql/ws',
    node: 'http://localhost:9944',
    proofServer: 'http://localhost:6300',
  },
  preprod: {
    networkId: 'preprod' as const,
    indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: 'http://localhost:6300',
  },
} as const;

export type NetworkName = keyof typeof NETWORK_CONFIG;

export function getNetworkConfig(network: NetworkName = 'local') {
  return NETWORK_CONFIG[network];
}
