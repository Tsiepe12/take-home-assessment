import React, { useState, useEffect } from 'react'; // Import React hooks
import { BrowserProvider } from 'ethers'; // Import ethers for wallet connection

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'; // API base URL from environment or default

function truncateAddress(address) { // Function to truncate Ethereum addresses for display
  if (!address || address.length < 10) return address; // Return as-is if too short
  return `${address.slice(0, 6)}...${address.slice(-4)}`; // Return first 6 chars + ... + last 4 chars
}

function Projects({ onWalletConnect }) { // Component to display projects and wallet connection
  const [projects, setProjects] = useState([]); // State for projects array
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [address, setAddress] = useState(null); // State for connected wallet address
  const [walletError, setWalletError] = useState(null); // State for wallet connection errors

  useEffect(() => { // Effect to fetch projects on component mount
    let cancelled = false; // Flag to prevent state updates on unmounted component
    async function fetchProjects() { // Async function to fetch projects
      setLoading(true); // Set loading to true
      setError(null); // Clear any previous errors
      try { // Try-catch for error handling
        const res = await fetch(`${API_BASE}/projects`); // Fetch projects from API
        if (!res.ok) throw new Error(`Failed to load projects: ${res.status}`); // Throw error if response not ok
        const json = await res.json(); // Parse JSON response
        if (!cancelled && json.data) setProjects(json.data); // Set projects if component still mounted
      } catch (err) { // Catch any errors
        if (!cancelled) setError(err.message || 'Failed to fetch projects'); // Set error message
      } finally { // Always run
        if (!cancelled) setLoading(false); // Set loading to false
      }
    }
    fetchProjects(); // Call the fetch function
    return () => { cancelled = true; }; // Cleanup function to set cancelled flag
  }, []); // Empty dependency array - effect runs once on mount

  async function connectWallet() { // Function to connect to Web3 wallet
    setWalletError(null); // Clear any previous wallet errors
    if (!window.ethereum) { // Check if MetaMask or other Web3 wallet is installed
      setWalletError('MetaMask (or another Web3 wallet) is not installed.'); // Set error message
      return; // Exit early
    }
    try { // Try-catch for wallet connection errors
      const provider = new BrowserProvider(window.ethereum); // Create ethers provider
      const accounts = await provider.send('eth_requestAccounts', []); // Request account access
      if (accounts && accounts[0]) { // If accounts returned
        const newAddress = accounts[0]; // Get first account
        setAddress(newAddress); // Set local address state
        onWalletConnect(newAddress); // Call parent callback with address
      }
    } catch (err) { // Catch any wallet connection errors
      setWalletError(err.message || 'Failed to connect wallet'); // Set error message
    }
  }

  if (loading) { // If currently loading projects
    return (
      <section className="projects-section">
        <div className="loading-spinner"></div>
        <p className="projects-loading">Loading projects…</p>
      </section>
    );
  }

  if (error) { // If there was an error fetching projects
    return (
      <section className="projects-section">
        <p className="projects-error">{error}</p>
      </section>
    );
  }

  return ( // Main render when data is loaded successfully
    <section className="projects-section">
      <div className="projects-header">
        <h2>Projects</h2>
        <div className="wallet-row">
          {address ? ( // If wallet is connected
            <span className="wallet-address" title={address}> {/* Full address on hover */}
              {truncateAddress(address)} {/* Truncated address display */}
            </span>
          ) : ( // If wallet not connected
            <button type="button" className="connect-wallet-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
        {walletError && <p className="wallet-error">{walletError}</p>} {/* Show wallet error if exists */}
      </div>
      <ul className="projects-list">
        {projects.map((p) => ( // Map over projects array
          <li key={p.id} className="project-item">
            <span className="project-name">{p.name}</span>
            <span className="project-chain">{p.chain}</span>
            <span className={`project-status project-status--${(p.status || '').replace(/\s+/g, '-')}`}>
              {p.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Projects; // Export component
