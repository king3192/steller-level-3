import PropTypes from 'prop-types';
import { Wallet, LogOut, Loader2, Sparkles, CreditCard } from 'lucide-react';
import { shortenAddress } from '../utils/format';

/**
 * Header component displaying the App brand and wallet controls.
 */
export function Header({
  publicKey,
  isConnecting,
  isMock,
  walletType,
  connectWallet,
  disconnectWallet,
  walletError,
}) {
  const isInstalledError = walletError && walletError.toLowerCase().includes('install');

  // Helper to get user-friendly wallet name
  const getWalletDisplayName = () => {
    if (isMock || walletType === 'mock') return 'Demo';
    if (!walletType) return 'Wallet';
    // Capitalize first letter
    return walletType.charAt(0).toUpperCase() + walletType.slice(1);
  };

  return (
    <header className="w-full border-b border-appBorder bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-2xl text-primary font-heading font-bold tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-6 h-6 text-accent fill-accent/10" />
            Rent<span className="text-white">Star</span>
          </span>
        </div>

        {/* Action Button */}
        <div>
          {publicKey ? (
            <div className="flex items-center space-x-2">
              {/* Wallet Type Badge */}
              <span className="flex items-center gap-1 text-[10px] bg-primary/10 border border-primary/25 px-2 py-1 rounded-md text-primary-hover font-bold uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-accent" />
                {getWalletDisplayName()}
              </span>

              <span className="hidden sm:inline-block text-xs bg-slate-900 border border-appBorder px-3 py-1.5 rounded-lg text-appText-muted font-mono">
                {shortenAddress(publicKey)}
              </span>
              <button
                onClick={disconnectWallet}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-appBorder hover:border-error hover:bg-error/10 hover:text-error text-appText-muted rounded-xl text-sm transition-all duration-300 font-medium group"
                aria-label="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : isInstalledError ? (
            <a
              href="https://www.freighter.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent to-primary hover:brightness-110 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg glow-pulse"
              aria-label="Install Wallet"
            >
              <Wallet className="w-4 h-4" />
              <span>Install Wallet</span>
            </a>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isConnecting
                  ? 'bg-primary/50 text-white cursor-not-allowed border border-primary/20'
                  : 'bg-primary hover:bg-primary-hover text-white hover:scale-[1.02] active:scale-[0.98] border border-primary/20 shadow-md shadow-primary/10'
              }`}
              aria-label="Connect Wallet"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  publicKey: PropTypes.string,
  isConnecting: PropTypes.bool.isRequired,
  isMock: PropTypes.bool,
  walletType: PropTypes.string,
  connectWallet: PropTypes.func.isRequired,
  disconnectWallet: PropTypes.func.isRequired,
  walletError: PropTypes.string,
};

Header.defaultProps = {
  publicKey: null,
  isMock: false,
  walletType: null,
  walletError: null,
};

export default Header;
