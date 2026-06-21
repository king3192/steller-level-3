import { useState, useEffect, useCallback } from 'react';
import { isConnected, requestAccess, getPublicKey } from '@stellar/freighter-api';

/**
 * Custom React hook to manage connection state with the Freighter wallet.
 * Supports auto-connect using sessionStorage.
 * 
 * @returns {Object} Connection state and actions: { publicKey, isConnected, isConnecting, isMock, connectWallet, connectMockWallet, disconnectWallet, error }
 */
export function useWallet() {
  const [publicKey, setPublicKey] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMock, setIsMock] = useState(() => {
    return sessionStorage.getItem('rentstar_wallet_is_mock') === 'true';
  });
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setIsMock(false);
    sessionStorage.removeItem('rentstar_wallet_is_mock');
    try {
      // 1. Check if Freighter extension is installed in browser
      const connectionStatus = await isConnected();
      const freighterInstalled = connectionStatus && (
        typeof connectionStatus === 'boolean' 
          ? connectionStatus 
          : connectionStatus.isConnected
      );
      if (!freighterInstalled) {
        throw new Error('FREIGHTER_NOT_INSTALLED');
      }

      // 2. Request user authorization / access
      let address = '';
      try {
        const access = await requestAccess();
        if (typeof access === 'string') {
          address = access;
        } else if (access && access.address) {
          address = access.address;
        } else if (access && access.error) {
          throw new Error(access.error);
        }
      } catch (accessErr) {
        console.error('Request access error:', accessErr);
      }

      // 3. Fallback to getPublicKey if requestAccess didn't return address directly
      if (!address) {
        try {
          address = await getPublicKey();
        } catch (pubKeyErr) {
          console.error('getPublicKey error:', pubKeyErr);
        }
      }

      if (!address) {
        throw new Error('WALLET_LOCKED_OR_REJECTED');
      }

      // 4. Store in local state and sessionStorage for reload persistence
      setPublicKey(address);
      sessionStorage.setItem('rentstar_wallet_connected', 'true');
    } catch (err) {
      console.error('Freighter connection error:', err);
      if (err.message === 'FREIGHTER_NOT_INSTALLED') {
        setError('Please install the Freighter wallet extension to continue.');
      } else {
        setError('Wallet connection failed or rejected by user.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectMockWallet = useCallback(() => {
    setIsConnecting(true);
    setError(null);
    // Simulate connection delay
    setTimeout(() => {
      // Active testnet address with public ledger visibility (can be funded via friendbot if needed)
      const mockAddress = 'GA7R2U6L26QG3NDXQ4Q6XCY36PZXZVUNH2QLJ34KYY3LMXJ2P3JNZQLS';
      setPublicKey(mockAddress);
      setIsMock(true);
      sessionStorage.setItem('rentstar_wallet_connected', 'true');
      sessionStorage.setItem('rentstar_wallet_is_mock', 'true');
      setIsConnecting(false);
    }, 500);
  }, []);

  const disconnectWallet = useCallback(() => {
    setPublicKey(null);
    setIsMock(false);
    setError(null);
    setIsConnecting(false);
    sessionStorage.removeItem('rentstar_wallet_connected');
    sessionStorage.removeItem('rentstar_wallet_is_mock');
  }, []);

  // Attempt auto-connect if page is reloaded and user previously connected
  useEffect(() => {
    const wasConnected = sessionStorage.getItem('rentstar_wallet_connected') === 'true';
    if (wasConnected) {
      const wasMock = sessionStorage.getItem('rentstar_wallet_is_mock') === 'true';
      if (wasMock) {
        connectMockWallet();
      } else {
        connectWallet();
      }
    }
  }, [connectWallet, connectMockWallet]);

  return {
    publicKey,
    isConnected: !!publicKey,
    isConnecting,
    isMock,
    connectWallet,
    connectMockWallet,
    disconnectWallet,
    error,
  };
}

export default useWallet;
