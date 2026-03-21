const express = require('express'); // Import Express framework
const walletController = require('../controllers/walletController'); // Import wallet controller
const transactionController = require('../controllers/transactionController'); // Import transaction controller

const router = express.Router(); // Create Express router

router.get('/', walletController.listWallets); // Route for GET /api/wallets
router.get('/:address/transactions', transactionController.getWalletTransactions); // Route for GET /api/wallets/:address/transactions

module.exports = router; // Export router
