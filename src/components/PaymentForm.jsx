import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Send, AlertCircle, Loader2 } from 'lucide-react';

/**
 * PaymentForm component for entering Stellar transaction details.
 * Contains real-time field validations.
 */
export function PaymentForm({
  senderAddress,
  balance,
  onSubmit,
  isLoading,
}) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [isTouched, setIsTouched] = useState({});

  // Max spendable balance (reserving 1 XLM for ledger requirements & base fees)
  const maxSpendable = Math.max(0, parseFloat(balance || 0) - 1);

  // Validation function
  const validate = useCallback(() => {
    const newErrors = {};

    // 1. Validate Recipient Address
    if (isTouched.recipient) {
      if (!recipient) {
        newErrors.recipient = 'Recipient address is required.';
      } else if (!recipient.startsWith('G') || recipient.length !== 56) {
        newErrors.recipient = 'Stellar public keys must start with "G" and be 56 characters long.';
      } else if (!/^[A-Z2-7]{56}$/.test(recipient)) {
        newErrors.recipient = 'Invalid Stellar address format (must be uppercase alphanumeric base32).';
      } else if (recipient === senderAddress) {
        newErrors.recipient = 'Cannot send payment to your own address.';
      }
    }

    // 2. Validate Amount
    if (isTouched.amount) {
      const parsedAmount = parseFloat(amount);
      if (!amount) {
        newErrors.amount = 'Amount is required.';
      } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
        newErrors.amount = 'Amount must be greater than 0.';
      } else if (parsedAmount < 0.0000001) {
        newErrors.amount = 'Minimum payment amount is 0.0000001 XLM.';
      } else if (parsedAmount > maxSpendable) {
        newErrors.amount = `Amount exceeds max spendable balance (${maxSpendable.toFixed(7)} XLM, reserving 1 XLM for fees/minimum reserve).`;
      }
    }

    // 3. Validate Memo
    if (isTouched.memo) {
      if (memo.length > 28) {
        newErrors.memo = 'Text memo cannot exceed 28 characters.';
      }
    }

    setErrors(newErrors);
  }, [recipient, amount, memo, isTouched, senderAddress, maxSpendable]);

  // Run validation whenever inputs or touch states change
  useEffect(() => {
    validate();
  }, [validate]);

  const handleBlur = (field) => {
    setIsTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleMaxClick = () => {
    setAmount(maxSpendable.toFixed(7));
    setIsTouched((prev) => ({ ...prev, amount: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched to trigger full validation
    const touchedAll = { recipient: true, amount: true, memo: true };
    setIsTouched(touchedAll);

    // Re-run validation locally before submitting
    const finalErrors = {};
    const parsedAmount = parseFloat(amount);

    if (!recipient || !recipient.startsWith('G') || recipient.length !== 56 || !/^[A-Z2-7]{56}$/.test(recipient)) {
      finalErrors.recipient = 'Please enter a valid recipient Stellar public key.';
    } else if (recipient === senderAddress) {
      finalErrors.recipient = 'Cannot send payment to your own address.';
    }

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      finalErrors.amount = 'Please enter a valid amount.';
    } else if (parsedAmount > maxSpendable) {
      finalErrors.amount = 'Amount exceeds available balance minus 1 XLM reserve.';
    }

    if (memo.length > 28) {
      finalErrors.memo = 'Text memo is too long (max 28 characters).';
    }

    setErrors(finalErrors);

    if (Object.keys(finalErrors).length === 0) {
      onSubmit({
        recipientAddress: recipient.trim(),
        amount: parsedAmount,
        memo: memo.trim(),
      });
    }
  };

  // Check if form is submittable
  const isFormValid =
    recipient &&
    amount &&
    Object.keys(errors).length === 0 &&
    recipient !== senderAddress &&
    parseFloat(amount) <= maxSpendable;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-slate-900/80 border border-appBorder backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-5"
    >
      <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
        <Send className="w-5 h-5 text-primary" />
        Settle Roommate Rent
      </h3>

      {/* Recipient Input */}
      <div className="flex flex-col space-y-1.5">
        <label htmlFor="recipient" className="text-xs font-semibold text-appText-muted">
          Recipient Public Key (Starts with G)
        </label>
        <input
          type="text"
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value.toUpperCase().trim())}
          onBlur={() => handleBlur('recipient')}
          disabled={isLoading}
          placeholder="e.g. GB23...TZE7"
          className={`w-full px-4 py-2.5 bg-slate-950/75 border rounded-xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all duration-200 ${
            errors.recipient && isTouched.recipient
              ? 'border-error/55 focus:ring-error/25'
              : 'border-appBorder'
          }`}
          aria-invalid={!!errors.recipient}
        />
        {errors.recipient && isTouched.recipient && (
          <span className="text-xs text-error font-medium flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.recipient}
          </span>
        )}
      </div>

      {/* Amount Input */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="amount" className="text-xs font-semibold text-appText-muted">
            Amount (XLM)
          </label>
          <button
            type="button"
            onClick={handleMaxClick}
            disabled={isLoading || maxSpendable <= 0}
            className="text-xs font-bold text-accent hover:text-accent/90 disabled:opacity-50 disabled:cursor-not-allowed hover:underline focus:outline-none"
          >
            Send Max ({maxSpendable.toFixed(4)} XLM)
          </button>
        </div>
        <div className="relative">
          <input
            type="number"
            id="amount"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => handleBlur('amount')}
            disabled={isLoading}
            placeholder="0.00"
            className={`w-full pl-4 pr-16 py-2.5 bg-slate-950/75 border rounded-xl text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all duration-200 ${
              errors.amount && isTouched.amount
                ? 'border-error/55 focus:ring-error/25'
                : 'border-appBorder'
            }`}
            aria-invalid={!!errors.amount}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-appText-muted">
            XLM
          </span>
        </div>
        {errors.amount && isTouched.amount ? (
          <span className="text-xs text-error font-medium flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.amount}
          </span>
        ) : (
          <p className="text-[10px] text-appText-muted">
            * 1 XLM reserve will remain in your wallet to cover base reserves and transaction fees.
          </p>
        )}
      </div>

      {/* Memo Input */}
      <div className="flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="memo" className="text-xs font-semibold text-appText-muted">
            Memo (Optional Text)
          </label>
          <span
            className={`text-xs font-mono font-medium ${
              memo.length > 28 ? 'text-error font-bold' : 'text-appText-muted'
            }`}
          >
            {memo.length}/28
          </span>
        </div>
        <input
          type="text"
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={() => handleBlur('memo')}
          disabled={isLoading}
          maxLength={35} // slightly larger than 28 to show exceeding validations
          placeholder="e.g. Rent June Room 2"
          className={`w-full px-4 py-2.5 bg-slate-950/75 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/45 transition-all duration-200 ${
            errors.memo && isTouched.memo
              ? 'border-error/55 focus:ring-error/25'
              : 'border-appBorder'
          }`}
          aria-invalid={!!errors.memo}
        />
        {errors.memo && isTouched.memo && (
          <span className="text-xs text-error font-medium flex items-center gap-1.5 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {errors.memo}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
          isLoading || !isFormValid
            ? 'bg-primary/50 text-white/75 cursor-not-allowed border border-primary/10'
            : 'bg-primary hover:bg-primary-hover hover:scale-[1.01] active:scale-[0.99] text-white border border-primary/20 shadow-lg shadow-primary/20 glow-pulse'
        }`}
        aria-label="Send payment via Freighter"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Processing Signature...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Rent Payment</span>
          </>
        )}
      </button>
    </form>
  );
}

PaymentForm.propTypes = {
  senderAddress: PropTypes.string.isRequired,
  balance: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

PaymentForm.defaultProps = {
  balance: '0.0000000',
};

export default PaymentForm;
