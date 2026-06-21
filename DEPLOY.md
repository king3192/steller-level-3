# Deployment Instructions for `rent_split` Soroban Contract

Follow these instructions step-by-step to build, deploy, and configure your Soroban smart contract on the Stellar Testnet.

## Prerequisites

Ensure you have the following installed on your system:
- **Rust and Cargo**: [Install Rust](https://www.rust-lang.org/tools/install)
- **Stellar CLI**: Install the CLI via cargo:
  ```bash
  cargo install --locked stellar-cli --features opt
  ```
- **Wasm target**: Add the WebAssembly target for Rust compilation:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

---

## 1. Build the Contract

Navigate to the `contracts/rent_split` directory and build the contract:

```bash
cd rentstar/contracts/rent_split
stellar contract build
```

This will compile the contract and output the compiled WebAssembly file to:
`rentstar/target/wasm32-unknown-unknown/release/rent_split.wasm`

---

## 2. Deploy to Testnet

To deploy the contract, you will need a Stellar account with some testnet XLM. 

1. **Configure your Testnet network** in Stellar CLI (if you haven't already):
   ```bash
   stellar network add --global testnet \
     --rpc-url https://soroban-testnet.stellar.org:443 \
     --network-passphrase "Test SDF Network ; September 2015"
   ```

2. **Generate or import an administrator identity**:
   ```bash
   # Generate a new identity called 'admin'
   stellar keys generate --global admin
   ```
   *Tip: Fund the generated address using the Friendbot URL: `https://friendbot.stellar.org/?addr=<ADMIN_PUBLIC_KEY>`*

3. **Deploy the Wasm bytecode**:
   From the `rentstar` root directory, run the deploy command:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/rent_split.wasm \
     --source admin \
     --network testnet
   ```

This command will output the **Contract ID** (e.g. `C...`). Copy this Contract ID as you will need it for frontend integration and client bindings.

---

## 3. Generate TypeScript Bindings

You can generate TypeScript bindings so that calling the contract from the frontend is type-safe and convenient:

```bash
stellar contract bindings typescript \
  --contract-id <DEPLOYED_CONTRACT_ID> \
  --network testnet \
  --output-dir src/utils/contract-bindings
```

Replace `<DEPLOYED_CONTRACT_ID>` with the contract ID returned in step 2.

---

## 4. Frontend Configuration

Update your `.env` file in the `rentstar` root:
```env
VITE_CONTRACT_ID="<DEPLOYED_CONTRACT_ID>"
VITE_SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
```
