import { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet, kit } from "./useWallet";
import { getBalance } from "./stellar";
import { Client, networks } from "treasury";

function App() {
  const { address, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState("0");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [approveId, setApproveId] = useState("");
  const [executeId, setExecuteId] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Official Testnet XLM Token Address — extracted as named constant, not an inline magic string
  const XLM_TESTNET_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

  const isValidAddress = (addr) => /^[G][A-Z2-7]{55}$/.test(addr);
  const isValidId = (id) => id !== "" && !isNaN(id) && Number(id) >= 0 && Number(id) <= 4294967295;

  // FIX 1: String-based stroop conversion — avoids floating-point drift (e.g. 1.1 * 10_000_000 = 10999999.999...)
  const toStroops = (amt) => {
    try {
      if (!amt || isNaN(amt)) return 0n;
      const str = String(parseFloat(amt).toFixed(7)); // normalize to exactly 7 decimal places
      const [whole, frac = ""] = str.split(".");
      const padded = frac.padEnd(7, "0").slice(0, 7);
      return BigInt(whole) * 10_000_000n + BigInt(padded);
    } catch { return 0n; }
  };

  const deepExtractHash = (result) => {
    if (!result) return null;
    return result.txHash || result.hash || result.response?.hash ||
      result.sendTransactionResponse?.hash || result.status?.hash || null;
  };

  const resolveId = (result) => {
    if (!result) return null;
    const val = result.result ?? result.returnValue;
    if (val === undefined || val === null) return null;
    return typeof val === 'object' ? (val._value ?? val.value ?? val.toString()) : val;
  };

  const formatExactBalance = (bal) => {
    const num = parseFloat(bal);
    if (isNaN(num)) return "0";
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 7
    });
  };

  const treasuryClient = useMemo(() => {
    if (!address) return null;
    return new Client({
      ...networks.testnet,
      rpcUrl: "https://soroban-testnet.stellar.org",
      publicKey: address,
      // FIX 2: Robust signing — logs warning if wallet SDK response shape changes unexpectedly
      signTransaction: async (xdr) => {
        const response = await kit.signTransaction(xdr, {
          networkPassphrase: "Test SDF Network ; September 2015"
        });
        const signed = response.signedXDR || response.result || response;
        if (!response.signedXDR && !response.result) {
          console.warn("[AUDIT] signTransaction: unexpected response shape", response);
        }
        return signed;
      }
    });
  }, [address]);

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await getBalance(address);
      setBalance(bal);
    } catch (e) {
      console.warn("Silent Sync Failure:", e);
    }
  }, [address]);

  // Wipes all form data on wallet account change — prevents cross-account data leakage
  useEffect(() => {
    refreshBalance();
    setStatus(null);
    setDestination("");
    setAmount("");
    setApproveId("");
    setExecuteId("");
  }, [address, refreshBalance]);

  const runTransaction = async (actionFn, context) => {
    if (loading || !address) return;
    setLoading(true);
    setStatus({ type: "pending", msg: `Awaiting signature for ${context}...` });

    try {
      const result = await actionFn();
      const hash = deepExtractHash(result);
      const idValue = resolveId(result);

      setStatus({
        type: "success",
        // FIX 3: Null ID fallback — never renders "ID: null" in the UI
        msg: context === "Create"
          ? `Proposal Created! ID: ${idValue ?? "Check Explorer"}`
          : `${context} Confirmed!`,
        hash: hash
      });

      setTimeout(refreshBalance, 2000);
      if (context === "Create") { setDestination(""); setAmount(""); }
      if (context === "Approve") { setApproveId(""); }
      if (context === "Execute") { setExecuteId(""); }
    } catch (e) {
      console.error(`[AUDIT] ${context} Error:`, e);
      let errorMsg = "Blockchain execution failed.";
      const errStr = e?.message?.toLowerCase() || "";

      if (errStr.includes("reject") || errStr.includes("decline") || errStr.includes("cancel")) {
        errorMsg = "Transaction rejected in wallet.";
      } else if (errStr.includes("sending the transaction") || errStr.includes("failed to send") || (errStr.includes('"status"') && errStr.includes('"error"'))) {
        errorMsg = "Transaction could not be broadcast. The network may be congested — please wait a moment and try again.";
      } else if (errStr.includes("error(contract,")) {
        const code = e.message.match(/#(\d+)/)?.[1] || "Unknown";
        const errors = {
          "1": "Proposal not found. Please check the ID and try again.",
          "2": "This proposal has already been executed.",
          "3": "More approvals needed before execution.",
          "4": "Invalid address or amount provided.",
          "6": "You have already approved this proposal."
        };
        errorMsg = errors[code] || `Unexpected contract error. Code: #${code}`;
      } else if (e?.message) {
        errorMsg = e.message.split("Event log")[0].substring(0, 100);
      }
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!isValidAddress(destination)) return setStatus({ type: "error", msg: "Invalid Stellar Address format." });
    const parsed = parseFloat(amount);
    // FIX 4: Guard against 0, negative, NaN, and Infinity — all rejected
    if (!amount || parsed <= 0 || !isFinite(parsed)) return setStatus({ type: "error", msg: "Please enter a valid XLM amount greater than zero." });
    runTransaction(async () => {
      const tx = await treasuryClient.create_proposal({
        proposer: address,
        employees: [destination],
        amounts: [toStroops(amount)]
      });
      return await tx.signAndSend();
    }, "Create");
  };

  const handleApprove = () => {
    if (!isValidId(approveId)) return setStatus({ type: "error", msg: "Valid Approve ID required." });
    runTransaction(async () => {
      const tx = await treasuryClient.approve_proposal({
        approver: address,
        proposal_id: parseInt(approveId, 10)
      });
      return await tx.signAndSend();
    }, "Approve");
  };

  const handleExecute = () => {
    if (!isValidId(executeId)) return setStatus({ type: "error", msg: "Valid Execute ID required." });
    runTransaction(async () => {
      const tx = await treasuryClient.execute_proposal({
        executor: address,
        proposal_id: parseInt(executeId, 10),
        token: XLM_TESTNET_TOKEN // Official Testnet XLM Token Address
      });
      return await tx.signAndSend();
    }, "Execute");
  };

  if (!address) {
    return (
      <div className="connect-container">
        <div className="connect-card">
          <h1 className="hero-title">Stellar Pay</h1>
          <p className="hero-subtitle">On-Chain Payroll Infrastructure</p>
          <button onClick={connect} className="btn btn-hero">Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="top-nav">
        <div className="nav-brand">
          <span className="brand-dot"></span>
          <h1 className="nav-title">Stellar Pay</h1>
        </div>
        <div className="wallet-actions">
          <span className="wallet-pill">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <button onClick={disconnect} className="btn-disconnect-small" disabled={loading}>Logout</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <aside className="sidebar">
          <div className="card balance-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="label-text" style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Balance</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>Testnet</span>
            </div>
            <h2 className="big-balance" style={{ fontSize: '2.5rem', margin: '10px 0', wordBreak: 'break-all' }}>{formatExactBalance(balance)}</h2>
            <span className="currency" style={{ fontSize: '1.2rem' }}>XLM</span>
            <div className="status-indicator" style={{ marginTop: '20px', fontSize: '0.85rem' }}>
              <span className="dot online" style={{ display: 'inline-block', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', marginRight: '8px' }}></span>
              Wallet Connected
            </div>
          </div>

          {/* Protocol Notes Sidebar */}
          <div className="card info-card" style={{ marginTop: '20px', padding: '20px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#333', fontWeight: '600' }}>Protocol Overview</h3>
            <ul style={{ paddingLeft: '0', margin: '0', color: '#555', fontSize: '0.85rem', lineHeight: '1.4', listStyle: 'none' }}>
              <li style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🔐</span>
                <span><strong>Security:</strong> Requires 2 separate wallet approvals to release funds.</span>
              </li>
              <li style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                <span><strong>Efficiency:</strong> Network gas fees are &lt; 0.003 XLM per action.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🌐</span>
                <span><strong>Network:</strong> Currently operating on Stellar Testnet.</span>
              </li>
            </ul>
          </div>
        </aside>

        <section className="content-area" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          <div className="card form-card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <h2 className="card-title" style={{ marginBottom: '16px' }}>1. New Payroll Proposal</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              {/* FIX 5: aria-label on all inputs for screen reader accessibility */}
              <input
                type="text"
                className="styled-input"
                placeholder="Recipient Address (G...)"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                disabled={loading}
                aria-label="Recipient Stellar Address"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
              <input
                type="number"
                className="styled-input"
                placeholder="Amount (XLM)"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={loading}
                min="0"
                step="any"
                aria-label="Amount in XLM"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%' }}>
              <button className="btn btn-primary" onClick={handleCreate} disabled={loading} style={{ width: '100%', maxWidth: '350px', padding: '12px' }}>
                Submit Proposal
              </button>
            </div>
          </div>

          <div className="card form-card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <h2 className="card-title" style={{ marginBottom: '16px' }}>2. Sign Governance</h2>
            <div style={{ width: '100%' }}>
              <input
                type="number"
                className="styled-input"
                placeholder="Enter Proposal ID to Approve"
                value={approveId}
                onChange={e => setApproveId(e.target.value)}
                disabled={loading}
                min="0"
                aria-label="Proposal ID to Approve"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%' }}>
              <button className="btn btn-primary" onClick={handleApprove} disabled={loading} style={{ width: '100%', maxWidth: '350px', padding: '12px' }}>
                Approve Proposal
              </button>
            </div>
          </div>

          <div className="card form-card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <h2 className="card-title" style={{ marginBottom: '16px' }}>3. Finalize Execution</h2>
            <div style={{ width: '100%' }}>
              <input
                type="number"
                className="styled-input"
                placeholder="Enter Proposal ID to Execute"
                value={executeId}
                onChange={e => setExecuteId(e.target.value)}
                disabled={loading}
                min="0"
                aria-label="Proposal ID to Execute"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', width: '100%' }}>
              <button className="btn btn-primary" onClick={handleExecute} disabled={loading} style={{ width: '100%', maxWidth: '350px', padding: '12px' }}>
                Release Funds
              </button>
            </div>
          </div>

          {status && (
            <div className={`status-box status-${status.type}`} style={{ padding: '16px', borderRadius: '8px', border: '1px solid', marginTop: '10px' }}>
              <p style={{ margin: 0 }}><strong>{status.type.toUpperCase()}:</strong> {status.msg}</p>
              {status.hash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="view-link"
                  style={{ display: 'inline-block', marginTop: '10px', fontWeight: 'bold' }}
                >
                  Verify Transaction ↗
                </a>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="footer-text dashboard-footer" style={{ textAlign: 'center', marginTop: '40px', padding: '20px', opacity: 0.6 }}>
        Built as part of the Stellar Journey to Mastery • 🟡
      </footer>
    </div>
  );
}

export default App;