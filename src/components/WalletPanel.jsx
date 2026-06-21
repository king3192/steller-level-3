import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { shortenAddress, formatXLM } from '../utils/format';

/**
 * WalletPanel component. Displays account address (copyable) and XLM balance.
 */
export function WalletPanel({
  publicKey,
  balance,
  isLoading,
  balanceError,
  walletType,
  refetchBalance,
  fundingHelperNode,
}) {
  const [copied, setCopied] = useState(false);
  const [flashUpdate, setFlashUpdate] = useState(false);

  // Copy to clipboard helper
  const handleCopy = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Trigger brief green flash animation when balance changes
  useEffect(() => {
    if (balance !== null) {
      setFlashUpdate(true);
      const timer = setTimeout(() => setFlashUpdate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [balance]);

  const isUnfunded = balanceError === 'UNFUNDED';

  const getWalletName = () => {
    if (walletType === 'mock') return 'Demo Wallet';
    if (!walletType) return 'Stellar Wallet';
    return `${walletType.charAt(0).toUpperCase() + walletType.slice(1)} Wallet`;
  };

  return (
    <section className="w-full bg-slate-900/80 border border-appBorder backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col space-y-4">
        {/* Wallet Address Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-appText-muted font-medium uppercase tracking-wider flex items-center gap-1.5">
              <span>Connected Address</span>
              <span className="text-[10px] bg-slate-800 border border-appBorder px-1.5 py-0.5 rounded text-accent font-bold capitalize">
                {getWalletName()}
              </span>
            </span>
            <span className="text-sm font-mono font-semibold text-white mt-0.5">
              {shortenAddress(publicKey)}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 bg-slate-850 hover:bg-slate-800 text-appText-muted hover:text-white border border-appBorder rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/45"
            title="Copy Wallet Address"
            aria-label="Copy Wallet Address to Clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-appBorder w-full" />

        {/* Balance Status */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-appText-muted font-medium uppercase tracking-wider">
              Available Balance
            </span>
            {isLoading && balance === null ? (
              // Loading Skeleton
              <div className="h-8 w-32 bg-slate-850 animate-pulse rounded-lg mt-1" />
            ) : (
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span
                  className={`text-2xl font-bold font-heading text-white transition-all duration-300 ${
                    flashUpdate ? 'balance-flash' : ''
                  }`}
                >
                  {formatXLM(balance)}
                </span>
                <span className="text-sm font-bold text-accent font-heading">XLM</span>
              </div>
            )}
          </div>

          <button
            onClick={refetchBalance}
            disabled={isLoading}
            className={`p-2 bg-slate-850 hover:bg-slate-800 text-appText-muted hover:text-white border border-appBorder rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/45 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Refresh Balance"
            aria-label="Refresh Balance"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Unfunded Alert and Helper */}
        {isUnfunded && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4 mt-2 text-sm text-appText flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-error">Account not funded yet</p>
                <p className="text-appText-muted text-xs mt-0.5 leading-relaxed">
                  This address doesn&#39;t exist on the Stellar Testnet ledger yet. You need to request testnet XLM to activate it.
                </p>
              </div>
            </div>
            {fundingHelperNode}
          </div>
        )}
      </div>
    </section>
  );
}

WalletPanel.propTypes = {
  publicKey: PropTypes.string.isRequired,
  balance: PropTypes.string,
  isLoading: PropTypes.bool.isRequired,
  balanceError: PropTypes.string,
  walletType: PropTypes.string,
  refetchBalance: PropTypes.func.isRequired,
  fundingHelperNode: PropTypes.node,
};

WalletPanel.defaultProps = {
  balance: null,
  balanceError: null,
  walletType: null,
  fundingHelperNode: null,
};

export default WalletPanel;
