import PropTypes from 'prop-types';
import { Activity, ExternalLink, Calendar, User, ArrowRight } from 'lucide-react';
import { shortenAddress } from '../utils/format';
import { STELLAR_EXPERT_TESTNET } from '../constants/network';

/**
 * RecentActivity component showing live rent settlement events.
 */
export function RecentActivity({ events }) {
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return 'Just now';
    }
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-appBorder backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-4">
      <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
        <Activity className="w-5 h-5 text-accent" />
        Recent Rent Activity
      </h3>

      {events.length === 0 ? (
        <div className="text-center py-8 bg-slate-950/45 border border-appBorder/50 rounded-xl">
          <p className="text-sm text-appText-muted">No rent payments recorded yet.</p>
          <p className="text-xs text-appText-muted/65 mt-1">Be the first to settle rent on this contract!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {events.map((evt) => {
            const explorerUrl = `${STELLAR_EXPERT_TESTNET}/tx/${evt.txHash}`;
            return (
              <div 
                key={evt.id}
                className="bg-slate-950/45 border border-appBorder/50 hover:border-appBorder rounded-xl p-3 flex.col sm:flex sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors duration-200 animate-fade-in"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-white" title={evt.payer}>
                        {shortenAddress(evt.payer)}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-medium">
                        Paid Rent
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-appText-muted font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(evt.timestamp)} {formatTime(evt.timestamp)}
                      </span>
                      {evt.ledger && (
                        <span>Ledger #{evt.ledger}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-slate-900 sm:border-0">
                  <div className="text-left sm:text-right">
                    <span className="text-sm font-bold text-white font-heading">{evt.amount} XLM</span>
                    <p className="text-[9px] text-appText-muted">Total: {evt.total} XLM</p>
                  </div>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-900 hover:bg-slate-850 border border-appBorder rounded-lg text-appText-muted hover:text-white transition-colors"
                    title="View details on Stellar Expert"
                    aria-label="View transaction details on Stellar Expert"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

RecentActivity.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      payer: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      txHash: PropTypes.string.isRequired,
      ledger: PropTypes.number,
    })
  ).isRequired,
};

export default RecentActivity;
