import { useState, useEffect, useCallback, useRef } from 'react';
import { server } from '../utils/stellar';

/**
 * Custom React hook to fetch and poll XLM balance for a public key from Stellar Horizon.
 * Automatically refreshes the balance every 10 seconds.
 * 
 * @param {string|null} publicKey The Stellar public key to poll.
 * @returns {Object} Balance state: { balance, isLoading, error, refetch }
 */
export function useBalance(publicKey, isMock = false) {
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchBalance = useCallback(async (showLoading = true) => {
    if (!publicKey) {
      setBalance(null);
      setError(null);
      return;
    }

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    if (isMock) {
      setBalance('10000.0000000');
      if (showLoading) {
        setIsLoading(false);
      }
      return;
    }

    try {
      const account = await server.loadAccount(publicKey);
      const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
      if (nativeBalance) {
        setBalance(nativeBalance.balance);
      } else {
        setBalance('0.0000000');
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      // Horizon returns 404 if the account is not yet funded on the ledger
      if (err.response && err.response.status === 404) {
        setError('UNFUNDED');
        setBalance('0.0000000');
      } else {
        setError('Stellar network error. Please try again in a moment.');
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [publicKey, isMock]);

  // Set up polling logic when publicKey is active
  useEffect(() => {
    fetchBalance(true);

    if (publicKey) {
      intervalRef.current = setInterval(() => {
        // Poll silently in the background without triggering loading spinners
        fetchBalance(false);
      }, 10000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [publicKey, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: () => fetchBalance(true),
  };
}
export default useBalance;
