// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Globals to store current analysis data
let currentAnalysisResults = null;
let analysisHistory = [];
let marketplaceItems = [];

// Main initialization function
function init() {
  // Initialize Feather icons
  if (typeof feather !== 'undefined') {
    feather.replace();
  } else {
    console.warn('Feather icons not loaded');
  }
  
  // Set up event listeners
  setupEventListeners();
  
  // Set up tabs
  setupTabs();
  
  // Check theme preference
  checkThemePreference();
  
  // Check wallet connection (if blockchain.js is loaded)
  if (typeof checkWalletConnection === 'function') {
    checkWalletConnection();
  }
  
  // Load data from localStorage
  loadFromLocalStorage();
  
  // Populate history and marketplace tabs
  populateHistoryTab();
  populateMarketplaceTab();
}

// Set up all event listeners
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Connect wallet button (check if function exists first)
  const connectWalletBtn = document.getElementById('connectWallet');
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', () => {
      if (typeof connectWallet === 'function') {
        connectWallet();
      } else {
        alert('Blockchain functionality not available yet.');
      }
    });
  }
  
  // Analyze button
  document.getElementById('analyzeBtn').addEventListener('click', performAnalysis);
  
  // Store on blockchain button
  const storeOnChainBtn = document.getElementById('storeOnChain');
  if (storeOnChainBtn) {
    storeOnChainBtn.addEventListener('click', async () => {
      if (typeof storeAnalysisOnBlockchain === 'function') {
        const result = await storeAnalysisOnBlockchain();
        if (result) {
          // Update history with blockchain verification
          const lastAnalysisIndex = analysisHistory.length - 1;
          if (lastAnalysisIndex >= 0) {
            analysisHistory[lastAnalysisIndex].blockchainData = result;
            saveToLocalStorage();
            populateHistoryTab();
          }
        }
      } else {
        alert('Blockchain functionality not available yet.');
      }
    });
  }
  
  // File input change
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        readFileContent(file)
          .then(content => {
            document.getElementById('textInput').value = content;
          })
          .catch(error => {
            console.error('Error reading file:', error);
            alert('Failed to read file. Please try again.');
          });
      }
    });
  }
  
  // URL input + fetch button functionality
  const urlInput = document.getElementById('urlInput');
  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const url = e.target.value.trim();
        if (url) {
          fetchWebContent(url);
        }
      }
    });
  }
  
  // List data button (marketplace)
  const listDataBtn = document.getElementById('listDataBtn');
  if (listDataBtn) {
    listDataBtn.addEventListener('click', openListingModal);
  }
  
  // Setup filter for marketplace
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterMarketplaceItems(btn.dataset.category);
    });
  });
  
  // Setup filter for history
  const historyFilter = document.getElementById('historyFilter');
  const historySearch = document.getElementById('historySearch');
  
  if (historyFilter) historyFilter.addEventListener('change', filterHistory);
  if (historySearch) historySearch.addEventListener('input', filterHistory);
}

// Set up tabs functionality
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      
      // Remove active class from all buttons and hide all contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.add('hidden'));
      
      // Add active class to clicked button and show corresponding content
      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    });
  });
}

// Check user's theme preference
function checkThemePreference() {
  const darkModePreferred = localStorage.getItem('darkMode') === 'true';
  if (darkModePreferred) {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggle').textContent = '☀️';
  }
}

// Toggle between light and dark theme
function toggleTheme() {
  const darkMode = document.body.classList.toggle('dark-mode');
  document.getElementById('themeToggle').textContent = darkMode ? '☀️' : '🌙';
  
  // Save preference to localStorage
  localStorage.setItem('darkMode', darkMode);
  
  // Update chart colors if function exists
  if (typeof updateChartColorsWithTheme === 'function') {
    updateChartColorsWithTheme();
  }
}

// Main analysis function
async function performAnalysis() {
  // Get input values
  const text = document.getElementById('textInput').value.trim();
  const url = document.getElementById('urlInput').value.trim();
  const keyword = document.getElementById('keywordInput').value.trim();
  const model = document.getElementById('modelSelect').value;
  
  // Validate input
  if (!text && !url) {
    alert('Please provide text to analyze or enter a URL.');
    return;
  }
  
  // Show loading state
  document.getElementById('analyzeBtn').disabled = true;
  document.getElementById('analyzeBtn').textContent = 'Analyzing...';
  
  try {
    let contentToAnalyze = text;
    
    // If URL is provided and no text is entered, fetch content from URL
    if (url && !text) {
      contentToAnalyze = await fetchWebContent(url);
      if (!contentToAnalyze) {
        throw new Error('Failed to fetch content from URL.');
      }
    }
    
    // Apply keyword filtering if provided
    if (keyword && contentToAnalyze) {
      // Simple keyword filtering (in production, this would use more sophisticated NLP techniques)
      const sentences = contentToAnalyze.split('.');
      const filteredSentences = sentences.filter(sentence => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (filteredSentences.length === 0) {
        throw new Error(`No content found containing the keyword "${keyword}".`);
      }
      
      contentToAnalyze = filteredSentences.join('.');
    }
    
    // Start timer for analysis
    const startTime = performance.now();
    
    // Perform analysis based on selected model
    let results;
    if (model === 'advanced') {
      results = await performAdvancedAnalysis(contentToAnalyze);
    } else if (model === 'blockchain') {
      results = await performBlockchainConsensusAnalysis(contentToAnalyze);
    } else {
      results = await performBasicAnalysis(contentToAnalyze);
    }
    
    // Calculate analysis time
    const analysisTime = performance.now() - startTime;
    
    // Update UI with results
    updateAnalysisResults(results, analysisTime);
    
    // Store current analysis
    currentAnalysisResults = {
      text: contentToAnalyze.substring(0, 200) + (contentToAnalyze.length > 200 ? '...' : ''),
      results: results,
      timestamp: new Date().toISOString(),
      model: model
    };
    
    // Add to history
    addToHistory(currentAnalysisResults);
    
    // Enable the store on blockchain button if wallet is connected
    if (typeof isWalletConnected === 'function' && isWalletConnected()) {
      document.getElementById('storeOnChain').disabled = false;
    }
  } catch (error) {
    console.error('Analysis error:', error);
    alert('Error during analysis: ' + error.message);
  } finally {
    // Reset button state
    document.getElementById('analyzeBtn').disabled = false;
    document.getElementById('analyzeBtn').textContent = 'Analyze';
  }
}

// Read file content (for CSV uploads)
function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      resolve(event.target.result);
    };
    
    reader.onerror = function() {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// Fetch web content from URL
async function fetchWebContent(url) {
  try {
    // Show loading state in text area
    const textInput = document.getElementById('textInput');
    const originalText = textInput.value;
    textInput.value = 'Fetching content from URL...';
    
    // Since we're not using a backend yet, we'll simulate a response
    // In the real app, this would make an API request to the backend
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For demo purposes, generate some sample content based on the URL
    let sampleContent;
    
    if (url.includes('crypto') || url.includes('bitcoin') || url.includes('blockchain')) {
      sampleContent = `Cryptocurrency markets showed significant volatility today as Bitcoin surged to new highs. Analysts attribute this growth to institutional adoption and positive regulatory developments. Meanwhile, L1X blockchain continues to gain traction with its innovative approach to scaling and security. Experts believe that the integration of AI and blockchain technologies, as demonstrated by L1X, represents the future of the industry. Investors remain optimistic about the long-term prospects of the crypto market despite short-term fluctuations.`;
    } else if (url.includes('news') || url.includes('article')) {
      sampleContent = `Breaking news: Global markets reacted strongly to recent economic data, with stocks experiencing significant gains. The technology sector led the rally, with AI and blockchain companies showing particularly strong performance. Environmental concerns continue to shape policy discussions, with new initiatives aimed at reducing carbon emissions. Meanwhile, healthcare innovations are accelerating, promising improved treatment options for various conditions. Political tensions in several regions remain a concern for international relations experts.`;
    } else if (url.includes('review') || url.includes('product')) {
      sampleContent = `Product Review: The latest smartphone model exceeds expectations with its innovative features and improved battery life. However, the high price point may deter some consumers. The camera quality is exceptional, capturing detailed images even in low-light conditions. The user interface is intuitive and responsive, making it accessible for users of all experience levels. Some users have reported minor software glitches, but regular updates should address these issues. Overall, this product represents a significant advancement in mobile technology.`;
    } else {
      sampleContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus. Mauris iaculis porttitor posuere. Praesent id metus massa, ut blandit odio. Proin quis tortor orci. Etiam at risus et justo dignissim congue. Donec congue lacinia dui, a porttitor lectus condimentum laoreet.`;
    }
    
    // Update text area with fetched content
    textInput.value = sampleContent;
    
    return sampleContent;
  } catch (error) {
    console.error('Error fetching web content:', error);
    
    // Reset text area
    document.getElementById('textInput').value = originalText || '';
    
    // Show error
    alert(`Failed to fetch content: ${error.message}`);
    return null;
  }
}

// Perform basic sentiment analysis
async function performBasicAnalysis(text) {
  try {
    // For demo purposes (without a backend), we'll implement a simple sentiment analyzer
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Define sentiment dictionaries
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific', 'outstanding', 'brilliant', 'positive', 'success', 'successful', 'happy', 'glad', 'joy', 'love', 'best', 'better', 'impressive', 'win', 'winning', 'progress', 'improve', 'improved', 'beneficial', 'benefit', 'favorite', 'like', 'recommend'];
    
    const negativeWords = ['bad', 'awful', 'terrible', 'horrible', 'poor', 'negative', 'fail', 'failure', 'disappointing', 'disappointed', 'sad', 'unhappy', 'hate', 'dislike', 'worst', 'worse', 'problem', 'difficult', 'difficulty', 'trouble', 'unfortunately', 'hurt', 'damage', 'painful', 'annoying', 'annoy', 'angry', 'mad', 'upset'];
    
    // Normalize text for analysis
    const normalizedText = text.toLowerCase();
    const words = normalizedText.match(/\b(\w+)\b/g) || [];
    
    // Count sentiment words
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    // Calculate sentiment percentages
    const totalSentimentWords = positiveCount + negativeCount;
    const neutralCount = Math.max(words.length * 0.2, 1); // Assume some words are neutral
    
    let positivePercentage = positiveCount / (totalSentimentWords + neutralCount);
    let negativePercentage = negativeCount / (totalSentimentWords + neutralCount);
    let neutralPercentage = neutralCount / (totalSentimentWords + neutralCount);
    
    // Normalize to ensure they sum to 1
    const total = positivePercentage + negativePercentage + neutralPercentage;
    positivePercentage /= total;
    negativePercentage /= total;
    neutralPercentage /= total;
    
    // Determine overall sentiment
    let sentiment;
    if (positivePercentage > negativePercentage && positivePercentage > neutralPercentage) {
      sentiment = 'Positive';
    } else if (negativePercentage > positivePercentage && negativePercentage > neutralPercentage) {
      sentiment = 'Negative';
    } else {
      sentiment = 'Neutral';
    }
    
    // Calculate confidence
    const confidence = Math.max(positivePercentage, negativePercentage, neutralPercentage) * 100;
    
    // Extract key topics (simplified approach)
    const keyTopics = extractKeyTopics(text);
    
    // Return results
    return {
      sentiment,
      confidence,
      positive_percentage: positivePercentage,
      negative_percentage: negativePercentage,
      neutral_percentage: neutralPercentage,
      key_topics: keyTopics
    };
  } catch (error) {
    console.error('Error in basic analysis:', error);
    throw error;
  }
}

// Extract key topics from text (simplified approach)
function extractKeyTopics(text) {
  // For demo purposes, we'll use predefined topic categories
  const topicCategories = {
    'finance': ['money', 'bank', 'invest', 'stock', 'market', 'economic', 'finance', 'financial', 'economy', 'price', 'cost', 'dollar', 'euro', 'payment', 'tax', 'taxes'],
    'technology': ['tech', 'technology', 'computer', 'software', 'hardware', 'app', 'application', 'digital', 'internet', 'online', 'website', 'electronic', 'device', 'smartphone', 'laptop', 'ai', 'artificial intelligence', 'code', 'programming'],
    'blockchain': ['blockchain', 'crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'token', 'wallet', 'defi', 'nft', 'decentralized', 'l1x', 'mining', 'hash', 'ledger', 'smart contract'],
    'health': ['health', 'healthcare', 'medical', 'medicine', 'doctor', 'hospital', 'patient', 'treatment', 'disease', 'illness', 'symptom', 'cure', 'recovery', 'wellness', 'fitness', 'diet', 'exercise'],
    'environment': ['environment', 'environmental', 'climate', 'pollution', 'renewable', 'sustainable', 'green', 'eco', 'ecology', 'recycle', 'energy', 'carbon', 'emission', 'conservation', 'nature']
  };
  
  // Normalize text
  const normalizedText = text.toLowerCase();
  
  // Count occurrences of each topic's keywords
  const topicCounts = {};
  
  for (const [topic, keywords] of Object.entries(topicCategories)) {
    let count = 0;
    
    keywords.forEach(keyword => {
      // Count occurrences of each keyword
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      count += matches ? matches.length : 0;
    });
    
    topicCounts[topic] = count;
  }
  
  // Sort topics by count
  const sortedTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // If no significant topics found, use defaults
  if (sortedTopics.length === 0 || sortedTopics.every(topic => topicCounts[topic] === 0)) {
    return ['General', 'Miscellaneous', 'Other', 'Unclassified', 'Various'];
  }
  
  // Return top topics (up to 5)
  return sortedTopics.slice(0, 5);
}

// Perform advanced sentiment analysis
async function performAdvancedAnalysis(text) {
  try {
    // For the demo, we'll just enhance the basic sentiment analysis
    // In a real app, this would use a more sophisticated model
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get basic analysis first
    const basicResults = await performBasicAnalysis(text);
    
    // Apply some "advanced" adjustments
    // Increase confidence a bit
    const confidence = Math.min(basicResults.confidence * 1.2, 100);
    
    // Make slight variations to the sentiment percentages
    let positive_percentage = basicResults.positive_percentage * (1 + Math.random() * 0.1);
    let negative_percentage = basicResults.negative_percentage * (1 + Math.random() * 0.1);
    let neutral_percentage = basicResults.neutral_percentage * (1 - Math.random() * 0.1);
    
    // Normalize to ensure they sum to 1
    const total = positive_percentage + negative_percentage + neutral_percentage;
    positive_percentage /= total;
    negative_percentage /= total;
    neutral_percentage /= total;
    
    // Return enhanced results
    return {
      ...basicResults,
      confidence,
      positive_percentage,
      negative_percentage,
      neutral_percentage,
      model: 'advanced'
    };
  } catch (error) {
    console.error('Error in advanced analysis:', error);
    throw error;
  }
}

// Perform blockchain consensus analysis
async function performBlockchainConsensusAnalysis(text) {
  try {
    // For the demo, we'll simulate blockchain consensus by averaging multiple "analyses"
    // In a real app, this would query multiple validators on the blockchain
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Run multiple basic analyses with slight variations to simulate different validators
    const numValidators = 5;
    const validatorResults = [];
    
    for (let i = 0; i < numValidators; i++) {
      // Get basic analysis
      const basicResults = await performBasicAnalysis(text);
      
      // Apply some variations to simulate different validator algorithms
      const positive_percentage = basicResults.positive_percentage * (0.9 + Math.random() * 0.2);
      const negative_percentage = basicResults.negative_percentage * (0.9 + Math.random() * 0.2);
      const neutral_percentage = 1 - positive_percentage - negative_percentage;
      
      // Determine sentiment based on this validator's analysis
      let sentiment;
      if (positive_percentage > negative_percentage && positive_percentage > neutral_percentage) {
        sentiment = 'Positive';
      } else if (negative_percentage > positive_percentage && negative_percentage > neutral_percentage) {
        sentiment = 'Negative';
      } else {
        sentiment = 'Neutral';
      }
      
      validatorResults.push({
        sentiment,
        positive_percentage,
        negative_percentage,
        neutral_percentage
      });
    }
    
    // Calculate consensus
    const sentimentCounts = {
      'Positive': 0,
      'Negative': 0,
      'Neutral': 0
    };
    
    let totalPositive = 0;
    let totalNegative = 0;
    let totalNeutral = 0;
    
    validatorResults.forEach(result => {
      sentimentCounts[result.sentiment]++;
      totalPositive += result.positive_percentage;
      totalNegative += result.negative_percentage;
      totalNeutral += result.neutral_percentage;
    });
    
    // Calculate averages
    const positive_percentage = totalPositive / numValidators;
    const negative_percentage = totalNegative / numValidators;
    const neutral_percentage = totalNeutral / numValidators;
    
    // Determine consensus sentiment (majority vote)
    let sentiment;
    if (sentimentCounts['Positive'] >= sentimentCounts['Negative'] && sentimentCounts['Positive'] >= sentimentCounts['Neutral']) {
      sentiment = 'Positive';
    } else if (sentimentCounts['Negative'] >= sentimentCounts['Positive'] && sentimentCounts['Negative'] >= sentimentCounts['Neutral']) {
      sentiment = 'Negative';
    } else {
      sentiment = 'Neutral';
    }
    
    // Calculate consensus level (what percentage of validators agreed)
    const consensusLevel = (sentimentCounts[sentiment] / numValidators) * 100;
    
    // Extract key topics
    const keyTopics = extractKeyTopics(text);
    
    // Return consensus results
    return {
      sentiment,
      confidence: consensusLevel,
      positive_percentage,
      negative_percentage,
      neutral_percentage,
      consensus_level: consensusLevel,
      validator_count: numValidators,
      key_topics: keyTopics,
      model: 'blockchain'
    };
  } catch (error) {
    console.error('Error in blockchain consensus analysis:', error);
    throw error;
  }
}

// Update UI with analysis results
function updateAnalysisResults(results, analysisTime) {
  // Show results container
  document.getElementById('resultsContainer').classList.remove('hidden');
  
  // Update summary cards
  document.getElementById('overallSentiment').textContent = results.sentiment;
  document.getElementById('overallSentiment').className = 'sentiment-indicator ' + results.sentiment.toLowerCase();
  
  document.getElementById('confidenceScore').textContent = Math.round(results.confidence) + '%';
  document.getElementById('analysisTime').textContent = analysisTime.toFixed(0) + 'ms';
  
  // Update charts if chart.js functions are available
  if (typeof updateCharts === 'function') {
    updateCharts(results);
  }
}

// Add analysis to history
function addToHistory(analysisResult) {
  analysisHistory.unshift(analysisResult);
  
  // Limit history size
  if (analysisHistory.length > 20) {
    analysisHistory.pop();
  }
  
  // Save to localStorage
  saveToLocalStorage();
  
  // Update history tab
  populateHistoryTab();
}

// Populate history tab
function populateHistoryTab() {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;
  
  // Clear current content
  historyList.innerHTML = '';
  
  // Show empty state if no history
  if (analysisHistory.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <i data-feather="inbox"></i>
        <p>No analysis history yet. Start by analyzing some text!</p>
      </div>
    `;
    
    // Re-initialize Feather icons
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
    return;
  }
  
  // Add each history item
  analysisHistory.forEach((item, index) => {
    const timestamp = new Date(item.timestamp).toLocaleString();
    const results = item.results;
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    historyItem.innerHTML = `
      <div class="history-item-content">
        <div class="history-item-header">
          <span class="history-timestamp">${timestamp}</span>
          <span class="history-model">${item.model.toUpperCase()}</span>
          ${item.blockchainData ? '<span class="history-blockchain">ON BLOCKCHAIN</span>' : ''}
        </div>
        <div class="history-text">${item.text}</div>
        <div class="history-sentiment sentiment-${results.sentiment.toLowerCase()}">
          ${results.sentiment} (${Math.round(results.confidence)}% confidence)
        </div>
      </div>
      <div class="history-item-actions">
        <button class="history-action-btn" onclick="reanalyzeFromHistory(${index})">Reanalyze</button>
      </div>
    `;
    
    historyList.appendChild(historyItem);
  });
  
  // Re-initialize Feather icons
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
  
  // Apply current filter
  filterHistory();
}

// Filter history items
function filterHistory() {
  const filterValue = document.getElementById('historyFilter').value;
  const searchText = document.getElementById('historySearch').value.toLowerCase();
  const historyItems = document.querySelectorAll('.history-item');
  
  historyItems.forEach(item => {
    const sentiment = item.querySelector('.history-sentiment').textContent.toLowerCase();
    const text = item.querySelector('.history-text').textContent.toLowerCase();
    const isOnBlockchain = item.querySelector('.history-blockchain') !== null;
    
    let showItem = true;
    
    // Apply sentiment filter
    if (filterValue !== 'all') {
      if (filterValue === 'blockchain' && !isOnBlockchain) {
        showItem = false;
      } else if (filterValue !== 'blockchain' && !sentiment.includes(filterValue)) {
        showItem = false;
      }
    }
    
    // Apply search filter
    if (searchText && !text.includes(searchText)) {
      showItem = false;
    }
    
    item.style.display = showItem ? 'flex' : 'none';
  });
}

// Populate marketplace tab
function populateMarketplaceTab() {
  const marketplaceItems = document.getElementById('marketplaceItems');
  if (!marketplaceItems) return;
  
  // Clear current content
  marketplaceItems.innerHTML = '';
  
  // Show empty state if no items
  if (window.marketplaceItems.length === 0) {
    // Create some demo items for the marketplace
    for (let i = 0; i < 6; i++) {
      const categories = ['finance', 'crypto', 'product', 'social', 'news'];
      const sentiments = ['Positive', 'Negative', 'Neutral'];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      const price = (Math.random() * 10 + 1).toFixed(2);
      
      window.marketplaceItems.push({
        id: 'demo-' + i,
        title: `Demo Sentiment Dataset #${i+1}`,
        description: `Example sentiment analysis data for demonstration purposes.`,
        price: parseFloat(price),
        seller: '0x123...abc',
        category: category,
        sentiment: sentiment,
        created: new Date().toISOString(),
        isSold: Math.random() > 0.7
      });
    }
  }
  
  // Populate with marketplace items
  window.marketplaceItems.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = `marketplace-item ${item.isSold ? 'sold' : ''}`;
    itemElement.setAttribute('data-category', item.category);
    
    // Determine sentiment class
    const sentimentClass = item.sentiment.toLowerCase();
    
    itemElement.innerHTML = `
      <div class="marketplace-item-header">
        <span class="marketplace-category">${item.category}</span>
        <span class="marketplace-sentiment sentiment-${sentimentClass}">${item.sentiment}</span>
      </div>
      <h3 class="marketplace-item-title">${item.title}</h3>
      <p class="marketplace-item-description">${item.description}</p>
      <div class="marketplace-item-footer">
        <div class="marketplace-price">${item.price} L1X</div>
        <button class="marketplace-buy-btn" ${item.isSold ? 'disabled' : ''} onclick="purchaseMarketplaceItem('${item.id}')">
          ${item.isSold ? 'Sold' : 'Buy Now'}
        </button>
      </div>
    `;
    
    marketplaceItems.appendChild(itemElement);
  });
  
  // Apply current filter
  filterMarketplaceItems('all');
}

// Filter marketplace items
function filterMarketplaceItems(category) {
  const items = document.querySelectorAll('.marketplace-item');
  
  items.forEach(item => {
    if (category === 'all' || item.getAttribute('data-category') === category) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Purchase marketplace item
function purchaseMarketplaceItem(itemId) {
  if (typeof initiateBlockchainPurchase === 'function') {
    initiateBlockchainPurchase(itemId);
  } else {
    alert('Blockchain functionality not available yet.');
  }
}

// Open listing modal
function openListingModal() {
  if (!currentAnalysisResults) {
    alert('You need to perform an analysis first!');
    return;
  }
  
  // For the demo, we'll use a simple prompt
  const price = prompt('Enter the price in L1X tokens:', '5.00');
  
  if (price && !isNaN(parseFloat(price))) {
    if (typeof createBlockchainListing === 'function') {
      createBlockchainListing(price);
    } else {
      alert('Blockchain functionality not available yet.');
    }
  }
}

// Reanalyze text from history
function reanalyzeFromHistory(index) {
  const item = analysisHistory[index];
  
  if (item) {
    // Set text in the input field
    document.getElementById('textInput').value = item.text;
    
    // Set model selection
    document.getElementById('modelSelect').value = item.model;
    
    // Switch to the analyze tab
    document.querySelector('.tab-btn[data-tab="analyze"]').click();
    
    // Perform analysis
    document.getElementById('analyzeBtn').click();
  }
}

// Helper function to get sentiment color
function getSentimentColor(sentiment) {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return 'var(--success)';
    case 'negative':
      return 'var(--danger)';
    case 'neutral':
      return 'var(--warning)';
    default:
      return 'var(--primary)';
  }
}

// Save data to localStorage
function saveToLocalStorage() {
  try {
    localStorage.setItem('sentimentHistoryData', JSON.stringify(analysisHistory));
    localStorage.setItem('marketplaceItemsData', JSON.stringify(marketplaceItems));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Load data from localStorage
function loadFromLocalStorage() {
  try {
    const historyData = localStorage.getItem('sentimentHistoryData');
    const marketplaceData = localStorage.getItem('marketplaceItemsData');
    
    if (historyData) {
      analysisHistory = JSON.parse(historyData);
    }
    
    if (marketplaceData) {
      marketplaceItems = JSON.parse(marketplaceData);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
}
