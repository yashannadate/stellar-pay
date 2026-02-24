import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useWallet, kit } from "./useWallet";
import { getBalance } from "./stellar";
import { Client, networks } from "treasury";

// ── Constants ─────────────────────────────────────────────────────────────────
const balanceCache   = {};
const CACHE_TTL      = 30_000;
const XLM_TOKEN      = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const CONTRACT_ID    = "CCKR26GKAMQQOQAXYU6SLDAYFQ4V73NSDTXSD2BCQXP6EEMAA7URNJAS";
const NET_PASSPHRASE = "Test SDF Network ; September 2015";

// ── Logo — defined once, reused everywhere ────────────────────────────────────
const Logo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 3L28 9V23L16 29L4 23V9L16 3Z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="16" cy="16" r="3.5" fill="currentColor"/>
  </svg>
);

function App() {
  const { address, connect, disconnect } = useWallet();

  const [balance,       setBalance]       = useState("0");
  const [xlmPrice,      setXlmPrice]      = useState(null);
  const [destination,   setDestination]   = useState("");
  const [amount,        setAmount]        = useState("");
  const [approveId,     setApproveId]     = useState("");
  const [executeId,     setExecuteId]     = useState("");
  const [status,        setStatus]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [loadingStep,   setLoadingStep]   = useState("");
  const [funding,       setFunding]       = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState(null);
  const [linkCopied,    setLinkCopied]    = useState(false);

  const loadingRef         = useRef(false);
  const lastFetchedAddress = useRef(null); // prevents stale balance on account switch

  // ── Validators ───────────────────────────────────────────────────────────────
  const isValidAddress = (a) => /^[G][A-Z2-7]{55}$/.test(a);
  const isValidId = (id) => id !== "" && !isNaN(id) && Number(id) >= 0 && Number(id) <= 4_294_967_295;

  // ── Formatters ───────────────────────────────────────────────────────────────
  const toStroops = (amt) => {
    try {
      if (!amt || isNaN(amt) || !isFinite(parseFloat(amt))) return 0n;
      const [whole, frac = ""] = String(parseFloat(amt).toFixed(7)).split(".");
      return BigInt(whole) * 10_000_000n + BigInt(frac.padEnd(7, "0").slice(0, 7));
    } catch { return 0n; }
  };

  const fmtBalance = (bal) => {
    const n = parseFloat(bal);
    return isNaN(n) ? "0" : n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 7 });
  };

  const fmtUSD = (bal, price) => {
    if (!price || !bal) return null;
    return (parseFloat(bal) * price).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  };

  const fmtINR = (bal, price) => {
    if (!price || !bal) return null;
    return "₹" + (parseFloat(bal) * price).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  const extractHash = (r) =>
    r?.txHash || r?.hash || r?.response?.hash ||
    r?.sendTransactionResponse?.hash || r?.status?.hash || null;

  const resolveId = (r) => {
    const val = r?.result ?? r?.returnValue;
    if (val == null) return null;
    return typeof val === "object" ? (val._value ?? val.value ?? val.toString()) : val;
  };

  // ── Treasury client ───────────────────────────────────────────────────────────
  const treasuryClient = useMemo(() => {
    if (!address) return null;
    return new Client({
      ...networks.testnet,
      contractId: CONTRACT_ID,
      rpcUrl: "https://soroban-testnet.stellar.org",
      publicKey: address,
      signTransaction: async (xdr) => {
        setLoadingStep("Waiting for wallet signature...");
        const r = await kit.signTransaction(xdr, { networkPassphrase: NET_PASSPHRASE });
        setLoadingStep("Broadcasting to Stellar network...");
        return r.signedXDR || r.result || r;
      },
    });
  }, [address]);

  // ── Balance ───────────────────────────────────────────────────────────────────
  const refreshBalance = useCallback(async (target) => {
    const addr = target || address;
    if (!addr) return;
    const cached = balanceCache[addr];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (lastFetchedAddress.current === addr) setBalance(cached.value);
      return;
    }
    try {
      const bal = await getBalance(addr);
      if (lastFetchedAddress.current === addr) {
        balanceCache[addr] = { value: bal, timestamp: Date.now() };
        setBalance(bal);
      }
    } catch (e) { console.warn("Balance fetch failed:", e); }
  }, [address]);

  // Reset + fetch on account change (fixes stale balance bug)
  useEffect(() => {
    if (!address) { setBalance("0"); return; }
    lastFetchedAddress.current = address;
    setBalance("0");
    const cached = balanceCache[address];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) setBalance(cached.value);
    else refreshBalance(address);
  }, [address]);

  // Auto-refresh every 30 s
  useEffect(() => {
    if (!address) return;
    const id = setInterval(() => { delete balanceCache[address]; refreshBalance(address); }, 30_000);
    return () => clearInterval(id);
  }, [address, refreshBalance]);

  // ── XLM price ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd,inr");
        const data = await res.json();
        setXlmPrice({ usd: data?.stellar?.usd ?? null, inr: data?.stellar?.inr ?? null });
      } catch { /* non-critical, skip */ }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Magic link: auto-fill approveId from URL ──────────────────────────────────
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("approveId");
    if (id && isValidId(id)) setApproveId(id);
  }, []);

  // ── Reset form on wallet switch ───────────────────────────────────────────────
  useEffect(() => {
    setStatus(null); setDestination(""); setAmount("");
    setApproveId(""); setExecuteId(""); setLoadingStep("");
    setLastCreatedId(null); setLinkCopied(false);
  }, [address]);

  // ── Fund via Friendbot ────────────────────────────────────────────────────────
  const handleFundWallet = async () => {
    if (funding || !address) return;
    setFunding(true); setStatus(null);
    try {
      const res  = await fetch(`https://friendbot.stellar.org?addr=${address}`);
      const data = await res.json();
      if (res.ok || data?.successful) {
        delete balanceCache[address];
        setTimeout(() => refreshBalance(address), 2000);
        setStatus({ type: "success", msg: "🪙 Wallet funded! 10,000 Testnet XLM received." });
      } else {
        const e = (data?.detail || data?.extras?.result_codes?.operations?.[0] || "").toLowerCase();
        setStatus({ type: "error", msg: e.includes("existing") || e.includes("op_already")
          ? "Account already funded. Friendbot funds new accounts only."
          : "Funding failed. Try again in a few minutes." });
      }
    } catch {
      setStatus({ type: "error", msg: "Network error. Could not reach Friendbot." });
    } finally { setFunding(false); }
  };

  // ── Copy magic link ───────────────────────────────────────────────────────────
  const handleCopyLink = () => {
    if (lastCreatedId == null) return;
    const link = `${window.location.origin}${window.location.pathname}?approveId=${lastCreatedId}`;
    navigator.clipboard.writeText(link).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  // ── Transaction runner ────────────────────────────────────────────────────────
  const runTx = async (actionFn, context) => {
    if (loadingRef.current || !address) return;
    loadingRef.current = true;
    setLoading(true); setStatus(null);
    setLoadingStep(`Preparing ${context} transaction...`);

    try {
      const result  = await actionFn();
      const hash    = extractHash(result);
      const idValue = resolveId(result);
      delete balanceCache[address];

      if (context === "Create" && idValue != null) setLastCreatedId(idValue);

      setStatus({
        type: "success",
        msg: context === "Create" ? `Proposal Created! ID: ${idValue ?? "Check Explorer"}` : `${context} Confirmed!`,
        hash,
      });

      const addr = address;
      setTimeout(() => refreshBalance(addr), 2000);
      if (context === "Create")  { setDestination(""); setAmount(""); }
      if (context === "Approve") setApproveId("");
      if (context === "Execute") setExecuteId("");

    } catch (e) {
      console.error(`[TX] ${context}:`, e);
      const s = (e?.message || "").toLowerCase();
      let msg = "Transaction failed. Please try again.";
      if (s.includes("reject") || s.includes("cancel") || s.includes("user"))
        msg = "Transaction cancelled in wallet.";
      else if (s.includes("network") || s.includes("broadcast") || s.includes("send"))
        msg = "Network broadcast failed. Please try again.";
      else if (s.includes("error(contract,")) {
        const code = e.message.match(/#(\d+)/)?.[1] || "?";
        msg = ({ "1": "Proposal not found.", "2": "Already executed.",
                 "3": "More approvals needed.", "4": "Invalid address or amount.",
                 "6": "Already approved." })[code] || `Contract Error #${code}.`;
      }
      setStatus({ type: "error", msg });
    } finally {
      loadingRef.current = false;
      setLoading(false); setLoadingStep("");
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleCreate = () => {
    if (!isValidAddress(destination))
      return setStatus({ type: "error", msg: "Invalid Stellar address. Must start with G and be 56 characters." });
    if (!amount || parseFloat(amount) <= 0 || !isFinite(parseFloat(amount)))
      return setStatus({ type: "error", msg: "Please enter a valid XLM amount greater than zero." });
    runTx(async () => {
      const tx = await treasuryClient.create_proposal({ proposer: address, employees: [destination], amounts: [toStroops(amount)] });
      return tx.signAndSend();
    }, "Create");
  };

  const handleApprove = () => {
    if (!isValidId(approveId)) return setStatus({ type: "error", msg: "Please enter a valid Proposal ID." });
    runTx(async () => {
      const tx = await treasuryClient.approve_proposal({ approver: address, proposal_id: parseInt(approveId, 10) });
      return tx.signAndSend();
    }, "Approve");
  };

  const handleExecute = () => {
    if (!isValidId(executeId)) return setStatus({ type: "error", msg: "Please enter a valid Proposal ID." });
    runTx(async () => {
      const tx = await treasuryClient.execute_proposal({ executor: address, proposal_id: parseInt(executeId, 10), token: XLM_TOKEN });
      return tx.signAndSend();
    }, "Execute");
  };

  // ── Shared footer ─────────────────────────────────────────────────────────────
  const Footer = () => (
    <footer className="app-footer">
      <div className="footer-left">
        <div className="footer-brand">
          <Logo size={16} />
          <span className="brand-name">
            <span className="title-stellar">Stellar</span><span className="title-pay">Pay</span>
          </span>
        </div>
        <div className="footer-divider" />
        <div className="footer-belt"><span className="belt-icon">🟠</span> Orange Belt</div>
      </div>
      <div className="footer-right">
        <div className="footer-credit">
          Built with <span className="heart">🤍</span> for the{" "}
          <span className="highlight">Rise In Stellar Journey to Mastery</span>
        </div>
      </div>
    </footer>
  );

  // ── Connect screen ────────────────────────────────────────────────────────────
  if (!address) {
    return (
      <div className="page-wrapper">
        <div className="connect-container">
          <div className="connect-card">
            <div className="logo-mark"><Logo size={32} /></div>
            <h1 className="hero-title">
              <span className="title-stellar">Stellar</span><span className="title-pay">Pay</span>
            </h1>
            <p className="hero-subtitle">On-Chain Payroll Infrastructure</p>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">Multi-Sig</span>
                <span className="hero-stat-label">2 Approvals</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">On-Chain</span>
                <span className="hero-stat-label">Soroban Contract</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">Fast Pay</span>
                <span className="hero-stat-label">~5s Settlement</span>
              </div>
            </div>
            <button onClick={connect} className="btn btn-hero">Connect Wallet</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <div className="app-container">

      <header className="top-nav">
        <div className="nav-brand">
          <div className="nav-logo"><Logo size={18} /></div>
          <h1 className="nav-title">
            <span className="title-stellar">Stellar</span><span className="title-pay">Pay</span>
          </h1>
        </div>
        <div className="wallet-actions">
          <button onClick={handleFundWallet} className="btn-fund" disabled={funding || loading}>
            {funding ? "Funding..." : "＋ Fund Wallet"}
          </button>
          <span className="wallet-pill" title={address}>{address.slice(0, 6)}...{address.slice(-4)}</span>
          <button onClick={disconnect} className="btn-disconnect-small" disabled={loading}>Disconnect</button>
        </div>
      </header>

      <main className="dashboard-grid">
        <aside className="sidebar">

          <div className="card balance-card">
            <div className="balance-header">
              <span className="label-text">Total Balance</span>
              <span className="badge">Testnet</span>
            </div>
            <h2 className="big-balance">{fmtBalance(balance)}</h2>
            <span className="currency">XLM</span>
            {xlmPrice?.usd && (
              <div className="usd-value">
                <div className="price-row">
                  <span className="price-flag">🇺🇸</span>
                  <span>{fmtUSD(balance, xlmPrice.usd)}</span>
                  <span className="price-rate">${xlmPrice.usd.toFixed(4)}/XLM</span>
                </div>
                {xlmPrice?.inr && (
                  <div className="price-row">
                    <span className="price-flag">🇮🇳</span>
                    <span>{fmtINR(balance, xlmPrice.inr)}</span>
                    <span className="price-rate">₹{xlmPrice.inr.toFixed(2)}/XLM</span>
                  </div>
                )}
              </div>
            )}
            <div className="status-indicator">
              <span className="dot-online" />
              Wallet Connected
            </div>
          </div>

          <div className="card info-card">
            <h3 className="info-title">Protocol Overview</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-icon">🔐</span>
                <div><strong>Multisig Security</strong><p>Requires 2 separate wallet approvals to release funds.</p></div>
              </div>
              <div className="info-item">
                <span className="info-icon">⚡</span>
                <div><strong>Cost-Efficiency</strong><p>Network fees less than 0.002 XLM per action.</p></div>
              </div>
              <div className="info-item">
                <span className="info-icon">🌐</span>
                <div><strong>Stellar Testnet</strong><p>Live on-chain, verifiable transactions.</p></div>
              </div>
            </div>
          </div>

        </aside>

        <section className="content-area">

          <div className="card form-card">
            <div className="step-header">
              <span className="step-num">01</span>
              <h2 className="card-title">New Payroll Proposal</h2>
            </div>
            <input type="text"   className="styled-input" placeholder="Recipient Address (G...)" value={destination} onChange={e => setDestination(e.target.value)} disabled={loading} autoComplete="off" spellCheck={false} aria-label="Recipient Address" />
            <input type="number" className="styled-input" placeholder="Amount (XLM)"             value={amount}      onChange={e => setAmount(e.target.value)}      disabled={loading} min="0" step="any" aria-label="Amount in XLM" />
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
              {loading && loadingStep.toLowerCase().includes("create") ? "Processing..." : "Submit Proposal →"}
            </button>
            {lastCreatedId != null && (
              <div className="magic-link-box">
                <div className="magic-link-info">
                  <span className="magic-link-icon">🔗</span>
                  <div>
                    <strong>Proposal #{lastCreatedId} created</strong>
                    <p>Share this link with the second approver — it auto-fills their Approve form.</p>
                  </div>
                </div>
                <button className="btn-magic" onClick={handleCopyLink}>
                  {linkCopied ? "✓ Copied!" : "Copy Approval Link"}
                </button>
              </div>
            )}
          </div>

          <div className="card form-card">
            <div className="step-header">
              <span className="step-num">02</span>
              <h2 className="card-title">Sign Governance</h2>
            </div>
            <input type="number" className="styled-input" placeholder="Enter Proposal ID to Approve" value={approveId} onChange={e => setApproveId(e.target.value)} disabled={loading} min="0" aria-label="Proposal ID to Approve" />
            <button className="btn btn-primary" onClick={handleApprove} disabled={loading}>
              {loading && loadingStep.toLowerCase().includes("approve") ? "Processing..." : "Approve Proposal →"}
            </button>
          </div>

          <div className="card form-card">
            <div className="step-header">
              <span className="step-num">03</span>
              <h2 className="card-title">Finalize Execution</h2>
            </div>
            <input type="number" className="styled-input" placeholder="Enter Proposal ID to Execute" value={executeId} onChange={e => setExecuteId(e.target.value)} disabled={loading} min="0" aria-label="Proposal ID to Execute" />
            <button className="btn btn-primary" onClick={handleExecute} disabled={loading}>
              {loading && loadingStep.toLowerCase().includes("execute") ? "Processing..." : "Release Funds →"}
            </button>
          </div>

          {loading && loadingStep && (
            <div className="status-box status-pending" role="status">
              <p>⏳ {loadingStep}</p>
            </div>
          )}

          {status && !loading && (
            <div className={`status-box status-${status.type}`} role="alert">
              <p><strong>{status.type.toUpperCase()}:</strong> {status.msg}</p>
              {status.hash && (
                <a href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`} target="_blank" rel="noreferrer noopener">
                  Verify Transaction ↗
                </a>
              )}
            </div>
          )}

        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;