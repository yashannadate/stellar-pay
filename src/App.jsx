import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useWallet, kit } from "./useWallet";
import { getBalance } from "./stellar";
import { Client, networks } from "treasury";

// ─── In-Memory Balance Cache (Orange Belt) ────────────────────────────────────
const balanceCache = {};
const CACHE_TTL = 30_000; // 30 seconds

function App() {
  const { address, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState("0");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [approveId, setApproveId] = useState("");
  const [executeId, setExecuteId] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  const loadingRef = useRef(false);

  const XLM_TESTNET_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
  const CONTRACT_ID = "CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS";

  const isValidAddress = (addr) => /^[G][A-Z2-7]{55}$/.test(addr);
  const isValidId = (id) => id !== "" && !isNaN(id) && Number(id) >= 0 && Number(id) <= 4294967295;

  const toStroops = (amt) => {
    try {
      if (!amt || isNaN(amt) || !isFinite(parseFloat(amt))) return 0n;
      const str = String(parseFloat(amt).toFixed(7));
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
      contractId: CONTRACT_ID,
      rpcUrl: "https://soroban-testnet.stellar.org",
      publicKey: address,
      signTransaction: async (xdr) => {
        setLoadingStep("Waiting for wallet signature...");
        const response = await kit.signTransaction(xdr, {
          networkPassphrase: "Test SDF Network ; September 2015"
        });
        setLoadingStep("Broadcasting to Stellar network...");
        return response.signedXDR || response.result || response;
      }
    });
  }, [address]);

  // ─── Cached Balance Fetch ─────────────────────────────────────────────────
  const refreshBalance = useCallback(async () => {
    if (!address) return;
    const cached = balanceCache[address];
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL) {
      setBalance(cached.value);
      return;
    }
    try {
      const bal = await getBalance(address);
      balanceCache[address] = { value: bal, timestamp: now };
      setBalance(bal);
    } catch (e) {
      console.warn("Balance fetch failed:", e);
    }
  }, [address]);

  useEffect(() => {
    if (address) refreshBalance();
  }, [address, refreshBalance]);

  // Clear all fields on wallet switch
  useEffect(() => {
    setStatus(null);
    setDestination("");
    setAmount("");
    setApproveId("");
    setExecuteId("");
    setLoadingStep("");
  }, [address]);

  const runTransaction = async (actionFn, context) => {
    if (loadingRef.current || !address) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadingStep(`Preparing ${context} transaction...`);
    setStatus(null);

    try {
      const result = await actionFn();
      const hash = deepExtractHash(result);
      const idValue = resolveId(result);

      // Invalidate cache after successful transaction
      delete balanceCache[address];

      setStatus({
        type: "success",
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
      console.error(`[ERROR] ${context}:`, e);
      let errorMsg = "Transaction failed. Please try again.";
      const errStr = e?.message?.toLowerCase() || "";

      if (errStr.includes("reject") || errStr.includes("cancel") || errStr.includes("user")) {
        errorMsg = "Transaction cancelled in wallet.";
      } else if (errStr.includes("network") || errStr.includes("broadcast") || errStr.includes("send")) {
        errorMsg = "Network broadcast failed. Please try again.";
      } else if (errStr.includes("error(contract,")) {
        const code = e.message.match(/#(\d+)/)?.[1] || "Unknown";
        const errors = {
          "1": "Proposal not found. Please check the ID and try again.",
          "2": "This proposal has already been executed.",
          "3": "More approvals needed before execution.",
          "4": "Invalid address or amount provided.",
          "6": "You have already approved this proposal."
        };
        errorMsg = errors[code] || `Contract Error #${code}. Please try again.`;
      }
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleCreate = () => {
    if (!isValidAddress(destination)) return setStatus({ type: "error", msg: "Invalid Stellar address. Must start with G and be 56 characters." });
    const parsed = parseFloat(amount);
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
    if (!isValidId(approveId)) return setStatus({ type: "error", msg: "Please enter a valid Proposal ID." });
    runTransaction(async () => {
      const tx = await treasuryClient.approve_proposal({
        approver: address,
        proposal_id: parseInt(approveId, 10)
      });
      return await tx.signAndSend();
    }, "Approve");
  };

  const handleExecute = () => {
    if (!isValidId(executeId)) return setStatus({ type: "error", msg: "Please enter a valid Proposal ID." });
    runTransaction(async () => {
      const tx = await treasuryClient.execute_proposal({
        executor: address,
        proposal_id: parseInt(executeId, 10),
        token: XLM_TESTNET_TOKEN
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
        <footer className="footer-text">
          Built for Stellar Journey to Mastery 
        </footer>
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
          <button
            onClick={disconnect}
            className="btn-disconnect-small"
            disabled={loading}
          >
            Disconnect
          </button>
        </div>
      </header>

      <main className="dashboard-grid">
        <aside className="sidebar">
          <div className="card balance-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span className="label-text" style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Balance</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>Testnet</span>
            </div>
            <h2 className="big-balance" style={{ fontSize: '2.5rem', margin: '10px 0', wordBreak: 'break-all' }}>
              {formatExactBalance(balance)}
            </h2>
            <span className="currency" style={{ fontSize: '1.2rem' }}>XLM</span>
            <div className="status-indicator" style={{ marginTop: '20px', fontSize: '0.85rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', marginRight: '8px' }}></span>
              Wallet Connected
            </div>
          </div>

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
          <div className="card form-card">
            <h2 className="card-title">1. New Payroll Proposal</h2>
            <input
              type="text"
              className="styled-input"
              placeholder="Recipient Address (G...)"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              disabled={loading}
              aria-label="Recipient Address"
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
            />
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
              {loading && loadingStep.toLowerCase().includes("create") ? "⏳ Processing..." : "Submit Proposal"}
            </button>
          </div>

          <div className="card form-card">
            <h2 className="card-title">2. Sign Governance</h2>
            <input
              type="number"
              className="styled-input"
              placeholder="Enter Proposal ID to Approve"
              value={approveId}
              onChange={e => setApproveId(e.target.value)}
              disabled={loading}
              min="0"
              aria-label="Proposal ID to Approve"
            />
            <button className="btn btn-primary" onClick={handleApprove} disabled={loading}>
              {loading && loadingStep.toLowerCase().includes("approve") ? "⏳ Processing..." : "Approve Proposal"}
            </button>
          </div>

          <div className="card form-card">
            <h2 className="card-title">3. Finalize Execution</h2>
            <input
              type="number"
              className="styled-input"
              placeholder="Enter Proposal ID to Execute"
              value={executeId}
              onChange={e => setExecuteId(e.target.value)}
              disabled={loading}
              min="0"
              aria-label="Proposal ID to Execute"
            />
            <button className="btn btn-primary" onClick={handleExecute} disabled={loading}>
              {loading && loadingStep.toLowerCase().includes("execute") ? "⏳ Processing..." : "Release Funds"}
            </button>
          </div>

          {/* Loading Progress Indicator */}
          {loading && loadingStep && (
            <div className="status-box status-pending">
              <p>⏳ {loadingStep}</p>
            </div>
          )}

          {/* Status Result */}
          {status && !loading && (
            <div className={`status-box status-${status.type}`}>
              <p><strong>{status.type.toUpperCase()}:</strong> {status.msg}</p>
              {status.hash && (
                <a href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`} target="_blank" rel="noreferrer">
                  Verify Transaction ↗
                </a>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="footer-text dashboard-footer">
        Built for Stellar Journey to Mastery
      </footer>
    </div>
  );
}

export default App;