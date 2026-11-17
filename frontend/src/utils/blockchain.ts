import { CHAIN_ID, CHAIN_NAME, RPC_URL } from '../config/constants';

export async function switchToHardhatNetwork(): Promise<boolean> {
  if (!window.ethereum) return false;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch (switchError: unknown) {
    const err = switchError as { code: number };
    if (err.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${CHAIN_ID.toString(16)}`,
            chainName: CHAIN_NAME,
            rpcUrls: [RPC_URL],
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          }],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export function isCorrectNetwork(chainId: number | null): boolean {
  return chainId === CHAIN_ID;
}
