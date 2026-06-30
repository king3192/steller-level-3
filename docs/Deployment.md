# RentStar - Deployment Guide

This document describes the compilation, deployment, initialization, and cross-linking of the RentStar smart contracts (`RoomManager` and `RentSplit`) on the Stellar Testnet.

---

## 🛠️ Prerequisites

Ensure you have the following installed:
1. **Rust & Cargo**: [Install Rust](https://www.rust-lang.org/tools/install)
2. **Stellar CLI**: Install version 21+ via Cargo:
   ```bash
   cargo install --locked stellar-cli --features opt
   ```
3. **Target Support**: WebAssembly target for Rust compilation:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```
4. **Funded Identity**: Generate a Stellar account and fund it:
   ```bash
   stellar keys generate --global admin
   # Fund the address using Friendbot:
   curl "https://friendbot.stellar.org/?addr=<ADMIN_PUBLIC_KEY>"
   ```

---

## 🚀 Automated Script Deployment (Recommended)

RentStar includes automated deployment orchestrator scripts that handle compilation, deployment, linkage setup, and frontend environment updates.

### Windows (PowerShell)
From the repository root:
```powershell
./deploy-all.ps1
```

### macOS / Linux / Git Bash
From the repository root:
```bash
chmod +x deploy-all.sh
./deploy-all.sh
```

---

## 🛠️ Manual Step-by-Step Deployment

If you prefer to execute the commands manually, follow these instructions:

### Step 1: Compile WebAssembly Binaries
Build release WebAssembly binaries for both contracts:
```bash
# Compile RoomManager
cd contracts/room_manager
stellar contract build

# Compile RentSplit
cd ../rent_split
stellar contract build
```

The compiled contracts will be generated at `target/wasm32-unknown-unknown/release/`.

### Step 2: Deploy to Stellar Testnet
Deploy the compiled bytecodes:
```bash
# Deploy RoomManager and capture Contract ID
ROOM_MANAGER_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/room_manager.wasm \
  --source admin \
  --network testnet)

# Deploy RentSplit and capture Contract ID
RENT_SPLIT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/rent_split.wasm \
  --source admin \
  --network testnet)
```

### Step 3: Initialize Contracts and Cross-Link
Configure contract parameters and enable authorized cross-contract calls:

1. **Initialize RoomManager** (Assign the Landlord Admin):
   ```bash
   stellar contract invoke \
     --id "$ROOM_MANAGER_ID" \
     --source admin \
     --network testnet \
     -- \
     initialize \
     --admin <LANDLORD_PUBLIC_KEY>
   ```

2. **Initialize RentSplit** (Point to the RoomManager Registry):
   ```bash
   stellar contract invoke \
     --id "$RENT_SPLIT_ID" \
     --source admin \
     --network testnet \
     -- \
     initialize \
     --room_manager "$ROOM_MANAGER_ID"
   ```

3. **Link RentSplit in RoomManager** (Authorize payment writes):
   ```bash
   stellar contract invoke \
     --id "$ROOM_MANAGER_ID" \
     --source admin \
     --network testnet \
     -- \
     set_rent_split \
     --rent_split "$RENT_SPLIT_ID"
   ```

---

## 📋 Frontend Configuration

Once contracts are deployed, update the React frontend configurations.

### 1. Generate Bindings
Create TypeScript/JavaScript client libraries:
```bash
# RoomManager client bindings
stellar contract bindings typescript \
  --contract-id "$ROOM_MANAGER_ID" \
  --network testnet \
  --output-dir src/utils/room-manager-bindings --overwrite

# RentSplit client bindings
stellar contract bindings typescript \
  --contract-id "$RENT_SPLIT_ID" \
  --network testnet \
  --output-dir src/utils/contract-bindings --overwrite
```

### 2. Configure Environment Variables
Create or update `.env` in the project root:
```env
VITE_ROOM_MANAGER_CONTRACT_ID="<DEPLOYED_ROOM_MANAGER_CONTRACT_ID>"
VITE_CONTRACT_ID="<DEPLOYED_RENT_SPLIT_CONTRACT_ID>"
VITE_SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
VITE_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
VITE_HORIZON_URL="https://horizon-testnet.stellar.org"
```
