// Globals for blockchain functionality
let walletAddress = null;
let provider = null;
let signer = null;
const L1X_CHAIN_ID = 1102; // For demo purposes

// Check if user's wallet is connected
function isWalletConnected() {
  return walletAddress !== null;
}

// Check wallet connection status on page load
async function checkWalletConnection() {
  try {
    // Check if ethereum object exists (injected by MetaMask)
    if (typeof window.ethereum !== 'undefined') {
      // Set up provider
      provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get accounts
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        // User already connected
        handleAccountsChanged(accounts);
        
        // Check if user is on the correct network
        await checkAndSwitchToL1XNetwork();
        
        // Update UI
        document.getElementById('connectWallet').textContent = 'Wallet Connected';
        document.getElementById('connectWallet').classList.add('wallet-connected');
        
        // Enable blockchain functionality
        if (currentAnalysisResults) {
          document.getElementById('storeOnChain').disabled = false;
        }
        document.getElementById('listDataBtn').disabled = false;
      }
    }
  } catch (error) {
    console.error('Error checking wallet connection:', error);
  }
}

// Connect wallet function
async function connectWallet() {
  try {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use blockchain features!');
      return false;
    }
    
    // Request account access
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    
    // Handle account changes
    handleAccountsChanged(accounts);
    
    // Check and switch to L1X network
    await checkAndSwitchToL1XNetwork();
    
    // Update UI
    document.getElementById('connectWallet').textContent = 'Wallet Connected';
    document.getElementById('connectWallet').classList.add('wallet-connected');
    
    // Enable blockchain functionality
    if (currentAnalysisResults) {
      document.getElementById('storeOnChain').disabled = false;
    }
    document.getElementById('listDataBtn').disabled = false;
    
    return true;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    alert('Failed to connect wallet: ' + error.message);
    return false;
  }
}

// Handle account changes
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected their wallet
    walletAddress = null;
    
    // Update UI
    document.getElementById('connectWallet').textContent = 'Connect Wallet';
    document.getElementById('connectWallet').classList.remove('wallet-connected');
    
    // Disable blockchain functionality
    document.getElementById('storeOnChain').disabled = true;
    document.getElementById('listDataBtn').disabled = true;
  } else {
    // User connected or switched accounts
    walletAddress = accounts[0];
    
    // Get signer for transactions
    signer = provider.getSigner();
  }
}

// Check and switch to L1X network if needed
async function checkAndSwitchToL1XNetwork() {
  try {
    // For demo purposes, we'll skip actually switching networks
    // In a real app, we would:
    // 1. Check current network ID
    // 2. If not on L1X, prompt user to switch
    console.log('Checking L1X network...');
    return true;
    
    /* 
    // Real implementation would look something like this:
    const network = await provider.getNetwork();
    if (network.chainId !== L1X_CHAIN_ID) {
      try {
        await provider.send('wallet_switchEthereumChain', [{ chainId: ethers.utils.hexValue(L1X_CHAIN_ID) }]);
        return true;
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await provider.send('wallet_addEthereumChain', [{
              chainId: ethers.utils.hexValue(L1X_CHAIN_ID),
              chainName: 'L1X Blockchain',
              nativeCurrency: {
                name: 'L1X',
                symbol: 'L1X',
                decimals: 18
              },
              rpcUrls: ['https://rpc.l1x.io'],
              blockExplorerUrls: ['https://explorer.l1x.io']
            }]);
            return true;
          } catch (addError) {
            console.error('Error adding L1X network to MetaMask:', addError);
            return false;
          }
        }
        console.error('Error switching to L1X network:', switchError);
        return false;
      }
    }
    return true;
    */
  } catch (error) {
    console.error('Error checking L1X network:', error);
    return false;
  }
}

// Store analysis on blockchain
async function storeAnalysisOnBlockchain() {
  try {
    if (!isWalletConnected()) {
      const connected = await connectWallet();
      if (!connected) return null;
    }
    
    // For demo purposes, we'll simulate blockchain storage
    document.getElementById('storeOnChain').disabled = true;
    document.getElementById('storeOnChain').textContent = 'Storing...';
    
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock transaction hash
    const transactionHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Update UI
    document.getElementById('storeOnChain').textContent = 'Stored on L1X';
    document.getElementById('transactionInfo').innerHTML = `
      <p>Successfully stored on L1X blockchain!</p>
      <span class="transaction-hash">${transactionHash}</span>
    `;
    
    // Return simulated blockchain data
    return {
      transactionHash,
      timestamp: new Date().toISOString(),
      walletAddress: walletAddress
    };
  } catch (error) {
    console.error('Error storing on blockchain:', error);
    alert('Failed to store on blockchain: ' + error.message);
    
    // Reset button
    document.getElementById('storeOnChain').disabled = false;
    document.getElementById('storeOnChain').textContent = 'Store on L1X Blockchain';
    
    return null;
  }
}

// Create marketplace listing
async function createBlockchainListing(price) {
  try {
    if (!isWalletConnected()) {
      const connected = await connectWallet();
      if (!connected) return false;
    }
    
    if (!currentAnalysisResults) {
      alert('You need to perform an analysis first!');
      return false;
    }
    
    // For demo purposes, we'll simulate creating a listing
    // In a real app, this would involve smart contract interaction
    
    // Generate a unique ID for the listing
    const listingId = Date.now().toString();
    
    // Add to marketplace items
    const newListing = {
      id: listingId,
      title: `Sentiment Analysis: ${currentAnalysisResults.text.substring(0, 30)}...`,
      description: `Sentiment analysis data with ${Math.round(currentAnalysisResults.results.confidence)}% confidence.`,
      price: parseFloat(price),
      seller: walletAddress,
      category: 'crypto', // Default category
      sentiment: currentAnalysisResults.results.sentiment,
      created: new Date().toISOString(),
      isSold: false
    };
    
    marketplaceItems.push(newListing);
    saveToLocalStorage();
    populateMarketplaceTab();
    
    return true;
  } catch (error) {
    console.error('Error creating listing:', error);
    alert('Failed to create listing: ' + error.message);
    return false;
  }
}

// Initiate purchase on blockchain
async function initiateBlockchainPurchase(itemId) {
  try {
    if (!isWalletConnected()) {
      const connected = await connectWallet();
      if (!connected) return false;
    }
    
    // Find the item
    const item = marketplaceItems.find(item => item.id === itemId);
    if (!item) {
      alert('Item not found!');
      return false;
    }
    
    // For demo purposes, we'll simulate a purchase
    // In a real app, this would involve smart contract interaction
    
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mark as sold
    item.isSold = true;
    item.buyer = walletAddress;
    saveToLocalStorage();
    populateMarketplaceTab();
    
    return true;
  } catch (error) {
    console.error('Error purchasing item:', error);
    alert('Failed to purchase item: ' + error.message);
    return false;
  }
}

// Listen for account changes from MetaMask
if (window.ethereum) {
  window.ethereum.on('accountsChanged', handleAccountsChanged);
}

// Initialize blockchain functionality when the page loads
document.addEventListener('DOMContentLoaded', checkWalletConnection);
