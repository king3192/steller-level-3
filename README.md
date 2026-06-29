# RentStar — Enterprise Roommate Rent Settlement on Stellar

[![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-blueviolet)](https://horizon-testnet.stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Settle, split, and manage rent payments with inter-communicating smart contracts.

RentStar is a decentralized application (dApp) designed to simplify rent and utility settlements between roommates. Powered by the high-speed, low-fee Stellar Testnet blockchain, RentStar integrates **Soroban Rust Smart Contracts** to split rent pools on-chain, manage roommate registry allocations, and support **multiple Stellar wallets** for frictionless roommate settlement.

---

## 🛠️ Key Upgrade Features

- **Multi-Contract Architecture**: 
  - **`RoomManager` Contract**: Houses roommate addresses, rent shares, payment histories, and access controls.
  - **`RentSplit` Contract**: Acts as the payment processor, verifying roommate records and updating balances on the `RoomManager` via cross-contract calls.
- **Landlord Admin Panel**: Landlords can connect their admin wallet to register roommates, assign rent shares, and update the linked `RentSplit` contract.
- **Roommate Stats Dashboard**: Renters get a customized overview of their individual share, payment progress, outstanding balance, and global pool metrics.
- **Multi-Wallet Support**: Integrates `@creit.tech/stellar-wallets-kit` to connect to Freighter, xBull, or Albedo browser extension wallets.
- **Demo / Mock Mode & Profile Simulator**: Test the entire landlord and roommate flows (transaction building, signing, submitting, and state updates) with an interactive role-switching utility—no extension installation needed.
- **Real-Time Event Activity Feed**: Background polling of Soroban RPC ledger events decoded from XDR to display a live feed of roommate payment history.
- **Granular State Machine UI**: Upgraded progress loader that visually checks off stages as they happen: `idle` ➔ `building` ➔ `awaiting signature` ➔ `submitting` ➔ `pending` ➔ `success` / `error`.
- **Intelligent Error Classifier**: Maps complex Horizon transaction result codes and Soroban contract panics into clear, friendly error categories.

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
1. **Node.js**: Node 18+ installed.
2. **Rust & Cargo**: Required to build/run the smart contract tests locally.
3. **Stellar CLI**: Needed to compile/deploy the smart contracts on testnet.

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
Run the unit and integration tests inside the Rust contracts to verify cross-contract calls, boundary limits, and events:
```bash
# Test RoomManager contract
cd contracts/room_manager
cargo test

# Test RentSplit contract (includes multi-contract integration flow tests)
cd ../rent_split
cargo test
```

### 2. Frontend Local Testing (Demo Mode)
If you don't have wallet extensions installed, click the **Connect Demo Wallet (Mock Mode)**. This will enable:
- A **Simulate Profile** toggle to switch between **Roommate** and **Landlord** accounts.
- **Landlord Flow**: Add roommates, set shares, link contract IDs, and track settlement bars in real-time.
- **Roommate Flow**: Form validation based on outstanding shares, pay rent, and update the live **Recent Activity** event feed.

---

## Screenshots
1. Balance And Profile Selectiom
  ![image alt](https://github.com/king3192/steller-level-3/blob/52f742017db5b881bd437fb253a828ef6c1195f9/Screenshot%202026-06-30%20001800.png)
2. Profile Roomate (Contract based rent settlement)
  ![image alt](https://github.com/king3192/steller-level-3/blob/52f742017db5b881bd437fb253a828ef6c1195f9/Screenshot%202026-06-30%20001822.png)
3. Recent/Past Rent Transactions
  ![image alt](https://github.com/king3192/steller-level-3/blob/52f742017db5b881bd437fb253a828ef6c1195f9/Screenshot%202026-06-30%20001846.png)
4. Landlord Dashboard And Registered Roommates
  ![image alt](https://github.com/king3192/steller-level-3/blob/52f742017db5b881bd437fb253a828ef6c1195f9/Screenshot%202026-06-30%20001912.png)
5. New Roommate Registration And Link Settlement Contract 
  ![image alt](https://github.com/king3192/steller-level-3/blob/52f742017db5b881bd437fb253a828ef6c1195f9/Screenshot%202026-06-30%20002006.png)


---

## 🏗️ Project Structure

```
rentstar/
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD Pipeline
├── contracts/
│   ├── room_manager/                # Soroban Roommate Registry Contract
│   │   ├── src/lib.rs               # Room registry logic & access checks
│   │   └── Cargo.toml
│   └── rent_split/                  # Soroban Rent Split Payment Contract
│       ├── src/lib.rs               # Payment validation, cross-contract calls, and integration tests
│       └── Cargo.toml
├── src/
│   ├── components/
│   │   ├── Header.jsx               # Logo + multi-wallet connection modal handler
│   │   ├── WalletPanel.jsx          # Dynamic balance indicator + active wallet badge
│   │   ├── AdminDashboard.jsx       # Landlord registry, link configuration, and progress dashboard
│   │   ├── PaymentForm.jsx          # Direct XLM payment form (Level 1)
│   │   ├── ContractPaymentForm.jsx  # Smart contract contribution form + roommate metric dashboard
│   │   ├── RecentActivity.jsx       # Decoded live contract events activity log
│   │   ├── TransactionStatus.jsx    # Visual state machine progress card
│   │   ├── FundingHelper.jsx        # Friendbot funding tool for new testnet accounts
│   │   └── Footer.jsx
│   ├── hooks/
│   │   ├── useWalletKit.js          # Handles Freighter/xBull/Albedo connections & signing fallback
│   │   ├── useBalance.js            # Fetches and polls wallet XLM balance
│   │   ├── useSendPayment.js        # Formulates and submits native payment transactions (Level 1)
│   │   ├── usePayRent.js            # Contract payment transaction builder & submitter (Level 2)
│   │   ├── useRoomManager.js        # Handles admin registration & linkage contract calls (Upgrade)
│   │   └── useContractEvents.js     # Background RPC event subscriber & XDR decoder
│   ├── utils/
│   │   ├── contract.js              # Read-only simulate transaction utility (RoomManager & RentSplit)
│   │   ├── errors.js                # Centralized exception classifier (Soroban panics & wallets)
│   │   ├── stellar.js               # Horizon server client instance
│   │   └── format.js                # Number and address formattings
│   ├── constants/
│   │   └── network.js               # Contract IDs & RPC/Horizon config URLs
│   ├── App.jsx                      # Main dashboard orchestrator (Roles & Tabs router)
│   ├── main.jsx
│   └── index.css                    # Custom styles (Tailwind + animation keyframes)
├── deploy-all.ps1                   # Windows automated compilation, deployment & linking script
├── deploy-all.sh                    # Unix automated compilation, deployment & linking script
├── DEPLOY.md                        # Compilation & deployment steps
└── README.md                        # Documentation
```
