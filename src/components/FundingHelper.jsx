import { useState } from 'react';
import PropTypes from 'prop-types';
import { Coins, Loader2 } from 'lucide-react';
import { FRIENDBOT_URL } from '../constants/network';

/**
 * FundingHelper component. Interacts with Stellar Friendbot to fund testnet accounts.
 */
export function FundingHelper({ publicKey, onFundingSuccess }) {
  const [isFunding, setIsFunding] = useState(false);
  const [fundingError, setFundingError] = useState(null);

  const triggerFriendbot = async () => {
    setIsFunding(true);
    setFundingError(null);
    try {
      const response = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
      if (!response.ok) {
        throw new Error('Friendbot response not OK');
      }
      // Friendbot returns JSON. Wait to parse it to confirm success.
      await response.json();
      onFundingSuccess();
    } catch (err) {
      console.error('Friendbot activation error:', err);
      setFundingError('Failed to activate account via Friendbot. Please try again.');
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <button
        onClick={triggerFriendbot}
        disabled={isFunding}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
          isFunding
            ? 'bg-success/50 text-white cursor-not-allowed border border-success/20'
            : 'bg-success hover:bg-success/90 text-slate-950 font-bold border border-success/20 active:scale-[0.98]'
        }`}
        aria-label="Fund account with testnet XLM"
      >
        {isFunding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span className="text-white">Funding Account...</span>
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 text-slate-950 fill-slate-950/10" />
            <span>Fund with Testnet XLM</span>
          </>
        )}
      </button>

      {fundingError && (
        <span className="text-xs text-error font-medium text-center">
          {fundingError}
        </span>
      )}

      <p className="text-[10px] text-appText-muted text-center italic mt-1 leading-normal">
        * This only works on Stellar Testnet. Never send real XLM here.
      </p>
    </div>
  );
}

FundingHelper.propTypes = {
  publicKey: PropTypes.string.isRequired,
  onFundingSuccess: PropTypes.func.isRequired,
};

export default FundingHelper;
