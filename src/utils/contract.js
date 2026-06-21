import { rpc, Contract, Address, scValToNative, TransactionBuilder, Account, TimeoutInfinite } from '@stellar/stellar-sdk';
import { SOROBAN_RPC_URL, CONTRACT_ID, NETWORK_PASSPHRASE } from '../constants/network';

// Initialize Soroban RPC Server client
export const rpcServer = new rpc.Server(SOROBAN_RPC_URL);

// Contract helper instance
export const rentContract = new Contract(CONTRACT_ID);

/**
 * Simulates a contract invocation (read-only call).
 * 
 * @param {string} functionName Name of the contract function to call.
 * @param {Array} args Array of scVal arguments.
 * @returns {Promise<any>} The native JavaScript representation of the return value.
 */
export async function simulateCall(functionName, args = []) {
  // Use a dummy account and sequence number for simulation
  const dummyAccount = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
  
  const tx = new TransactionBuilder(dummyAccount, {
    fee: '100',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(rentContract.call(functionName, ...args))
    .setTimeout(TimeoutInfinite)
    .build();

  try {
    const response = await rpcServer.simulateTransaction(tx);
    
    if (rpc.Api.isSimulationSuccess(response)) {
      const resultVal = response.result.retval;
      return scValToNative(resultVal);
    } else {
      // Simulation failed, extract error message
      const errorMsg = response.error || 'Simulation failed';
      throw new Error(errorMsg);
    }
  } catch (err) {
    console.error(`Simulation call failed for ${functionName}:`, err);
    throw err;
  }
}

/**
 * Fetches the total amount of rent collected so far.
 * 
 * @returns {Promise<number>} Total collected amount.
 */
export async function fetchTotalPaid() {
  try {
    const val = await simulateCall('get_total_paid');
    // val is returned as BigInt or number. Convert to number for convenience.
    return Number(val);
  } catch (err) {
    console.error('Error fetching total paid:', err);
    throw err;
  }
}

/**
 * Fetches the remaining balance owed by a given roommate.
 * 
 * @param {string} roommateAddress The Stellar address to check.
 * @returns {Promise<number>} Amount still owed.
 */
export async function fetchBalanceOwed(roommateAddress) {
  if (!roommateAddress) return 0;
  try {
    const addrScVal = Address.fromString(roommateAddress).toScVal();
    const val = await simulateCall('get_balance', [addrScVal]);
    return Number(val);
  } catch (err) {
    console.error('Error fetching balance owed:', err);
    throw err;
  }
}
