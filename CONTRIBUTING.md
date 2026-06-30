# Contributing to RentStar

Thank you for your interest in contributing to RentStar! RentStar is a roommate rent settlement decentralized application (dApp) built on the Stellar network using Soroban Rust Smart Contracts.

Following these guidelines helps ensure a smooth development process and maintains code quality.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Frontend Development](#frontend-development)
  - [Smart Contract Development](#smart-contract-development)
- [Style Guide](#style-guide)
  - [Javascript / React](#javascript--react)
  - [Rust / Soroban](#rust--soroban)

---

## Code of Conduct

Please be respectful and professional in all communications and code reviews. We strive to maintain a collaborative and welcoming environment.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please open an issue using the **Bug Report** template. Include:
- A clear description of the problem.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Screenshots or error logs if applicable.

### Suggesting Enhancements

For new features or UX improvements, please open an issue using the **Feature Request** template. Describe the value of the enhancement and how it fits into the Level 2 scope.

### Pull Requests

1. Fork the repository and create your branch from `main`.
2. Document your changes in the PR description.
3. Ensure the project builds successfully and passes all unit tests.
4. Follow the existing directory structure and coding patterns.

---

## Development Setup

### Prerequisites

- **Node.js**: Version 18 or higher.
- **Rust**: Stable toolchain with `wasm32-unknown-unknown` target.
- **Stellar CLI**: Installed via cargo:
  ```bash
  cargo install --locked stellar-cli --features opt
  ```

### Frontend Development

1. Install npm dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in active Testnet contract IDs.
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Smart Contract Development

1. Build the WebAssembly binaries:
   ```bash
   # In contracts/room_manager/ or contracts/rent_split/
   stellar contract build
   ```
2. Run smart contract unit tests:
   ```bash
   cargo test
   ```

---

## Style Guide

### Javascript / React
- Follow ES6+ syntax rules.
- Format files using Prettier/ESLint rules defined in the repository.
- Keep components focused and modular.
- Do not mix business logic directly inside pure display components.

### Rust / Soroban
- Run `cargo fmt` to auto-format code.
- Write explanatory unit tests for every contract function.
- Document panics and return values cleanly.
- Use meaningful symbol names and descriptive event fields.
