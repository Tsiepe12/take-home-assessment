import React, { useState } from 'react'; // Import React and useState hook
import './App.css'; // Import CSS styles
import Projects from './components/Projects'; // Import Projects component
import Transactions from './components/Transactions'; // Import Transactions component

function App() { // Main App component
  const [connectedAddress, setConnectedAddress] = useState(null); // State for connected wallet address

  return ( // Main render
    <div className="App">
      <header className="App-header">
        <h1>DecryptCode Web3 Assessment</h1>
        <p>Complete tasks in ASSESSMENT.md</p>
      </header>
      <Projects onWalletConnect={setConnectedAddress} /> {/* Pass callback to Projects component */}
      <Transactions connectedAddress={connectedAddress} /> {/* Pass address to Transactions component */}
    </div>
  );
}

export default App; // Export App component
