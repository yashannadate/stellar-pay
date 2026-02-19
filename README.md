# 💸 Stellar Pay

![Network](https://img.shields.io/badge/Network-Stellar%20Testnet-6C47FF?style=flat-square&logo=stellar&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Freighter](https://img.shields.io/badge/Wallet-Freighter-FF6B35?style=flat-square&logo=googlechrome&logoColor=white)


> A high-performance, minimalist payment dApp built on the Stellar Testnet.

Stellar Pay streamlines the process of sending XLM while providing real-time financial transparency and secure wallet integration. Built for the **Stellar White Belt (Level 1)** challenge as part of the RiseIn Stellar Journey to Mastery Program 2026.

---

## ✨ Features

- 🔐 **Freighter Wallet Integration** — Seamless connect/disconnect using the industry-standard Stellar browser extension
- 💰 **Live Balance Tracking** — Real-time XLM balance fetched directly from the Horizon Testnet API
- ⚡ **Simplified Payments** — End-to-end payment flow to send XLM to any valid Stellar address
- 🔍 **Transaction Verification** — Every successful payment provides a direct link to StellarExpert Explorer for on-chain proof
- 🛡️ **Robust Error Handling** — Built-in validation for destination addresses, amount checks, and wallet status notifications

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite) |
| Styling | Modern CSS |
| Stellar SDK | `@stellar/stellar-sdk` |
| Wallet | `@stellar/freighter-api` |
| Network | Stellar Testnet |

- **`@stellar/stellar-sdk`** — Horizon API communication and transaction building
- **`@stellar/freighter-api`** — Secure wallet connection and transaction signing
- **Network endpoint** — `https://horizon-testnet.stellar.org`

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- Testnet XLM — fund your account via the [Stellar Laboratory Faucet](https://laboratory.stellar.org/#account-creator?network=test)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yashannadate/stellar-pay-whitebelt.git
   cd stellar-pay-whitebelt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 📖 How to Use

1. **Connect Wallet** — Click "Connect Wallet" in the top navigation. Make sure your Freighter wallet is set to **Testnet**.
2. **View Balance** — Your current XLM balance will be displayed automatically once connected.
3. **Send XLM**
   - Enter the recipient's Public Key (starts with `G`)
   - Enter the amount of XLM to send
   - Click **Send Payment** and approve the transaction in the Freighter popup
4. **Confirm** — Click the transaction hash or "View on Explorer" link to verify the payment on-chain via StellarExpert.

---

## 📸 Screenshots

**Wallet Connected**
![Wallet Connected](https://github.com/user-attachments/assets/1debc6f8-cf6e-44a4-a027-fd45e3e4bbad)

**Live Balance**
![Live Balance](https://github.com/user-attachments/assets/efe583e7-349a-4aa6-aa45-f77587a4cb46)

**Successful Transaction**
![Successful Transaction](https://github.com/user-attachments/assets/9fa73f8f-f353-42e7-ab47-13a0e45d026a)

**Transaction on StellarExpert Explorer**
![Explorer Link](https://github.com/user-attachments/assets/b0c1789d-6c19-4e21-b6db-2621c04336b2)

---

## 🔒 Security & Architecture

- **Zero Private Key Exposure** — All transaction signing is handled externally by Freighter. The dApp never requests or stores secret keys.
- **Testnet Isolation** — Hardcoded to the Stellar Testnet to ensure safe experimentation with test funds only.
- **Direct Horizon Interaction** — No centralized backend. The application communicates directly with the Stellar network for maximum transparency.
- **Stateless Design** — No user data is stored on external databases, ensuring privacy and decentralization.

---

## 🙏 Acknowledgments

- [Stellar Development Foundation](https://stellar.org/) for the amazing blockchain platform
- [Freighter](https://www.freighter.app/) for the excellent wallet extension
- [RiseIn](https://www.risein.com/) for the Stellar Journey to Mastery Program 2026

---

<p align="center">Built for educational purposes as part of the Stellar Journey to Mastery • 2026</p># React + Vite
