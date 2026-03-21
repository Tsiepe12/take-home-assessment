import React, { useState, useEffect } from 'react'; // Import React hooks

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'; // API base URL from environment or default

function truncateAddress(address) { // Function to truncate Ethereum addresses for display
  if (!address || address.length < 10) return address; // Return as-is if too short
  return `${address.slice(0, 6)}...${address.slice(-4)}`; // Return first 6 chars + ... + last 4 chars
}

function Transactions({ connectedAddress }) { // Component to display wallet transactions
  const [transactions, setTransactions] = useState([]); // State for transactions array
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages

  useEffect(() => { // Effect to fetch transactions when connectedAddress changes
    if (!connectedAddress) { // If no wallet connected
      setTransactions([]); // Clear transactions
      return; // Exit early
    }

    let cancelled = false; // Flag to prevent state updates on unmounted component
    async function fetchTransactions() { // Async function to fetch transactions
      setLoading(true); // Set loading to true
      setError(null); // Clear any previous errors
      try { // Try-catch for error handling
        const res = await fetch(`${API_BASE}/transactions?address=${connectedAddress}`); // Fetch transactions for this address
        if (!res.ok) throw new Error(`Failed to load transactions: ${res.status}`); // Throw error if response not ok
        const json = await res.json(); // Parse JSON response
        if (!cancelled && json.data) setTransactions(json.data); // Set transactions if component still mounted
      } catch (err) { // Catch any errors
        if (!cancelled) setError(err.message || 'Failed to fetch transactions'); // Set error message
      } finally { // Always run
        if (!cancelled) setLoading(false); // Set loading to false
      }
    }
    fetchTransactions(); // Call the fetch function
    return () => { cancelled = true; }; // Cleanup function to set cancelled flag
  }, [connectedAddress]); // Dependency array - effect runs when connectedAddress changes

  if (!connectedAddress) { // If no wallet connected
    return (
      <section className="transactions-section">
        <h2>Transactions</h2>
        <p className="transactions-connect-prompt">Connect a wallet to view transactions</p>
      </section>
    );
  }

  if (loading) { // If currently loading
    return (
      <section className="transactions-section">
        <h2>Transactions</h2>
        <div className="loading-spinner"></div>
        <p className="transactions-loading">Loading transactions…</p>
      </section>
    );
  }

  if (error) { // If there was an error
    return (
      <section className="transactions-section">
        <h2>Transactions</h2>
        <p className="transactions-error">{error}</p>
      </section>
    );
  }

  return ( // Main render when data is loaded successfully
    <section className="transactions-section">
      <h2>Transactions</h2>
      {transactions.length === 0 ? ( // If no transactions found
        <p className="transactions-empty">No transactions found for this wallet</p>
      ) : ( // If transactions exist
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Hash</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
                <th>Token</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => ( // Map over transactions array
                <tr key={tx.id}>
                  <td className="transactions-hash">
                    <span title={tx.txHash}> {/* Full hash on hover */}
                      {truncateAddress(tx.txHash)} {/* Truncated hash display */}
                    </span>
                  </td>
                  <td className="transactions-address">
                    <span title={tx.from}> {/* Full address on hover */}
                      {truncateAddress(tx.from)} {/* Truncated address display */}
                    </span>
                  </td>
                  <td className="transactions-address">
                    <span title={tx.to}> {/* Full address on hover */}
                      {truncateAddress(tx.to)} {/* Truncated address display */}
                    </span>
                  </td>
                  <td className="transactions-value">{tx.value}</td>
                  <td className="transactions-token">{tx.token}</td>
                  <td className={`transactions-status transactions-status--${tx.status}`}>
                    {tx.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Transactions; // Export component
