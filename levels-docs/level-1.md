# ⚪ Level 1 — White Belt

> Simple XLM payment dApp built on Stellar Testnet using Freighter wallet.

Built for the **Stellar White Belt (Level 1)** challenge as part of the RiseIn Stellar Journey to Mastery Program 2026.

---

## ✨ Highlights

- **Wallet Connection** — Freighter wallet integration for authentication
- **Live Balance** — Real-time XLM balance from Horizon Testnet API
- **XLM Payments** — End-to-end payment flow to any valid Stellar address
- **Transaction Verification** — Direct link to StellarExpert after every payment
- **Error Handling** — Address validation, amount checks, wallet rejection handling

---

## 📋 How to Use

1. **Connect Wallet** — Click "Connect Wallet", ensure Freighter is on Testnet
2. **View Balance** — Your XLM balance loads automatically
3. **Send XLM** — Enter recipient address + amount → Send Payment → approve in Freighter
4. **Confirm** — Click "View on Explorer" to verify on StellarExpert

---

## 🛡️ Error Types Handled

| # | Error | Handling |
|---|---|---|
| 1 | Invalid address | Validates G... format before sending |
| 2 | Invalid amount | Rejects zero and negative values |
| 3 | Wallet rejection | Catches cancellation gracefully |

---

## 📸 Screenshots

**Wallet Connected**
![Wallet Connected](https://github.com/user-attachments/assets/1debc6f8-cf6e-44a4-a027-fd45e3e4bbad)

**Successful Transaction**
![Successful Transaction](https://github.com/user-attachments/assets/9fa73f8f-f353-42e7-ab47-13a0e45d026a)

---

## 🔒 Security

- Zero private key exposure — all signing handled by Freighter
- No backend — communicates directly with Stellar Horizon API
- Testnet isolation — safe experimentation with test funds only

---

<p align="center">White Belt ⚪ Complete · Stellar Builder Track 2026</p>