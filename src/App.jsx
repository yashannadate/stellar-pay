import { useState, useEffect } from "react";
import { useWallet } from "./useWallet";
import { getBalance, sendPayment } from "./stellar";

function App() {
  const { address, connect, disconnect } = useWallet();
  const [balance, setBalance] = useState("0");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      getBalance(address).then(setBalance);
    } else {
      setBalance("0");
    }
  }, [address]);

  const formatDisplayBalance = (bal) => {
    const number = parseFloat(bal);
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 7,
    }).format(number);
  };

  const handleSend = async () => {
    setStatus(null);
    setLoading(true);
    try {
      const result = await sendPayment(address, destination, amount);
      setStatus({
        type: "success",
        msg: "Payment Sent Successfully!",
        hash: result.hash,
      });
      const newBal = await getBalance(address);
      setBalance(newBal);
      setDestination("");
      setAmount("");
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        msg: error.message || "Payment Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="connect-container">
        <div className="connect-card">
          <h1 className="hero-title">Stellar Pay</h1>
          <p className="hero-subtitle">
            Securely connect your Freighter wallet to access the <br />
            Stellar Testnet dashboard.
          </p>
          
          <button onClick={connect} className="btn btn-hero">
            Connect Wallet
          </button>
          
          <a 
            href="https://www.freighter.app/" 
            target="_blank" 
            rel="noreferrer" 
            className="btn btn-secondary"
          >
            Download Freighter ↗
          </a>
        </div>
        
        <footer className="footer-text">
          Built for the Stellar Level-1 White Belt ⚪
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="top-nav">
        <div className="nav-brand">
          <span className="brand-dot"></span>
          <h1 className="nav-title">Stellar Pay</h1>
        </div>
        <div className="wallet-actions">
          <span className="wallet-pill">
            {address.slice(0, 4)}...{address.slice(-4)}
          </span>
          <button onClick={disconnect} className="btn-disconnect-small">
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="dashboard-grid">
        <aside className="sidebar">
          <div className="card balance-card">
            <div className="card-header">
              <span className="label-text">Total Balance</span>
              <span className="network-badge">Testnet</span>
            </div>
            <div className="balance-display">
              <h2 className="big-balance">{formatDisplayBalance(balance)}</h2>
              <span className="currency">XLM</span>
            </div>
            <div className="status-indicator">
              <span className="dot online"></span>
              Wallet Connected
            </div>
          </div>

          <div className="card info-card">
            <h3>Quick Tips</h3>
            <ul className="info-list">
              <li>Ensure you are on <strong>Testnet</strong> in Freighter.</li>
              <li>Minimum network reserve is <strong>1 XLM</strong>.</li>
              <li>Transactions usually take 3-5 seconds.</li>
            </ul>
          </div>
        </aside>

        <section className="content-area">
          <div className="card form-card">
            <h2 className="card-title">Send Payment</h2>
            
            <div className="input-group">
              <label className="input-label">Recipient Address</label>
              <input
                type="text"
                className="styled-input"
                placeholder="G..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Amount (XLM)</label>
              <input
                type="number"
                className="styled-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? "Processing..." : "Send Payment"}
            </button>

            {status && (
              <div className={`status-box ${status.type === "success" ? "status-success" : "status-error"}`}>
                <p>{status.msg}</p>
                {status.hash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${status.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="view-link"
                  >
                    View on Explorer ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer-text dashboard-footer">
        Built for the Stellar Level-1 White Belt ⚪
      </footer>
    </div>
  );
}

export default App;