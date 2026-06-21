import { useState } from 'react';
import { Header } from './components/Header';
import { WalletPanel } from './components/WalletPanel';
import { PaymentForm } from './components/PaymentForm';
import { ContractPaymentForm } from './components/ContractPaymentForm';
import { TransactionStatus } from './components/TransactionStatus';
import { RecentActivity } from './components/RecentActivity';
import { FundingHelper } from './components/FundingHelper';
import { Footer } from './components/Footer';
import { useWalletKit } from './hooks/useWalletKit';
import { useBalance } from './hooks/useBalance';
import { useSendPayment } from './hooks/useSendPayment';
import { usePayRent } from './hooks/usePayRent';
import { useContractEvents } from './hooks/useContractEvents';
import { ShieldAlert, Sparkles, Coins, Zap, Layers, Send } from 'lucide-react';

export function App() {
  const [paymentMode, setPaymentMode] = useState('contract'); // 'direct' or 'contract'

  const {
    publicKey,
    isConnected,
    isConnecting,
    isMock,
    walletType,
    connectWallet,
    connectMockWallet,
    disconnectWallet,
    signTransaction,
    error: walletError,
  } = useWalletKit();

  const {
    balance,
    isLoading: isBalanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useBalance(publicKey, isMock);

  // Hook for Native XLM Payments (Level 1)
  const {
    sendPayment,
    status: directStatus,
    isLoading: isSendingPayment,
    result: directResult,
    error: directError,
    reset: resetDirectPayment,
  } = useSendPayment(signTransaction);

  // Hook for Soroban Contract Payments (Level 2)
  const {
    payRent,
    status: contractStatus,
    result: contractResult,
    error: contractError,
    reset: resetContractPayment,
  } = usePayRent(signTransaction);

  // Hook for Smart Contract Events (Real-time activity)
  const {
    events: contractEvents,
    refetch: refetchEvents,
    addMockEvent,
  } = useContractEvents(isMock);

  // Reset payment states when wallet is disconnected
  const handleDisconnect = () => {
    resetDirectPayment();
    resetContractPayment();
    disconnectWallet();
  };

  const handlePaymentSubmit = async ({ recipientAddress, amount, memo }) => {
    if (!publicKey) return;
    await sendPayment({
      senderAddress: publicKey,
      recipientAddress,
      amount,
      memo,
      isMock,
    });
    // Trigger balance refetch after completing transaction
    refetchBalance();
  };

  const handleContractPaymentSubmit = async ({ amount }) => {
    if (!publicKey) return;
    await payRent({
      payerAddress: publicKey,
      amount,
      isMock,
    });
    // Refetch balance and events
    refetchBalance();
    if (isMock) {
      addMockEvent(publicKey, amount);
    } else {
      refetchEvents();
    }
  };

  // If funding via friendbot succeeds, refetch balance
  const handleFundingSuccess = () => {
    refetchBalance();
  };

  // Dynamic Transaction State Machine Binding
  const activeTxStatus = paymentMode === 'direct' ? directStatus : contractStatus;
  const activeTxResult = paymentMode === 'direct' ? directResult : contractResult;
  const activeTxError = paymentMode === 'direct' ? directError : contractError;
  const handleActiveTxReset = paymentMode === 'direct' ? resetDirectPayment : resetContractPayment;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-50 star-grid relative">
      {/* Background Decorative Aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <Header
          publicKey={publicKey}
          isConnecting={isConnecting}
          isMock={isMock}
          walletType={walletType}
          connectWallet={connectWallet}
          disconnectWallet={handleDisconnect}
          walletError={walletError}
        />

        <main className="max-w-md mx-auto px-4 py-10 w-full z-10 relative space-y-6">
          {!isConnected ? (
            /* Disconnected Landing / Hero Card */
            <div className="bg-slate-900/80 border border-appBorder backdrop-blur-md rounded-2xl p-6 shadow-xl space-y-6 text-center animate-fade-in">
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent fill-accent/15" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-white leading-tight">
                    Settle Rent on Stellar
                  </h1>
                  <p className="text-sm text-appText-muted leading-relaxed">
                    RentStar is a roommate settlement dApp. Connect your wallet to make direct XLM payments or contribute to an on-chain smart contract rent pool.
                  </p>
                </div>
              </div>

              {/* Bullet Features */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-slate-950/45 border border-appBorder/50 rounded-xl p-3 flex flex-col justify-between space-y-1">
                  <Coins className="w-5 h-5 text-accent" />
                  <div>
                    <h4 className="text-xs font-bold text-white font-heading">Multi-Wallet</h4>
                    <p className="text-[10px] text-appText-muted mt-0.5 leading-normal">
                      Connect via Freighter, xBull, or Albedo.
                    </p>
                  </div>
                </div>
                <div className="bg-slate-950/45 border border-appBorder/50 rounded-xl p-3 flex flex-col justify-between space-y-1">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <h4 className="text-xs font-bold text-white font-heading">Soroban Smart Contract</h4>
                    <p className="text-[10px] text-appText-muted mt-0.5 leading-normal">
                      Automate rent splits securely on-chain.
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet Error Warnings */}
              {walletError && (
                <div className="bg-error/10 border border-error/25 rounded-xl p-3 text-xs text-error flex items-start gap-2 text-left animate-fade-in">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Connection issue:</span>{' '}
                    <span>{walletError}</span>
                  </div>
                </div>
              )}

              {/* Connect Buttons */}
              <div className="space-y-3">
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-lg shadow-primary/20 glow-pulse active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Connect Stellar Wallet"
                >
                  {isConnecting ? 'Opening Wallet Modal...' : 'Connect Stellar Wallet'}
                </button>
                <button
                  onClick={connectMockWallet}
                  disabled={isConnecting}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl text-xs transition-all duration-300 border border-slate-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Connect Demo Wallet"
                >
                  Connect Demo Wallet (Mock Mode)
                </button>
              </div>
            </div>
          ) : (
            /* Connected App Panel */
            <div className="space-y-6">
              <WalletPanel
                publicKey={publicKey}
                balance={balance}
                isLoading={isBalanceLoading}
                balanceError={balanceError}
                walletType={walletType}
                refetchBalance={refetchBalance}
                fundingHelperNode={
                  <FundingHelper
                    publicKey={publicKey}
                    onFundingSuccess={handleFundingSuccess}
                  />
                }
              />

              {/* Tab Selector Toggle */}
              {activeTxStatus === 'idle' && (
                <div className="flex bg-slate-900/90 border border-appBorder/85 rounded-xl p-1 w-full shadow-inner animate-fade-in">
                  <button
                    onClick={() => {
                      setPaymentMode('contract');
                      resetContractPayment();
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all duration-350 ${
                      paymentMode === 'contract'
                        ? 'bg-primary text-white shadow-md shadow-primary/10'
                        : 'text-appText-muted hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Smart Contract Rent
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMode('direct');
                      resetDirectPayment();
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all duration-350 ${
                      paymentMode === 'direct'
                        ? 'bg-primary text-white shadow-md shadow-primary/10'
                        : 'text-appText-muted hover:text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Direct XLM Payment
                  </button>
                </div>
              )}

              {/* Payment Flow or Loading Status */}
              {activeTxStatus !== 'idle' ? (
                <TransactionStatus
                  status={activeTxStatus}
                  result={activeTxResult}
                  error={activeTxError}
                  onReset={handleActiveTxReset}
                />
              ) : paymentMode === 'direct' ? (
                <PaymentForm
                  senderAddress={publicKey}
                  balance={balance}
                  onSubmit={handlePaymentSubmit}
                  isLoading={isSendingPayment}
                />
              ) : (
                <ContractPaymentForm
                  senderAddress={publicKey}
                  walletBalance={balance}
                  onSubmit={handleContractPaymentSubmit}
                  isLoading={activeTxStatus !== 'idle'}
                  isMock={isMock}
                />
              )}

              {/* Real-time event activities */}
              <RecentActivity events={contractEvents} />
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
