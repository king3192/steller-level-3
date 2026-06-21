import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  RotateCcw, 
  Hammer, 
  PenTool, 
  ArrowUpRight, 
  Hourglass,
  Loader2
} from 'lucide-react';
import { shortenAddress, formatXLM } from '../utils/format';
import { STELLAR_EXPERT_TESTNET } from '../constants/network';

/**
 * TransactionStatus component showing the transaction state machine progress and results.
 */
export function TransactionStatus({ status, result, error, onReset }) {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = async () => {
    if (!result || !result.hash) return;
    try {
      await navigator.clipboard.writeText(result.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy transaction hash:', err);
    }
  };

  // If status is idle or not provided and we don't have result/error, do not render
  if (status === 'idle' && !result && !error) {
    return null;
  }

  // 1. Render Loading States (building, awaiting_signature, submitting, pending)
  const isLoading = ['building', 'awaiting_signature', 'submitting', 'pending'].includes(status);
  
  if (isLoading) {
    let title = 'Processing Transaction';
    let description = 'Preparing your rent settlement...';
    let stepIndex = 0; // 0: building, 1: sign, 2: submit, 3: pending

    if (status === 'building') {
      title = 'Building Transaction';
      description = 'Simulating Soroban smart contract and calculating network resources...';
      stepIndex = 0;
    } else if (status === 'awaiting_signature') {
      title = 'Awaiting Signature';
      description = 'Please approve and sign the transaction in your connected wallet.';
      stepIndex = 1;
    } else if (status === 'submitting') {
      title = 'Submitting to Network';
      description = 'Broadcasting transaction payload to the Stellar Testnet...';
      stepIndex = 2;
    } else if (status === 'pending') {
      title = 'Pending Ledger Confirmation';
      description = 'Waiting for consensus validators to finalize transaction on the ledger...';
      stepIndex = 3;
    }

    return (
      <div className="w-full bg-slate-900/80 border border-appBorder/80 backdrop-blur-md rounded-2xl p-6 shadow-xl text-center space-y-6 animate-fade-in relative overflow-hidden">
        {/* Background glow animation */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
        
        {/* Pulsing Spinner */}
        <div className="mx-auto flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full glow-pulse">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold font-heading text-white">{title}</h3>
          <p className="text-xs text-appText-muted leading-relaxed px-4">
            {description}
          </p>
        </div>

        {/* Step-by-Step Progress Checklist */}
        <div className="bg-slate-950/65 border border-appBorder rounded-xl p-3.5 text-left text-xs space-y-2.5 max-w-xs mx-auto">
          {/* Step 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-appText-muted">
              <Hammer className={`w-3.5 h-3.5 ${stepIndex === 0 ? 'text-primary animate-pulse' : stepIndex > 0 ? 'text-success' : ''}`} />
              <span className={stepIndex === 0 ? 'text-white font-semibold' : stepIndex > 0 ? 'line-through opacity-75' : ''}>
                1. Simulate & Build
              </span>
            </div>
            {stepIndex > 0 ? (
              <Check className="w-3.5 h-3.5 text-success font-bold" />
            ) : stepIndex === 0 ? (
              <span className="text-[10px] text-primary animate-pulse font-medium">Running...</span>
            ) : null}
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-appText-muted">
              <PenTool className={`w-3.5 h-3.5 ${stepIndex === 1 ? 'text-accent animate-pulse' : stepIndex > 1 ? 'text-success' : ''}`} />
              <span className={stepIndex === 1 ? 'text-white font-semibold' : stepIndex > 1 ? 'line-through opacity-75' : ''}>
                2. Request Signature
              </span>
            </div>
            {stepIndex > 1 ? (
              <Check className="w-3.5 h-3.5 text-success font-bold" />
            ) : stepIndex === 1 ? (
              <span className="text-[10px] text-accent animate-pulse font-medium">Signing...</span>
            ) : null}
          </div>

          {/* Step 3 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-appText-muted">
              <ArrowUpRight className={`w-3.5 h-3.5 ${stepIndex === 2 ? 'text-accent animate-pulse' : stepIndex > 2 ? 'text-success' : ''}`} />
              <span className={stepIndex === 2 ? 'text-white font-semibold' : stepIndex > 2 ? 'line-through opacity-75' : ''}>
                3. Submit to Testnet
              </span>
            </div>
            {stepIndex > 2 ? (
              <Check className="w-3.5 h-3.5 text-success font-bold" />
            ) : stepIndex === 2 ? (
              <span className="text-[10px] text-accent animate-pulse font-medium">Broadcasting...</span>
            ) : null}
          </div>

          {/* Step 4 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-appText-muted">
              <Hourglass className={`w-3.5 h-3.5 ${stepIndex === 3 ? 'text-amber-400 animate-spin' : ''}`} />
              <span className={stepIndex === 3 ? 'text-white font-semibold' : ''}>
                4. Ledger Confirmation
              </span>
            </div>
            {stepIndex === 3 ? (
              <span className="text-[10px] text-amber-400 animate-pulse font-medium">Pending...</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Error State
  if (error || status === 'error') {
    return (
      <div className="w-full bg-slate-900/80 border border-error/25 backdrop-blur-md rounded-2xl p-6 shadow-xl text-center space-y-5 animate-fade-in">
        <div className="mx-auto flex items-center justify-center w-14 h-14 bg-error/15 rounded-full">
          <XCircle className="w-8 h-8 text-error" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl font-bold font-heading text-white">Transaction Failed</h3>
          <p className="text-xs text-appText-muted leading-relaxed px-2">
            {error || 'An unexpected Stellar/Soroban error occurred. Please verify your details.'}
          </p>
        </div>

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-850 hover:bg-slate-800 text-white border border-appBorder rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
          aria-label="Try transaction again"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // 3. Render Success State
  if (result || status === 'success') {
    const explorerUrl = `${STELLAR_EXPERT_TESTNET}/tx/${result?.hash}`;
    const isContractCall = result?.isContractCall;

    return (
      <div className="w-full bg-slate-900/80 border border-success/25 backdrop-blur-md rounded-2xl p-6 shadow-xl text-center space-y-6 animate-fade-in">
        <div className="mx-auto flex items-center justify-center w-14 h-14 bg-success/15 rounded-full">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold font-heading text-white">
            {isContractCall ? 'Contract Invoked!' : 'Payment Sent!'}
          </h3>
          <p className="text-xs text-appText-muted font-medium">
            {isContractCall 
              ? 'Rent logged on smart contract ledger' 
              : 'Roommate rent settled successfully'}
          </p>
        </div>

        {/* Info Grid */}
        <div className="bg-slate-950/60 border border-appBorder rounded-xl p-4 text-left text-sm space-y-3">
          <div className="flex justify-between">
            <span className="text-appText-muted font-medium">Amount:</span>
            <span className="font-bold text-white">
              {result?.amount} XLM
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-appText-muted font-medium">Recipient:</span>
            <span className="font-mono text-white font-semibold truncate max-w-[180px]" title={result?.recipient}>
              {result?.recipient === 'Contract Ledger' ? 'rent_split contract' : shortenAddress(result?.recipient)}
            </span>
          </div>

          <div className="h-px bg-appBorder my-2" />

          {/* Monospace Hash */}
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] text-appText-muted font-medium uppercase tracking-wider">
              Transaction Hash
            </span>
            <div className="flex items-center justify-between gap-2 bg-slate-900/85 border border-appBorder px-2.5 py-1.5 rounded-lg">
              <span className="text-xs font-mono text-appText truncate select-all">
                {result?.hash}
              </span>
              <button
                onClick={handleCopyHash}
                className="text-appText-muted hover:text-white shrink-0 p-1 rounded hover:bg-slate-800 transition-colors"
                title="Copy Hash"
                aria-label="Copy Transaction Hash to Clipboard"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-md shadow-primary/10 hover:scale-[1.01]"
            aria-label="View transaction on Stellar Expert"
          >
            <span>View on Stellar Expert</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-850 hover:bg-slate-800 text-appText border border-appBorder rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.99]"
            aria-label="Settle another rent payment"
          >
            <span>Settle Another</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

TransactionStatus.propTypes = {
  status: PropTypes.string,
  result: PropTypes.shape({
    hash: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    recipient: PropTypes.string.isRequired,
    isContractCall: PropTypes.bool,
  }),
  error: PropTypes.string,
  onReset: PropTypes.func.isRequired,
};

TransactionStatus.defaultProps = {
  status: 'idle',
  result: null,
  error: null,
};

export default TransactionStatus;
