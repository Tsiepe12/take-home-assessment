const { getTransactions, getTransactionById } = require('../config/store'); // Import transaction data functions

/**
 * Validate Ethereum address format.
 */
function isValidAddress(address) { // Function to validate Ethereum address format
  return /^0x[a-fA-F0-9]{40}$/.test(address); // Regex to match 0x + 40 hex characters
}

/**
 * List all transactions.
 * Query params: address (filter by from/to), chainId, limit
 */
function listTransactions(req, res, next) { // Handler for GET /api/transactions endpoint
  try { // Try-catch block for error handling
    let transactions = getTransactions(); // Get all transactions from store
    const { address, chainId, limit } = req.query; // Extract query parameters

    if (address) { // Check if address filter is provided
      const addr = address.toLowerCase(); // Convert address to lowercase for comparison
      transactions = transactions.filter( // Filter transactions by address
        (t) => t.from.toLowerCase() === addr || t.to.toLowerCase() === addr // Match sender or receiver
      );
    }

    if (chainId) { // Check if chainId filter is provided
      transactions = transactions.filter((t) => String(t.chainId) === String(chainId)); // Filter by chain ID
    }

    const maxLimit = Math.min(parseInt(limit, 10) || transactions.length, 100); // Calculate maximum limit (100 max)
    transactions = transactions.slice(0, maxLimit); // Limit results to maxLimit

    res.json({ success: true, data: transactions, count: transactions.length }); // Send results as JSON
  } catch (err) { // Catch any errors that occur
    next(err); // Pass error to error handling middleware
  }
}

/**
 * Get transactions for a specific wallet address.
 */
function getWalletTransactions(req, res, next) { // Handler for GET /api/wallets/:address/transactions
  try { // Try-catch block for error handling
    const { address } = req.params; // Extract address from URL parameters

    // Validate address format
    if (!isValidAddress(address)) { // Check if address format is valid
      return res.status(400).json({ // Return 400 Bad Request
        success: false,
        error: 'Invalid Ethereum address format',
        address,
      });
    }

    const allTransactions = getTransactions(); // Get all transactions from store
    const addr = address.toLowerCase(); // Convert address to lowercase for comparison
    const walletTransactions = allTransactions.filter( // Filter transactions for this wallet
      (t) => t.from.toLowerCase() === addr || t.to.toLowerCase() === addr // Match sender or receiver
    );

    // Check if wallet exists in our wallet data
    const { getWalletsByAddress } = require('../config/store'); // Import wallet data function
    const walletExists = getWalletsByAddress(address).length > 0; // Check if wallet exists

    if (!walletExists) { // If wallet doesn't exist
      return res.status(404).json({ // Return 404 Not Found
        success: false,
        error: 'Wallet address not found',
        address,
      });
    }

    res.json({ // Send successful response
      success: true, 
      data: walletTransactions, // Filtered transactions
      count: walletTransactions.length // Number of transactions
    });
  } catch (err) { // Catch any errors that occur
    next(err); // Pass error to error handling middleware
  }
}

/**
 * Get a single transaction by ID.
 */
function getTransaction(req, res, next) { // Handler for GET /api/transactions/:id
  try { // Try-catch block for error handling
    const transaction = getTransactionById(req.params.id); // Get transaction by ID
    if (!transaction) { // If transaction not found
      return res.status(404).json({ // Return 404 Not Found
        success: false,
        error: 'Transaction not found',
        id: req.params.id,
      });
    }
    res.json({ success: true, data: transaction }); // Send transaction data
  } catch (err) { // Catch any errors that occur
    next(err); // Pass error to error handling middleware
  }
}

module.exports = { // Export all controller functions
  listTransactions,
  getWalletTransactions,
  getTransaction,
};
