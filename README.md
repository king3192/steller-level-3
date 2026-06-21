# RentStar — Roommate Rent Settlement on Stellar (Level 2)

[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-blueviolet)](https://horizon-testnet.stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Settle and split rent payments with smart contracts.

RentStar is a decentralized application (dApp) designed to simplify rent and utility settlements between roommates. Powered by high-speed, low-fee Stellar Testnet blockchain, RentStar integrates **Soroban Rust Smart Contracts** to split rent pools on-chain and supports **multiple Stellar wallets** for frictionless roomie settlement.

---

## 🛠️ Level 2 Key Features

- **Soroban Smart Contract (`rent_split`)**: An on-chain rent accumulator. Roommates can query what's remaining to be paid and pay their contributions directly to the contract. The contract enforces bounds (preventing overpayment beyond the total rent owed) and issues authorization guards.
- **Multi-Wallet Support**: Integrates `@creit.tech/stellar-wallets-kit` to connect to Freighter, xBull, or Albedo browser extension wallets.
- **Demo / Mock Mode**: Test the entire flow (transaction building, signing, submitting, pending, success, and event logs) without any wallet extension installed.
- **Real-Time Event Activity Feed**: Background polling of Soroban RPC ledger events decoded from XDR to display a live feed of roommate payment history.
- **Granular State Machine UI**: Upgraded progress loader that visually checks off stages as they happen: `idle` ➔ `building` ➔ `awaiting signature` ➔ `submitting` ➔ `pending` ➔ `success` / `error`.
- **Intelligent Error Classifier**: Maps complex Horizon transaction result codes and Soroban contract panics (`contract, #1` for already paid, `contract, #5` for amount exceeding limit) into clear, friendly error categories.
- **Coexistence Mode**: Users can toggle instantly between Direct XLM payments (Level 1) and Soroban Smart Contract rent settlement (Level 2).

---

## ⚙️ Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Rust SDK | `soroban-sdk` v20.x |
| Stellar JS SDK | `@stellar/stellar-sdk` (v12.3.0) |
| Wallets Adapter | `@creit.tech/stellar-wallets-kit` (v2.4.0) |
| Networks / RPC | Stellar Testnet Horizon & Soroban RPC |

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js**: Node 18+ installed on your computer.
2. **Rust & Cargo**: Required to build/run the smart contract tests locally.
3. **Stellar CLI**: Needed to compile/deploy the smart contract on testnet.

### Installation & Run

1. Clone or copy the project files to your system.
2. Navigate to the root directory and install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
4. Run the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3001` (or the port output by Vite).

---

## 🧪 Verification & Testing

### 1. Smart Contract Tests
Run the unit test suite inside the Rust contract to verify boundaries, limit checks, error throws, and event emissions:
```bash
cd contracts/rent_split
cargo test
```

### 2. Frontend Local Testing (Demo Mode)
If you don't have wallet extensions installed, click the **Connect Demo Wallet (Mock Mode)** button. This will simulate:
- Mock ledger updates
- Simulated state transitions (`building` -> `awaiting signature` -> `submitting` -> `pending` -> `success`)
- Appending simulated payments to the live **Recent Activity** logger
- Enforcing limits (e.g. attempting to pay more than the remaining rent owed raises a validation warning)

---

## 🏗️ Project Structure

```
rentstar/
├── contracts/
│   └── rent_split/                  # Soroban Rust Contract
│       ├── src/
│       │   └── lib.rs               # Smart contract code and unit tests
│       └── Cargo.toml               # Soroban compilation settings
├── src/
│   ├── components/
│   │   ├── Header.jsx               # Logo + multi-wallet connection modal handler
│   │   ├── WalletPanel.jsx          # Dynamic balance indicator + active wallet badge
│   │   ├── PaymentForm.jsx          # Direct XLM payment form (Level 1)
│   │   ├── ContractPaymentForm.jsx  # Smart contract contribution form + metrics dashboard (Level 2)
│   │   ├── RecentActivity.jsx       # Polled and decoded live contract events activity log (Level 2)
│   │   ├── TransactionStatus.jsx    # Visual state machine progress card (Level 2)
│   │   ├── FundingHelper.jsx        # Friendbot funding tool for new testnet accounts
│   │   └── Footer.jsx               # Copyright + disclaimer notes
│   ├── hooks/
│   │   ├── useWalletKit.js          # Handles Freighter/xBull/Albedo connections & signing fallback (Level 2)
│   │   ├── useBalance.js            # Fetches and polls wallet XLM balance
│   │   ├── useSendPayment.js        # Formulates and submits native payment transactions (Level 1)
│   │   ├── usePayRent.js            # Contract transaction builder, simulation, submission, and polling (Level 2)
│   │   └── useContractEvents.js     # Background RPC event subscriber & XDR decoder (Level 2)
│   ├── utils/
│   │   ├── contract.js              # Read-only simulate transaction utility (Level 2)
│   │   ├── errors.js                # Centralized exception classifier (Level 2)
│   │   ├── stellar.js               # Horizon server client instance
│   │   └── format.js                # Number and address formattings
│   ├── constants/
│   │   └── network.js               # Contract ID & RPC/Horizon config URLs
│   ├── App.jsx                      # Main dashboard orchestrator
│   ├── main.jsx                     # Vite mount
│   └── index.css                    # Design styles (Tailwind + animations)
├── .env.example
├── DEPLOY.md                        # Compilation & deployment steps
└── README.md                        # Documentation
```

---

## 🔧 Smart Contract Compilation & Deployment

Check out the step-by-step instructions in [DEPLOY.md](file:///c:/Users/Prana/OneDrive/Documents/steller%20lvl%201/rentstar/DEPLOY.md) to:
1. Compile the contract to WASM.
2. Deploy the WASM contract on Stellar Testnet using the Stellar CLI.
3. Generate TypeScript client bindings.
4. Hook up the new contract ID to the frontend `.env`.
