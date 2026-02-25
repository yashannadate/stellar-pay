# 💸 Stellar Pay

![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-6C47FF?style=flat-square&logo=stellar&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Soroban](https://img.shields.io/badge/Smart%20Contract-Soroban-FF6B35?style=flat-square&logo=stellar&logoColor=white)
![Freighter](https://img.shields.io/badge/Wallet-Freighter-6C47FF?style=flat-square&logo=googlechrome&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

> On-Chain Payroll Infrastructure powered by Soroban Smart Contracts on Stellar Testnet.

Stellar Pay is a progressive dApp built across multiple levels of the Stellar Builder Track. It started as a minimal XLM payment interface and has grown level by level into a fully deployed, production-grade multi-signature treasury system. Each level introduced new infrastructure, new smart contract capabilities, and a higher standard of user experience. The result is a complete on-chain payroll application — with wallet integration, Soroban-powered governance, live price feeds, balance caching, comprehensive test coverage, and a public Vercel deployment — all running on Stellar Testnet.

---

## 🔴 Live Demo

**[https://stellar-pay-app.vercel.app/](https://stellar-pay-app.vercel.app/)**

---

## 🎥 Demo Video

**[Watch 1-Minute Demo](https://drive.google.com/file/d/1g_jVt3vx0t-tRuzgm6CmuiPyOul5e0JI/view?usp=drivesdk)**

---

## 🚀 Belt Progression

| Badge | Status | Documentation |
|---|---|---|
| ⚪ White Belt | ✅ Completed | [Level 1 →](levels-docs/level-1.md) |
| 🟡 Yellow Belt | ✅ Completed | [Level 2 →](levels-docs/level-2.md) |
| 🟠 Orange Belt | ✅ Completed | [Level 3 →](levels-docs/level-3.md) |

---

## ⚪ Level 1 — White Belt

### Overview

Level 1 was the foundation. The goal was to build a working Stellar payment application from scratch — connecting a wallet, reading a live balance from the blockchain, and sending XLM to any valid Stellar address. Everything was built using the Horizon REST API and the Freighter browser wallet extension. This level established the core architecture: React frontend, Stellar SDK for transaction building, Horizon for network communication, and Freighter for signing. It proved the entire payment loop end-to-end: connect → read balance → build transaction → sign in wallet → broadcast → confirm on-chain.

### Features

**Wallet Connection via Freighter**
Freighter is a browser extension wallet for Stellar. Level 1 implemented full connect/disconnect logic using the Freighter API, including reading the connected public key and detecting the active network. If the user is not on Testnet, the app surfaces a clear warning rather than silently sending transactions to the wrong network.

**Live XLM Balance**
The app fetches the user's XLM balance directly from the Horizon Testnet API using the connected public key. The balance updates on connect and is displayed prominently on the dashboard. This was the first real interaction with a live Stellar node.

**XLM Payments**
Users can input a recipient Stellar address and an XLM amount and send a payment in a few clicks. The transaction is built using the Stellar SDK — constructing a `PaymentOperation`, setting fees, sequence numbers, and memo — then passed to Freighter for signing. Once signed, it is submitted to Horizon for broadcast.

**Transaction Verification**
After every successful payment, the app generates a direct link to StellarExpert with the transaction hash so users can independently verify the transaction on the blockchain explorer.

**Input Validation & Error Handling**
All inputs are validated before a transaction is attempted. Address format is checked against Stellar's public key pattern. Amount is validated to be a positive number within the user's available balance. Wallet rejection and network errors are caught and displayed clearly.

[View Full Level 1 Documentation →](levels-docs/level-1.md)

---

## 🟡 Level 2 — Yellow Belt

### Overview

Level 2 introduced smart contract infrastructure and multi-signature governance. A custom Soroban treasury contract was written in Rust, tested, and deployed to Stellar Testnet. The frontend was upgraded from single-wallet Freighter to StellarWalletsKit, enabling a multi-wallet connection flow. The core payroll feature — a three-step on-chain proposal system requiring two independent wallet approvals before funds can be released — was built end to end. This level was the most architecturally significant: it bridged the gap between a simple payment app and a real governance system with on-chain state, immutable rules enforced by a smart contract, and multi-party authorization.

### Soroban Smart Contract

The treasury contract was written in Rust using the Soroban SDK and deployed to Stellar Testnet. It manages payroll proposals with on-chain state and enforces multi-signature rules that cannot be bypassed. The contract exposes three core functions:

- `create_proposal(proposer, employees, amounts)` — Creates a new payroll proposal stored on-chain with a unique proposal ID
- `approve_proposal(approver, proposal_id)` — Records an approval from the calling wallet; each wallet can only approve once
- `execute_proposal(executor, proposal_id, token)` — Releases funds to the recipient, but only if 2 or more unique approvals have been recorded; fails otherwise

The contract enforces all rules on-chain, meaning no frontend bypass is possible. If execution is attempted without sufficient approvals, the contract itself rejects the transaction.

**Contract ID:** `CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS`
**Explorer:** [View on StellarExpert ↗](https://stellar.expert/explorer/testnet/contract/CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS)

### Features

**StellarWalletsKit Integration**
The wallet layer was upgraded from a single Freighter implementation to StellarWalletsKit, which provides a unified interface for connecting multiple Stellar wallets. This enabled the multi-wallet approval flow where two different wallets can each sign their own approval transaction independently.

**3-Step Multi-Sig Payroll Flow**
The payroll flow follows three sequential on-chain steps:

1. **Create Proposal** — The first wallet creates a payroll proposal specifying the recipient address and XLM amount. This writes the proposal to the Soroban contract's on-chain storage.
2. **Approve** — Each authorized approver connects their wallet and submits an approval transaction to the contract. The contract records their public key as an approver. Approvals must come from distinct wallets.
3. **Execute** — Once 2 approvals are recorded on-chain, any party can call execute. The contract verifies the approval count and releases the funds to the recipient address.

**Real-Time Transaction Status**
Each step shows live status — pending, success, or error — along with the transaction hash and a StellarExpert link for on-chain verification after every step.

**Contract Error Handling**
Errors returned from the Soroban contract are caught and surfaced clearly: proposal not found, already executed, approver already approved, insufficient approvals for execution.

### 📸 Level 2 Proofs

**Wallet Options:**
<img width="1919" height="1019" alt="Wallet Options" src="https://github.com/user-attachments/assets/ae87962f-5c83-4ddb-ba6e-d2084a26c6f2" />

**Execute Confirmed & Verified:**
<img width="1919" height="1017" alt="Execute Confirmed" src="https://github.com/user-attachments/assets/44c24e7a-3fe9-4ed3-bce4-c5e17d69373c" />

[View Transaction on StellarExpert ↗](https://stellar.expert/explorer/testnet/tx/66c2f2987c23c9da76c245db86b1551ffb8ced5e27bb74d20bf2c0ad0fbfeddf)

[View Full Level 2 Documentation →](levels-docs/level-2.md)

---

## 🟠 Level 3 — Orange Belt

### Overview

Level 3 transforms Stellar Pay from a working multi-signature dApp into a production-ready application. This stage focused on reliability, user experience, performance optimization, and testing.

The application now includes structured loading states, intelligent balance caching, automatic refresh handling, live fiat value display (USD & INR), improved wallet switching behavior, structured error handling, and full test coverage across frontend and smart contract logic.

The project is publicly deployed and fully functional on Testnet.

### Features

**Structured Loading States**
All async actions (Create, Approve, Execute) now display clear step-based progress messages. The UI prevents duplicate actions while transactions are processing.

**Balance Caching (30s TTL)**
Balances are cached in memory for 30 seconds to reduce redundant Horizon calls and improve performance. After expiration, fresh data is automatically fetched.

**Auto-Refresh**
Balance refreshes silently every 30 seconds to ensure users always see updated on-chain data.

**Wallet Switch Fix**
Resolved stale balance issue during wallet switching. Balance resets instantly and re-fetches for the new address, preventing misleading data.

**Live USD & INR Value Display**
The dashboard shows the current XLM rate, total wallet value in USD, and total wallet value in INR — providing real-world context for on-chain balances.

**Improved Error Handling**
Smart contract error codes are mapped to clear user-friendly messages: proposal not found, already executed, more approvals required, invalid address or amount, already approved. Network and wallet errors are also handled consistently.

**8 Tests Passing**
Five Vitest frontend tests cover address validation, XLM-to-stroops conversion, balance formatting, and invalid input handling. Three Rust contract tests cover proposal creation, the multi-sig approval flow, and the execution guard that blocks premature execution.

**Deployed on Vercel**
Publicly accessible at [https://stellar-pay-app.vercel.app/](https://stellar-pay-app.vercel.app/).

### 📸 Level 3 Proofs

**Connect Screen:**
<img width="1919" height="1019" alt="Connect Screen" src="https://github.com/user-attachments/assets/a8472311-8ce0-402f-a17d-b1491dbb1952" />

**Main Dashboard:**
<img width="1919" height="1019" alt="Main Dashboard" src="https://github.com/user-attachments/assets/2cd0ffa5-07ed-4d30-bd71-a911c5c83d77" />

**Vitest Results:**
<img width="1397" height="666" alt="Vitest Results" src="https://github.com/user-attachments/assets/a1d7867e-92e2-4b03-a661-ffc193d0a336" />

**Rust Test Results:**
<img width="1590" height="857" alt="Rust Test Results" src="https://github.com/user-attachments/assets/55a91bae-f5f6-44ca-b73d-0de9793e81c1" />

[View Full Level 3 Documentation →](levels-docs/level-3.md)

---

## 📝 Soroban Contract

- **Source:** `contracts/treasury/src/lib.rs`
- **Tests:** `contracts/treasury/src/test.rs`
- **Config:** `contracts/treasury/Cargo.toml`
- **Contract ID:** `CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS`
- **Explorer:** [View on StellarExpert ↗](https://stellar.expert/explorer/testnet/contract/CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS)

---

## 🗂️ Project Structure

- `src/App.jsx` — Main dashboard and multi-sig payroll flow
- `src/stellar.js` — Horizon API balance fetching with in-memory caching
- `src/useWallet.jsx` — StellarWalletsKit wallet connection and state management
- `src/tests/` — Vitest frontend utility tests
- `src/blockchain/treasury/` — Auto-generated Soroban JS bindings
- `contracts/treasury/` — Rust Soroban smart contract source and tests
- `levels-docs/` — Detailed documentation for each level

---

## ⚙️ Setup & Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Freighter set to **Testnet**
- Testnet XLM — fund via [Stellar Laboratory Faucet](https://laboratory.stellar.org/#account-creator?network=test)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/yashannadate/stellar-pay.git
cd stellar-pay

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Run Tests

```bash
# Vitest frontend tests
npm run test

# Rust contract tests
cd contracts/treasury
cargo test
```

---

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) for the Soroban smart contract platform
- [Freighter](https://www.freighter.app/) for the browser wallet extension
- [RiseIn](https://www.risein.com/) for the Stellar Journey to Mastery Program 2026

---

<p align="center">⚪🟡🟠Built for Stellar Journey to Mastery · 2026</p>
