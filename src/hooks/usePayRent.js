import { useState, useCallback } from 'react';
import { 
  rpc, 
  Address, 
  nativeToScVal, 
  TransactionBuilder, 
  TimeoutInfinite 
} from '@stellar/stellar-sdk';
import { rpcServer, rentContract } from '../utils/contract';
import { server as horizonServer } from '../utils/stellar';
import { NETWORK_PASSPHRASE } from '../constants/network';
import { classifyError } from '../utils/errors';

/**
 * Custom React hook to invoke pay_rent contract function.
 * Tracks granular state transitions: idle | building | awaiting_signature | submitting | pending | success | error.
 * 
 * @param {Function} signTransaction The signTransaction function from useWalletKit.
 * @returns {Object} { payRent, status, result, error, reset }
 */
export function usePayRent(signTransaction) {
  const [status, setStatus] = useState('idle'); // idle | building | awaiting_signature | submitting | pending | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  const payRent = useCallback(async ({ payerAddress, amount, isMock }) => {
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
          amount,
          recipient: 'Contract Ledger',
          isMock: true,
          isContractCall: true,
        });
        return;
      }

      // 1. Fetch sender account details from Horizon to get sequence number
      let sourceAccount;
      try {
        sourceAccount = await horizonServer.loadAccount(payerAddress);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          throw new Error("This account hasn't been funded yet. Use Friendbot to get test XLM.");
        }
        throw err;
      }

      // 2. Fetch base fee dynamically or default
      let baseFee = '100';
      try {
        const feeStats = await horizonServer.feeStats();
        baseFee = feeStats.fee_charged?.max || '100';
      } catch (err) {
        console.error('Failed to fetch fee stats, falling back to 100 stroops:', err);
      }

      // 3. Build initial Transaction
      const payerScVal = Address.fromString(payerAddress).toScVal();
      const amountScVal = nativeToScVal(amount, { type: 'i128' });

      const tx = new TransactionBuilder(sourceAccount, {
        fee: baseFee,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(rentContract.call('pay_rent', payerScVal, amountScVal))
        .setTimeout(TimeoutInfinite)
        .build();

      // 4. Simulate the transaction using Soroban RPC
      const simulationResponse = await rpcServer.simulateTransaction(tx);
      
      if (!rpc.Api.isSimulationSuccess(simulationResponse)) {
        // If simulation failed, attempt to parse the reason/error
        const errorMsg = simulationResponse.error || 'Soroban transaction simulation failed. Check if amount exceeds what is owed.';
        throw new Error(errorMsg);
      }

      // 5. Assemble transaction with simulation results (gas/resource fees)
      const assembledTx = rpc.assembleTransaction(tx, simulationResponse);

      // 6. Request signature from the wallet
      setStatus('awaiting_signature');
      const txXdr = assembledTx.toXDR();
      let signedXdr;
      try {
        signedXdr = await signTransaction(txXdr);
      } catch (err) {
        throw new Error(err.message || 'Signature rejected by user.');
      }

      // 7. Submit transaction to Soroban RPC
      setStatus('submitting');
      const signedTransaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
      const sendResponse = await rpcServer.sendTransaction(signedTransaction);

      if (sendResponse.status === 'ERROR') {
        throw new Error(sendResponse.errorResultXdr || 'Transaction submission error.');
      }

      const txHash = sendResponse.hash;
      
      // 8. Poll for transaction result on ledger
      setStatus('pending');
      let txStatus = sendResponse.status;
      let getTxResponse = null;

      while (txStatus === 'PENDING' || txStatus === 'NOT_FOUND') {
        // Wait 3 seconds between polls
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        getTxResponse = await rpcServer.getTransaction(txHash);
        txStatus = getTxResponse.status;

        if (txStatus === 'SUCCESS') {
          break;
        } else if (txStatus === 'FAILED') {
          const resultMetaXdr = getTxResponse.resultMetaXdr;
          console.error('Soroban Tx Failed Meta:', resultMetaXdr);
          throw new Error('Transaction execution failed on ledger.');
        }
      }

      setStatus('success');
      setResult({
        hash: txHash,
        amount,
        recipient: 'Contract Ledger',
        ledger: getTxResponse ? getTxResponse.ledger : null,
      });

    } catch (err) {
      console.error('Contract payment error:', err);
      setStatus('error');
      const classified = classifyError(err);
      setError(classified.message);
    }
  }, [signTransaction]);

  return {
    payRent,
    status,
    result,
    error,
    reset,
  };
}

export default usePayRent;
