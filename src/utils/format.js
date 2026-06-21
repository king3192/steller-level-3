/**
 * Shortens a Stellar public key to a readable format (e.g. GAAA...A123).
 * 
 * @param {string} address The full Stellar public key.
 * @returns {string} Shortened address string, or empty string.
 */
export function shortenAddress(address) {
  if (!address || typeof address !== 'string' || address.length < 10) {
    return '';
  }
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
}

/**
 * Formats a raw XLM balance string/number to exactly 7 decimal places.
 * 
 * @param {string|number} amount Raw balance amount.
 * @returns {string} Formatted XLM balance.
 */
export function formatXLM(amount) {
  const parsed = parseFloat(amount);
  if (isNaN(parsed)) {
    return '0.0000000';
  }
  return parsed.toLocaleString(undefined, {
    minimumFractionDigits: 7,
    maximumFractionDigits: 7,
  });
}
