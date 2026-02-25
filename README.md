# 🟠 Level 3 — Orange Belt

## Overview

Level 3 transforms Stellar Pay from a working multi-signature dApp into a production-ready application. This stage focused on reliability, user experience, performance optimization, and testing.

The application now includes structured loading states, intelligent balance caching, automatic refresh handling, live fiat value display (USD & INR), improved wallet switching behavior, structured error handling, and full test coverage across frontend and smart contract logic.

The project is publicly deployed and fully functional on Testnet.

---

## 🔴 Live Demo

**[https://stellar-pay-app.vercel.app/](https://stellar-pay-app.vercel.app/)**

---

## 🎥 Demo Video

**[Watch 1-Minute Demo](https://drive.google.com/file/d/1g_jVt3vx0t-tRuzgm6CmuiPyOul5e0JI/view?usp=drivesdk)**

---

## ✅ Submission Checklist

- [x] Mini-dApp fully functional on Stellar Testnet
- [x] 8 tests passing (5 Vitest + 3 Rust)
- [x] Public GitHub repository
- [x] 3+ meaningful commits
- [x] Fully deployed on Vercel
- [x] Demo video recorded

---

## 🟠 Level 3 Enhancements

### 1. Structured Loading States

All async actions (Create, Approve, Execute) now display clear step-based progress messages. The UI prevents duplicate actions while transactions are processing.

### 2. Balance Caching (30s TTL)

Balances are cached in memory for 30 seconds to reduce redundant Horizon calls and improve performance. After expiration, fresh data is automatically fetched.

### 3. Auto-Refresh

Balance refreshes silently every 30 seconds to ensure users always see updated on-chain data.

### 4. Wallet Switch Fix

Resolved stale balance issue during wallet switching. Balance resets instantly and re-fetches for the new address, preventing misleading data.

### 5. Live USD & INR Value Display

The dashboard shows:

- Current XLM rate
- Total wallet value in USD
- Total wallet value in INR

This provides real-world context for on-chain balances.

### 6. Improved Error Handling

Smart contract error codes are mapped to clear user-friendly messages:

- Proposal not found
- Already executed
- More approvals required
- Invalid address or amount
- Already approved

Network and wallet errors are also handled consistently.

---

## 🧪 Test Coverage

### Frontend (Vitest) — 5 Passing

```
✓ src/tests/utils.test.js (5 tests) 33ms
  ✓ Stellar Pay Utils (5)
    ✓ validates correct Stellar address
    ✓ rejects invalid Stellar address
    ✓ converts 1 XLM to stroops correctly
    ✓ formats balance correctly
    ✓ returns 0 for invalid balance
Test Files  1 passed (1)
Tests       5 passed (5)
Duration    414ms
```

> 📸 **Screenshot:**
> <img width="1397" height="666" alt="Vitest Results" src="https://github.com/user-attachments/assets/a1d7867e-92e2-4b03-a661-ffc193d0a336" />

### Rust Contract — 3 Passing

```
running 3 tests
test test::test_create_proposal                  ... ok
test test::test_approve_proposal                 ... ok
test test::test_execution_fails_without_multisig ... ok
test result: ok. 3 passed; 0 failed; 0 ignored; finished in 0.09s
```

> 📸 **Screenshot:**
> <img width="1590" height="857" alt="Rust Test Results" src="https://github.com/user-attachments/assets/55a91bae-f5f6-44ca-b73d-0de9793e81c1" />

All tests pass successfully.

---

## 📸 App Screenshots

**Connect Screen:**
<img width="1919" height="1019" alt="Connect Screen" src="https://github.com/user-attachments/assets/a8472311-8ce0-402f-a17d-b1491dbb1952" />

**Main Dashboard:**
<img width="1919" height="1019" alt="Main Dashboard" src="https://github.com/user-attachments/assets/2cd0ffa5-07ed-4d30-bd71-a911c5c83d77" />

---

## 🔗 Contract Details

| Property | Value |
|---|---|
| Contract ID | `CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS` |
| Network | Stellar Testnet |
| Explorer | [View on StellarExpert ↗](https://stellar.expert/explorer/testnet/contract/CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS) |

---

<p align="center">🟠 Orange Belt Complete — Stellar Journey to Mastery 2026</p>
