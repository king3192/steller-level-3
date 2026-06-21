/**
 * Error classifications for RentStar dApp.
 */
export const ERROR_TYPES = {
  WALLET_ERROR: 'WALLET_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  CONTRACT_OR_NETWORK_ERROR: 'CONTRACT_OR_NETWORK_ERROR',
};

/**
 * Classifies an error thrown by the Stellar network, Soroban RPC, or wallet extensions.
 * Returns an object containing the error category and a user-friendly message.
 * 
 * @param {Error|string|Object} err The error to analyze.
 * @returns {Object} { type: string, message: string }
 */
export function classifyError(err) {
  if (!err) {
    return {
      type: ERROR_TYPES.CONTRACT_OR_NETWORK_ERROR,
      message: 'An unknown error occurred.',
    };
  }

  const errMsg = typeof err === 'string' ? err : (err.message || '');
  const lowerMsg = errMsg.toLowerCase();

  // 1. WALLET_ERROR
  // User cancels, rejects, declines signature/connection or wallet is missing
  if (
    lowerMsg.includes('decline') ||
    lowerMsg.includes('cancel') ||
    lowerMsg.includes('reject') ||
    lowerMsg.includes('user rejected') ||
    lowerMsg.includes('wallet_locked_or_rejected') ||
    lowerMsg.includes('wallet not found') ||
    lowerMsg.includes('install') ||
    lowerMsg.includes('no wallet') ||
    lowerMsg.includes('no sign method') ||
    lowerMsg.includes('freighter signature failed')
  ) {
    let msg = 'Wallet connection or signature was rejected or timed out.';
    if (lowerMsg.includes('install') || lowerMsg.includes('no wallet')) {
      msg = 'No wallet extension detected. Please install Freighter, xBull, or Albedo to continue.';
    } else if (lowerMsg.includes('cancel') || lowerMsg.includes('user rejected')) {
      msg = 'Transaction signing was cancelled. Please authorize the request in your wallet.';
    }
    return {
      type: ERROR_TYPES.WALLET_ERROR,
      message: msg,
    };
  }

  // 2. INSUFFICIENT_BALANCE
  // Underfunded account (op_underfunded), lack of native XLM reserves, or contract panics related to limits
  const isUnderfunded = 
    lowerMsg.includes('op_underfunded') ||
    lowerMsg.includes('underfunded') ||
    lowerMsg.includes('insufficient balance') ||
    lowerMsg.includes('insufficient funds') ||
    lowerMsg.includes('insufficient_balance') ||
    lowerMsg.includes('not funded') ||
    lowerMsg.includes('friendbot') ||
    // Soroban contract panic codes: 
    // AlreadyPaid = 1, AmountExceedsOwed = 5
    lowerMsg.includes('contract, #1') || // AlreadyPaid panic
    lowerMsg.includes('contract, #5') || // AmountExceedsOwed panic
    lowerMsg.includes('already paid') ||
    lowerMsg.includes('amount exceeds') ||
    lowerMsg.includes('exceeds what\'s owed') ||
    (err.response && err.response.data && JSON.stringify(err.response.data).includes('op_underfunded'));

  if (isUnderfunded) {
    let msg = 'Insufficient balance. Make sure your account has enough XLM to pay rent + transaction fee (including the 1 XLM base reserve).';
    if (lowerMsg.includes('contract, #1') || lowerMsg.includes('already paid')) {
      msg = 'Rent payment rejected: The rent for this contract has already been fully paid!';
    } else if (lowerMsg.includes('contract, #5') || lowerMsg.includes('amount exceeds') || lowerMsg.includes('exceeds what\'s owed')) {
      msg = 'Rent payment rejected: The payment amount exceeds the remaining rent balance owed.';
    } else if (lowerMsg.includes('not funded')) {
      msg = 'Account not active. Use the Funding Helper (Friendbot) to fund and activate your wallet on Testnet.';
    }
    return {
      type: ERROR_TYPES.INSUFFICIENT_BALANCE,
      message: msg,
    };
  }

  // 3. CONTRACT_OR_NETWORK_ERROR
  // RPC simulation failure, invalid arguments, network timeout, submission failure, contract not initialized, etc.
  let networkOrContractMsg = 'Stellar network or contract execution failure. Please try again.';

  if (lowerMsg.includes('timeout') || lowerMsg.includes('network error') || lowerMsg.includes('408')) {
    networkOrContractMsg = 'Request timed out or connection failed. Please check your internet connection and try again.';
  } else if (lowerMsg.includes('contract, #3') || lowerMsg.includes('not initialized')) {
    networkOrContractMsg = 'Contract Error: The rent contract has not been initialized by the landlord yet.';
  } else if (lowerMsg.includes('contract, #4') || lowerMsg.includes('already initialized')) {
    networkOrContractMsg = 'Contract Error: The rent contract has already been initialized.';
  } else if (lowerMsg.includes('contract, #2') || lowerMsg.includes('invalid amount')) {
    networkOrContractMsg = 'Contract Error: Invalid payment amount. The amount must be greater than zero.';
  } else if (lowerMsg.includes('simulation') || lowerMsg.includes('simulate') || lowerMsg.includes('invalid input')) {
    networkOrContractMsg = 'Soroban contract execution simulation failed. Please verify your inputs (e.g. valid public keys and non-zero amounts).';
  } else if (err.response && err.response.status === 404) {
    networkOrContractMsg = 'Network Error: Horizon server could not locate resource. Verify network endpoint.';
  }

  return {
    type: ERROR_TYPES.CONTRACT_OR_NETWORK_ERROR,
    message: networkOrContractMsg,
  };
}

export default classifyError;
