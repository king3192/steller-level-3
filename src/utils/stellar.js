import { Horizon } from '@stellar/stellar-sdk';
import { HORIZON_URL } from '../constants/network';

// Initialize the Stellar Horizon Server client for Testnet
export const server = new Horizon.Server(HORIZON_URL);

/**
 * Fetches details for a specific Stellar account.
 * Throws an error if the request fails, or returns the account object.
 * 
 * @param {string} publicKey The Stellar public key to fetch.
 * @returns {Promise<Object>} The Stellar account object.
 */
export async function fetchAccount(publicKey) {
  if (!publicKey) {
    throw new Error('Public key is required to fetch account.');
  }
  return server.loadAccount(publicKey);
}

/**
 * Checks if a Stellar account exists on the Testnet ledger.
 * 
 * @param {string} publicKey The Stellar public key to verify.
 * @returns {Promise<boolean>} True if the account exists, false otherwise.
 */
export async function accountExists(publicKey) {
  try {
    await fetchAccount(publicKey);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
}
