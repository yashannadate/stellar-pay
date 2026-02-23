
# 💸 Stellar Pay

![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-6C47FF?style=flat-square&logo=stellar&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Soroban](https://img.shields.io/badge/Smart%20Contract-Soroban-FF6B35?style=flat-square&logo=stellar&logoColor=white)
![Freighter](https://img.shields.io/badge/Wallet-Freighter-6C47FF?style=flat-square&logo=googlechrome&logoColor=white)

> On-Chain Payroll Infrastructure powered by Soroban Smart Contracts on Stellar Testnet.

Stellar Pay is a progressive dApp built across multiple levels of the Stellar Builder Track. Starting as a simple XLM payment app, it has evolved into a full multi-signature treasury system powered by a Soroban smart contract on Stellar.

---

## 🚀 Belt Progression

| Badge | Status | Documentation |
|---|---|---|
| ⚪ White Belt | ✅ Completed | [Level 1](levels-docs/level-1.md) |
| 🟡 Yellow Belt | ✅ Completed | [Level 2](levels-docs/level-2.md) |

---

## ⚪ Level 1 (White Belt) Highlights

- **Wallet Connection** — Freighter wallet integration for secure authentication
- **Live Balance** — Real-time XLM balance fetched from Horizon Testnet API
- **XLM Payments** — End-to-end payment flow to any valid Stellar address
- **Transaction Verification** — Direct StellarExpert link after every payment
- **Error Handling** — Address validation, amount checks, wallet rejection handling

---

## 🟡 Level 2 (Yellow Belt) Highlights

- **Multi-Wallet Integration** — StellarWalletsKit for seamless multi-wallet flows
- **Soroban Smart Contract** — Custom Rust treasury contract deployed to Testnet
- **Multi-Sig Governance** — 2 independent wallet approvals required before funds release
- **3-Step Payroll Flow** — Create proposal → Approve → Execute on-chain
- **Transaction Status** — Real-time pending/success/error tracking with hash link
- **Contract ID:** `CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS`

### 📸 Level 2 Proofs

**Wallet Options:**
<img width="1919" height="1019" alt="Wallet Options" src="https://github.com/user-attachments/assets/ae87962f-5c83-4ddb-ba6e-d2084a26c6f2" />

**Execute Confirmed & Verified:**
<img width="1919" height="1017" alt="Execute Confirmed" src="https://github.com/user-attachments/assets/44c24e7a-3fe9-4ed3-bce4-c5e17d69373c" />

[View on StellarExpert ↗](https://stellar.expert/explorer/testnet/tx/66c2f2987c23c9da76c245db86b1551ffb8ced5e27bb74d20bf2c0ad0fbfeddf)

- **Error Types Handled:**
  1. **Wallet Rejection** — "Transaction rejected in wallet."
  2. **Network Failure** — "Network broadcast failed. Please try again."
  3. **Contract Errors** — Proposal not found, already executed, already approved, insufficient approvals

---

## 📝 Soroban Contract

The smart contract is located in `contracts/treasury` and follows standard Soroban project structure.

- **Source:** `contracts/treasury/src/lib.rs`
- **Tests:** `contracts/treasury/src/test.rs`
- **Config:** `contracts/treasury/Cargo.toml`

---

## 🗂️ Project Structure

- `src/App.jsx` — Main dashboard and multi-sig flow
- `src/stellar.js` — Horizon API balance fetching
- `src/useWallet.jsx` — StellarWalletsKit wallet connection
- `src/blockchain/treasury/` — Generated Soroban JS bindings
- `contracts/treasury/` — Rust Soroban smart contract
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

---

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) for the Soroban platform
- [Freighter](https://www.freighter.app/) for the wallet extension
- [RiseIn](https://www.risein.com/) for the Stellar Journey to Mastery Program 2026

---

<p align="center">Built for Stellar Journey to Mastery · 2026</p>