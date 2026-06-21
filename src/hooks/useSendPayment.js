import { useState, useCallback } from 'react';
import { TransactionBuilder, Asset, Operation, Memo } from '@stellar/stellar-sdk';
import { server } from '../utils/stellar';
import { NETWORK_PASSPHRASE } from '../constants/network';
import { classifyError } from '../utils/errors';

/**
 * Custom React hook to build, sign, and send Stellar native payments.
 * Integrates the new transaction state machine: idle | building | awaiting_signature | submitting | pending | success | error.
 * 
 * @param {Function} signTransaction Sign function from the connected wallet.
 * @returns {Object} Payment state: { sendPayment, status, isLoading, result, error, reset }
 */
export function useSendPayment(signTransaction) {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  const sendPayment = useCallback(async ({ senderAddress, recipientAddress, amount, memo, isMock }) => {
    setStatus('building');
    setError(null);
    setResult(null);

    try {
      if (isMock) {
        // Simulate building & simulating
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Simulate signature request
        setStatus('awaiting_signature');
        await signTransaction(null); // mock signing delay
        
        // Simulate submitting
        setStatus('submitting');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Simulate pending on ledger
        setStatus('pending');
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        setStatus('success');
        setResult({
          hash: mockHash,
          ledger: 999999,
          amount,
          recipient: recipientAddress,
          isMock: true,
        });
        return;
      }

      // 1. Fetch sender account details
      let sourceAccount;
      try {
        sourceAccount = await server.loadAccount(senderAddress);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          throw new Error("This account hasn't been funded yet. Use Friendbot to get test XLM.");
        }
        throw err;
      }

      // 2. Fetch base fee dynamically or default
      let baseFee = '100';
      try {
        const feeStats = await server.feeStats();
        baseFee = feeStats.fee_charged?.max || '100';
      } catch (err) {
        console.error('Failed to fetch fee stats, falling back to 100 stroops:', err);
      }

      // 3. Build the Transaction
      const timeoutSeconds = 30;
      const maxTime = Math.floor(Date.now() / 1000) + timeoutSeconds;

      const txBuilder = new TransactionBuilder(sourceAccount, {
        fee: baseFee,
        networkPassphrase: NETWORK_PASSPHRASE,
        timebounds: {
          minTime: 0,
          maxTime: maxTime,
        },
      });

      // Add payment operation
      txBuilder.addOperation(
        Operation.payment({
          destination: recipientAddress,
          asset: Asset.native(),
          amount: amount.toString(),
        })
      );

      // Add text memo if provided
      if (memo && memo.trim().length > 0) {
        txBuilder.addMemo(Memo.text(memo.trim()));
      }

      const transaction = txBuilder.build();
      const txXdr = transaction.toXDR();

      // 4. Request signature from the wallet
      setStatus('awaiting_signature');
      let signedXdr;
      try {
        signedXdr = await signTransaction(txXdr);
      } catch (err) {
        throw new Error(err.message || 'Signature rejected by user.');
      }

      // 5. Submit the transaction to Horizon Testnet
      setStatus('submitting');
      const signedTransaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
      const submitResponse = await server.submitTransaction(signedTransaction);

      setStatus('pending');
      // Submitting is instant on Horizon SDK but we mock a brief confirmation phase for consistency
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 6. Set success results
      setStatus('success');
      setResult({
        hash: submitResponse.hash,
        ledger: submitResponse.ledger,
        amount,
        recipient: recipientAddress,
      });
    } catch (err) {
      console.error('Native Transaction processing error:', err);
      setStatus('error');
      const classified = classifyError(err);
      setError(classified.message);
    }
  }, [signTransaction]);

  const isLoading = ['building', 'awaiting_signature', 'submitting', 'pending'].includes(status);

  return {
    sendPayment,
    status,
    isLoading,
    result,
    error,
    reset,
  };
}

export default useSendPayment;
