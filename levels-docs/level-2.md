# 🟡 Level 2 — Yellow Belt

> Multi-signature treasury dApp powered by a Soroban smart contract on Stellar Testnet.

Built for the **Stellar Yellow Belt (Level 2)** challenge as part of the RiseIn Stellar Journey to Mastery Program 2026.

---

## ✨ Highlights

- **Multi-Wallet Integration** — StellarWalletsKit powers seamless multi-wallet flows
- **Soroban Smart Contract** — Custom Rust treasury contract deployed to Testnet
- **Multi-Sig Governance** — Requires 2 independent wallet approvals before funds release
- **3-Step Payroll Flow** — Create proposal → Approve → Execute on-chain
- **Transaction Status** — Real-time pending/success/error tracking with hash link
- **6 Error Types Handled** — Wallet rejection, network failure, and all contract error codes

---

## 🔗 Deployed Contract

| Item | Value |
|---|---|
| Contract Address | `CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS` |
| Network | Stellar Testnet |
| Explorer | [View on StellarExpert](https://stellar.expert/explorer/testnet/contract/CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS) |

---

## 📌 Verified Transaction Hash

`66c2f2987c23c9da76c245db86b1551ffb8ced5e27bb74d20bf2c0ad0fbfeddf`

[View on StellarExpert ↗](https://stellar.expert/explorer/testnet/tx/66c2f2987c23c9da76c245db86b1551ffb8ced5e27bb74d20bf2c0ad0fbfeddf)

---

## 📋 How to Use

1. **Connect** — Click "Connect Wallet", ensure Freighter is on Testnet
2. **Create** — Enter recipient address + XLM amount → Submit Proposal → note the ID
3. **Approve** — Switch to Wallet 2 → Enter Proposal ID → Approve Proposal
4. **Execute** — Enter Proposal ID → Release Funds → verify on StellarExpert

---

## 🛡️ Error Types Handled

| # | Error | Message Shown |
|---|---|---|
| 1 | Wallet rejection | "Transaction rejected in wallet." |
| 2 | Network broadcast failure | "Network broadcast failed. Please try again." |
| 3 | Proposal not found | "Proposal not found. Please check the ID." |
| 4 | Already executed | "This proposal has already been executed." |
| 5 | Already approved | "You have already approved this proposal." |
| 6 | Not enough approvals | "More approvals needed before execution." |

---

## 📸 Screenshots

**Connect Screen**
<img width="1919" height="1019" alt="Connect Screen" src="https://github.com/user-attachments/assets/5ff20dc5-4717-4c07-abe4-e2dd2d24cb61" />

**Wallet Options**
<img width="1919" height="1019" alt="Wallet Options" src="https://github.com/user-attachments/assets/789ad03e-a29e-4d23-ba93-b40d04b25aa8" />

**Proposal Created**
<img width="1919" height="1029" alt="Proposal Created" src="https://github.com/user-attachments/assets/fcf3e438-1f92-474f-9719-f23704134ea8" />

**Execute Confirmed & Transaction Verified**
<img width="1919" height="1017" alt="Execute Confirmed" src="https://github.com/user-attachments/assets/1372e5ac-b16c-453d-80f0-817f3424a4e1" />

[View on StellarExpert ↗](https://stellar.expert/explorer/testnet/tx/66c2f2987c23c9da76c245db86b1551ffb8ced5e27bb74d20bf2c0ad0fbfeddf)

---

## 🔒 Security & Architecture

- **Zero Private Key Exposure** — All signing handled by Freighter externally
- **Multi-Sig Protection** — 2 independent approvals enforced at contract level
- **No Backend** — Communicates directly with Stellar network
- **Wallet-Switch Protection** — Form data wipes on account change
- **Testnet Isolation** — Hardcoded to Stellar Testnet

---

<p align="center">Yellow Belt 🟡 Complete · Stellar Builder Track 2026</p>