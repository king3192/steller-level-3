# RentStar Deployment Checklist & Runbook

This document serves as the official operations runbook for validating releases, verifying post-deployment health, performing emergency rollbacks, and setting up system monitoring.

---

## 1. Pre-Deployment Verification

Before merging any pull request or pushing to `main` for release deployment, complete these verification steps:

- [ ] **Smart Contract Verification**: Run cargo test locally inside `contracts/room_manager/` and `contracts/rent_split/` and ensure all tests pass.
- [ ] **Frontend Compile**: Run `npm run build` locally to verify that React compiles and bundles without TypeScript/JS errors.
- [ ] **Config File Audit**: Ensure `vite.config.js` contains the correct base path (`/steller-level-3/`) and drop settings for production.
- [ ] **Environment Synchronization**: Verify that `.env` config matches `.env.example` configurations. No secret keys or private wallets should be hardcoded in these templates.
- [ ] **Changelog Update**: If introducing changes, update the version number inside `package.json` and note the key features in release logs.

---

## 2. Post-Deployment Verification

Once the deployment action finishes successfully and the green deployment card shows on your GitHub sidebar:

- [ ] **Page Loading**: Visit the deployment URL: `https://king3192.github.io/steller-level-3/`. Verify the page loads cleanly with no console errors in devtools.
- [ ] **Asset Assets check**: Confirm all layout images, banners, icons, and tailwind typography display correctly.
- [ ] **Wallet Integration**: Test freighter/xBull extension popup trigger. Click on **Connect Wallet** and verify that connection prompts appear.
- [ ] **Demo Mode Simulation**: Enter **Demo Mode** on the dashboard. Test registering a roommate, changing allocations, and submitting test roommate payments. Ensure values update instantly in the dashboard view.
- [ ] **Contract Queries**: Open browser developer console, interact with the app, and check that Horizon queries and RPC calls return valid Testnet payload statuses (HTTP 200).

---

## 3. Health Check Procedures

Run these routine checks on the live site periodically:

1. **RPC Gateway Ping**: Ensure the Soroban RPC endpoint is responsive:
   - Run a cURL request or check browser requests to `https://soroban-testnet.stellar.org` to confirm the ledger is accessible.
2. **Horizon Node Ping**: Verify Horizon is operating:
   - Inspect network tab queries for `https://horizon-testnet.stellar.org` returning green statuses.
3. **Decoded Ledgers**: Check the **Recent Rent Activity** feed on the dashboard to ensure it lists payment event timelines from ledger events correctly.

---

## 4. Emergency Rollback Procedures

If a deployment contains critical errors, broken layout, or contract misconfigurations, use this quick rollback runbook:

### Method A: Revert Commit on GitHub (Recommended)
1. Locate the broken commit on the `main` branch.
2. Open a terminal and revert the commit:
   ```bash
   git revert <broken_commit_hash>
   ```
3. Push the revert commit:
   ```bash
   git push origin main
   ```
4. The CI/CD pipeline will automatically detect the push, rebuild the reverted code, and overwrite the broken deployment on GitHub Pages within 2-3 minutes.

### Method B: Deploy Previous Release Branch / Tag
1. If the repository main is locked or blocked:
   - Checkout the last known working release tag:
     ```bash
     git checkout tags/v<last_working_run_number> -b rollback-branch
     ```
   - Push this branch to a temporary hotfix branch and make a PR to main:
     ```bash
     git push origin rollback-branch:main --force
     ```
   - *Caution*: Force pushing should only be used when branch protections are temporarily disabled or in extreme emergencies.

---

## 5. Environment-Specific Configurations

| Parameter | Staging (Testnet) | Production (Future Mainnet) |
| :--- | :--- | :--- |
| **RPC Gateway URL** | `https://soroban-testnet.stellar.org` | `https://soroban-mainnet.stellar.org` |
| **Horizon API URL** | `https://horizon-testnet.stellar.org` | `https://horizon.stellar.org` |
| **Network Passphrase** | `Test SDF Network ; September 2015` | `Public Global Stellar Network ; October 2015` |
| **RoomManager Contract ID**| `CA...` (Testnet Address) | `CA...` (Mainnet Address) |
| **RentSplit Contract ID** | `CD...` (Testnet Address) | `CD...` (Mainnet Address) |

Ensure the environment variables are set correctly in the build context.

---

## 6. Monitoring and Alerts Setup

To monitor your live deployment automatically, consider these integrations:

- **GitHub Actions Notifications**: Go to GitHub -> Settings -> Notifications -> Actions. Turn on Email or Slack alerts for failed workflows.
- **Uptime Monitoring**: Integrate free services like UptimeRobot or Better Stack directed at your GitHub Pages URL `https://king3192.github.io/steller-level-3/` to alert the team via email or SMS when the site is down.
- **Sentry Integration (Optional)**: Add Sentry SDK to React frontend in a future update to catch production client errors and submit reports automatically.
