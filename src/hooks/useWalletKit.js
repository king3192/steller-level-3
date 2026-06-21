import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  StellarWalletsKit, 
  WalletNetwork, 
  FreighterModule, 
  AlbedoModule, 
  xBullModule 
} from '@creit.tech/stellar-wallets-kit';
import { NETWORK_PASSPHRASE } from '../constants/network';

/**
 * Custom React hook to manage connection state using StellarWalletsKit.
 * Supports Freighter, xBull, Albedo, and Mock Mode.
 * Exposes connect, disconnect, signTransaction, address, and walletType.
 */
export function useWalletKit() {
  const [publicKey, setPublicKey] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState(null); // 'freighter', 'xbull', 'albedo', 'mock', or null
  const [isMock, setIsMock] = useState(() => {
    return sessionStorage.getItem('rentstar_wallet_is_mock') === 'true';
  });
  const [error, setError] = useState(null);

  // Initialize StellarWalletsKit
  const kit = useMemo(() => {
    return new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      modules: [
        new FreighterModule(),
        new AlbedoModule(),
        new xBullModule(),
      ],
    });
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setIsMock(false);
    sessionStorage.removeItem('rentstar_wallet_is_mock');
    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();
            if (!address) {
              throw new Error('WALLET_LOCKED_OR_REJECTED');
            }
            setPublicKey(address);
            setWalletType(option.id);
            sessionStorage.setItem('rentstar_wallet_connected', 'true');
            sessionStorage.setItem('rentstar_wallet_type', option.id);
          } catch (err) {
            console.error('Wallet select connection error:', err);
            setError(err.message || 'Connection rejected or wallet locked.');
          }
        },
      });
    } catch (err) {
      console.error('StellarWalletsKit modal error:', err);
      setError(err.message || 'Wallet connection failed.');
    } finally {
      setIsConnecting(false);
    }
  }, [kit]);

  const connectMockWallet = useCallback(() => {
    setIsConnecting(true);
    setError(null);
    setTimeout(() => {
      const mockAddress = 'GA7R2U6L26QG3NDXQ4Q6XCY36PZXZVUNH2QLJ34KYY3LMXJ2P3JNZQLS';
      setPublicKey(mockAddress);
      setWalletType('mock');
      setIsMock(true);
      sessionStorage.setItem('rentstar_wallet_connected', 'true');
      sessionStorage.setItem('rentstar_wallet_is_mock', 'true');
      setIsConnecting(false);
    }, 500);
  }, []);

  const disconnectWallet = useCallback(() => {
    setPublicKey(null);
    setWalletType(null);
    setIsMock(false);
    setError(null);
    setIsConnecting(false);
    sessionStorage.removeItem('rentstar_wallet_connected');
    sessionStorage.removeItem('rentstar_wallet_type');
    sessionStorage.removeItem('rentstar_wallet_is_mock');
  }, []);

  // Multi-wallet signing helper
  const signTransaction = useCallback(async (txXdr) => {
    if (isMock) {
      // Return a simulated signature delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return txXdr; // mock mode bypasses real signing
    }

    if (!walletType) {
      throw new Error('No wallet selected to sign transaction.');
    }

    try {
      let signedXdr;
      // Dynamically handle different StellarWalletsKit SDK versions (signTransaction vs sign)
      if (typeof kit.signTransaction === 'function') {
        signedXdr = await kit.signTransaction(txXdr, {
          network: WalletNetwork.TESTNET,
          networkPassphrase: NETWORK_PASSPHRASE,
          address: publicKey,
        });
      } else if (typeof kit.sign === 'function') {
        const res = await kit.sign({
          xdr: txXdr,
          publicKey: publicKey,
          network: WalletNetwork.TESTNET,
        });
        signedXdr = res.signedTxXdr || res.signedXDR || res;
      } else {
        throw new Error('No transaction signing method found on StellarWalletsKit instance.');
      }

      return signedXdr;
    } catch (err) {
      console.error('WalletKit signature error:', err);
      throw err;
    }
  }, [kit, isMock, walletType, publicKey]);

  // Handle auto-connect on mount/refresh
  useEffect(() => {
    const wasConnected = sessionStorage.getItem('rentstar_wallet_connected') === 'true';
    const storedType = sessionStorage.getItem('rentstar_wallet_type');
    const wasMock = sessionStorage.getItem('rentstar_wallet_is_mock') === 'true';

    if (wasConnected) {
      if (wasMock) {
        connectMockWallet();
      } else if (storedType) {
        setIsConnecting(true);
        try {
          kit.setWallet(storedType);
          kit.getAddress()
            .then(({ address }) => {
              if (address) {
                setPublicKey(address);
                setWalletType(storedType);
              } else {
                disconnectWallet();
              }
            })
            .catch((err) => {
              console.error('Auto-connect getAddress failed:', err);
              disconnectWallet();
            })
            .finally(() => {
              setIsConnecting(false);
            });
        } catch (err) {
          console.error('Auto-connect setWallet failed:', err);
          setIsConnecting(false);
          disconnectWallet();
        }
      }
    }
  }, [kit, connectMockWallet, disconnectWallet]);

  return {
    publicKey,
    isConnected: !!publicKey,
    isConnecting,
    isMock,
    walletType,
    connectWallet,
    connectMockWallet,
    disconnectWallet,
    signTransaction,
    error,
  };
}

export default useWalletKit;