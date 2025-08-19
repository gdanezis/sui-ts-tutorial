/**
 * Sui Wallet Operations Tutorial
 * 
 * This tutorial demonstrates how to:
 * 1. Discover available Sui wallets automatically on page load
 * 2. Connect to wallets with user interaction
 * 3. Disconnect from wallets and clear stored data
 * 4. Access and display wallet accounts
 * 5. Handle wallet connection states dynamically
 * 6. Listen to wallet events for automatic state changes
 * 7. Persist wallet connections using localStorage
 * 8. Auto-reconnect to previously connected wallets
 * 
 * Key Concepts:
 * - Wallet Standard: Uses @mysten/wallet-standard for consistent wallet interactions
 * - Connection State: Determined by presence of accounts in wallet.accounts array
 * - Event System: Wallets emit 'change' events for accounts, features, and chains
 * - Account Structure: Each account has address (Sui address) and publicKey properties
 * - Persistence: Connection state saved to localStorage for seamless user experience
 * - Auto-Connection: Silent reconnection using connect({ silent: true })
 * - Account Selection: User can choose accounts with persistence of selection
 */

// Import the getWallets function from Mysten's wallet standard library
// This is the main entry point for discovering available Sui wallets
import { getWallets } from '@mysten/wallet-standard';

/**
 * Interface for storing wallet connection state in localStorage
 */
interface StoredWalletConnection {
  walletName: string;
  accountAddress: string;
  accountIndex: number;
}

/**
 * LocalStorage key for storing wallet connection state
 */
const WALLET_CONNECTION_KEY = 'sui_wallet_connection';

/**
 * Save the current wallet connection to localStorage
 * 
 * This function persists the user's wallet choice and selected account so that
 * on subsequent visits, the app can automatically reconnect to the same wallet
 * and select the same account without user intervention.
 * 
 * @param walletName - Name of the connected wallet (e.g., "Sui Wallet")
 * @param accountAddress - Full Sui address of the selected account
 * @param accountIndex - Zero-based index of the selected account in wallet.accounts array
 */
function saveWalletConnection(walletName: string, accountAddress: string, accountIndex: number): void {
  const connectionData: StoredWalletConnection = {
    walletName,
    accountAddress,
    accountIndex
  };
  
  try {
    localStorage.setItem(WALLET_CONNECTION_KEY, JSON.stringify(connectionData));
    console.log(`Saved wallet connection: ${walletName} - Account ${accountIndex + 1}`);
  } catch (error) {
    console.error('Failed to save wallet connection:', error);
  }
}

/**
 * Load wallet connection from localStorage
 * 
 * Retrieves previously saved wallet connection data to enable automatic
 * reconnection. Returns null if no previous connection was saved or if
 * the stored data is invalid.
 * 
 * @returns Stored wallet connection data or null if none exists or invalid
 */
function loadWalletConnection(): StoredWalletConnection | null {
  try {
    const stored = localStorage.getItem(WALLET_CONNECTION_KEY);
    if (stored) {
      const connectionData: StoredWalletConnection = JSON.parse(stored);
      console.log(`Loaded wallet connection: ${connectionData.walletName} - Account ${connectionData.accountIndex + 1}`);
      return connectionData;
    }
  } catch (error) {
    console.error('Failed to load wallet connection:', error);
  }
  return null;
}

/**
 * Clear stored wallet connection from localStorage
 * 
 * Removes all saved wallet connection data. Called when:
 * - User explicitly disconnects from a wallet
 * - Auto-connection fails (wallet not found, account mismatch)
 * - Stored data becomes invalid or corrupted
 */
function clearWalletConnection(): void {
  try {
    localStorage.removeItem(WALLET_CONNECTION_KEY);
    console.log('Cleared stored wallet connection');
  } catch (error) {
    console.error('Failed to clear wallet connection:', error);
  }
}

/**
 * Attempt to auto-connect to a previously connected wallet
 * 
 * This function provides seamless user experience by automatically reconnecting
 * to the wallet and account the user was using in their previous session.
 * Uses silent connection to avoid prompting the user.
 * 
 * Process:
 * 1. Load stored connection data from localStorage
 * 2. Find the matching wallet by name in available wallets
 * 3. Attempt silent connection using connect({ silent: true })
 * 4. Verify the stored account still exists and matches
 * 5. Clean up invalid data if connection fails
 * 
 * @param availableWallets - Array of currently available wallet objects
 * @returns Promise<boolean> - True if auto-connection was successful, false otherwise
 */
async function autoConnectWallet(availableWallets: readonly any[]): Promise<boolean> {
  const storedConnection = loadWalletConnection();
  if (!storedConnection) return false;

  // Find the wallet by name
  const wallet = availableWallets.find(w => w.name === storedConnection.walletName);
  if (!wallet) {
    console.log(`Previously connected wallet "${storedConnection.walletName}" not found`);
    clearWalletConnection();
    return false;
  }

  try {
    // Attempt silent connection
    const connectFeature = wallet.features['standard:connect'] as any;
    await connectFeature.connect({ silent: true });
    
    // Verify the account still exists and matches
    if (wallet.accounts && 
        wallet.accounts.length > storedConnection.accountIndex && 
        wallet.accounts[storedConnection.accountIndex].address === storedConnection.accountAddress) {
      
      console.log(`Auto-connected to ${wallet.name} with account ${storedConnection.accountIndex + 1}`);
      return true;
    } else {
      console.log('Stored account no longer matches, clearing connection');
      clearWalletConnection();
      return false;
    }
  } catch (error) {
    console.log(`Failed to auto-connect to ${wallet.name}:`, error);
    clearWalletConnection();
    return false;
  }
}

/**
 * Main function to display all available Sui wallets and their connection states
 * 
 * This function runs automatically on page load and:
 * - Discovers all installed Sui wallet extensions with debugging
 * - Attempts silent auto-connection to previously connected wallet
 * - Registers event listeners for wallet state changes
 * - Shows connection status with visual indicators (● Connected / ○ Disconnected)
 * - Displays appropriate action buttons (Connect/Disconnect) based on state
 * - Shows account information for connected wallets
 * - Automatically refreshes UI when wallet events occur
 * - Persists user wallet and account selections in localStorage
 * - Handles account selection changes with real-time saving
 */
async function displaySuiWallets(): Promise<void> {
  // Get the output container element where we'll display wallet information
  const output = document.getElementById('output');
  if (!output) return;

  // STEP 1: Discover available wallets
  // getWallets() returns a registry of all available wallet standards
  // .get() returns an array of wallet objects that support the Sui standard
  const availableWallets = getWallets().get();
  
  // Debug: Log discovered wallets
  console.log(`Discovered ${availableWallets.length} wallets:`, availableWallets.map(w => ({
    name: w.name,
    version: w.version,
    accounts: w.accounts?.length || 0
  })));

  // STEP 1.1: Attempt auto-connection to previously connected wallet
  // This happens only on the first call to displaySuiWallets
  if (!output.innerHTML || output.innerHTML === 'Loading wallets...') {
    await autoConnectWallet(availableWallets);
  }

  // STEP 1.5: Register event listeners for wallet changes
  // This helps detect when wallets change their connection state
  // The wallet standard defines 'change' events for:
  // - accounts: User added/removed accounts for your app
  // - features: User changed permissions for wallet features  
  // - chains: User switched networks (Devnet/Testnet/Mainnet)
  availableWallets.forEach((wallet, walletIndex) => {
    if (wallet.features && wallet.features['standard:events']) {
      try {
        const eventsFeature = wallet.features['standard:events'] as any;
        
        // Register callback for all change events
        // This will automatically refresh the UI when wallet state changes
        const unsubscribe = eventsFeature.on('change', (event: any) => {
          console.log(`Wallet event from ${wallet.name}:`, event);
          
          // Refresh the display when wallet state changes
          // Small delay to allow wallet state to update
          setTimeout(() => displaySuiWallets(), 100);
        });
        
        // Store unsubscribe function for cleanup if needed
        // This allows removing event listeners later to prevent memory leaks
        (window as any)[`unsubscribe_${walletIndex}`] = unsubscribe;
        
      } catch (error) {
        // Events not supported - this is fine, not all wallets implement events
      }
    }
  });
  
  if (availableWallets.length === 0) {
    // No wallets found - user needs to install a Sui wallet extension
    output.innerHTML = '<p>No Sui wallets found. Please install a Sui wallet extension.</p>';
  } else {
    let walletList = '<h3>Available Sui Wallets:</h3>';
    
    // STEP 2: Process each discovered wallet
    availableWallets.forEach((wallet, index) => {
      // STEP 3: Check connection status
      // A wallet is considered "connected" if it has populated accounts
      // wallet.accounts will be an empty array or undefined when disconnected
      // and will contain WalletAccount objects when connected

      const isConnected = wallet.accounts.length > 0;
      
      // STEP 4: Build HTML for each wallet
      walletList += `
        <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; border-radius: 5px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <!-- Display wallet icon - each wallet provides its own icon -->
            <img src="${wallet.icon}" alt="${wallet.name}" style="width: 32px; height: 32px;" />
            <div>
              <!-- Show wallet name and version -->
              <strong>${wallet.name}</strong> - ${wallet.version}
              <!-- Visual connection status indicator -->
              ${isConnected ? '<span style="color: green; margin-left: 10px;">● Connected</span>' : '<span style="color: gray; margin-left: 10px;">○ Disconnected</span>'}
            </div>
          </div>
          <div style="margin-top: 10px;">
            <!-- STEP 5: Show appropriate action button based on connection state -->
            ${isConnected ? 
              // If connected, show disconnect button only
              `<button id="disconnect-${index}" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Disconnect</button>` :
              // If disconnected, show connect button only
              `<button id="connect-${index}" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Connect</button>`
            }
          </div>
          <!-- STEP 6: Account display section (visible only when connected) -->
          <div id="accounts-${index}" style="margin-top: 10px; display: ${isConnected ? 'block' : 'none'};">
            <h4>Accounts:</h4>
            <div id="account-list-${index}"></div>
            <div style="margin-top: 10px;">
              <label for="selected-account-${index}">Selected Account: </label>
              <select id="selected-account-${index}" style="padding: 5px; margin-left: 5px;">
              </select>
            </div>
          </div>
        </div>
      `;
    });
    output.innerHTML = walletList;

    // STEP 7: Add event listeners and handle wallet interactions
    availableWallets.forEach((wallet, index) => {
      // Re-check connection status as it may have changed due to events
      const isConnected = wallet.accounts.length > 0;
      
      // Get button elements (only one will exist based on connection state)
      const connectBtn = document.getElementById(`connect-${index}`);
      const disconnectBtn = document.getElementById(`disconnect-${index}`);
      const accountListDiv = document.getElementById(`account-list-${index}`);
      const accountSelect = document.getElementById(`selected-account-${index}`) as HTMLSelectElement;
      
      // STEP 8: If wallet is already connected, populate accounts immediately
      // This handles cases where:
      // - A wallet was connected before the page loaded
      // - Connection state changed due to wallet events
      if (isConnected) {
        displayAccounts(wallet, accountListDiv, accountSelect);
      }
      
      // STEP 9: Handle connect button click
      connectBtn?.addEventListener('click', async () => {
        try {
          // Access the standard:connect feature of the wallet
          // All Sui wallets must implement this standard feature
          const connectFeature = wallet.features['standard:connect'] as any;
          
          // Call the connect method - this will prompt the user to approve the connection
          // After successful connection, wallet.accounts will be populated
          // The wallet may also emit a 'change' event which will trigger UI refresh
          await connectFeature.connect();
          console.log(`Connected to ${wallet.name}`);
          
          // Save the wallet connection with the first account (default)
          if (wallet.accounts && wallet.accounts.length > 0) {
            const defaultAccount = wallet.accounts[0];
            if (defaultAccount) {
              saveWalletConnection(wallet.name, defaultAccount.address, 0);
            }
          }
          
          // STEP 10: Refresh the entire UI to reflect new connection state
          // This updates buttons from "Connect" to "Disconnect" and shows accounts
          displaySuiWallets();
        } catch (error) {
          // Handle connection errors (user rejection, wallet issues, etc.)
          console.error(`Failed to connect to ${wallet.name}:`, error);
        }
      });

      // STEP 11: Handle disconnect button click
      disconnectBtn?.addEventListener('click', async () => {
        try {
          // Access the standard:disconnect feature of the wallet
          const disconnectFeature = wallet.features['standard:disconnect'] as any;
          
          // Call the disconnect method - this will clear the connection
          // After disconnection, wallet.accounts will be empty/undefined
          // The wallet may also emit a 'change' event which will trigger UI refresh
          await disconnectFeature.disconnect();
          console.log(`Disconnected from ${wallet.name}`);
          
          // Clear the stored wallet connection
          clearWalletConnection();
          
          // STEP 12: Refresh the entire UI to reflect disconnection
          // This updates buttons from "Disconnect" to "Connect" and hides accounts
          displaySuiWallets();
        } catch (error) {
          // Handle disconnection errors
          console.error(`Failed to disconnect from ${wallet.name}:`, error);
        }
      });
    });
  }
}

/**
 * Helper function to display wallet accounts and populate the account selector
 * 
 * This function handles the display of account information after a successful wallet connection.
 * Each wallet can have multiple accounts (addresses) associated with it.
 * 
 * @param wallet - The connected wallet object containing account information
 * @param accountListDiv - DOM element where account details will be displayed
 * @param accountSelect - Select dropdown element for account selection
 */
function displayAccounts(wallet: any, accountListDiv: HTMLElement | null, accountSelect: HTMLSelectElement | null): void {
  // Validate required elements exist
  if (!accountListDiv || !accountSelect || !wallet.accounts) return;

  // Clear any previous account information
  accountListDiv.innerHTML = '';
  accountSelect.innerHTML = '';

  // STEP 13: Process each account in the wallet
  let accountsHtml = '';
  wallet.accounts.forEach((account: any, index: number) => {
    // Each account contains:
    // - address: The Sui address (public identifier)
    // - publicKey: The public key associated with this account
    
    // Display account information in a readable format
    accountsHtml += `
      <div style="background: #f8f9fa; padding: 8px; margin: 5px 0; border-radius: 3px; font-family: monospace; font-size: 12px;">
        <strong>Account ${index + 1}:</strong><br>
        <!-- Sui address - this is what identifies the account on the blockchain -->
        <strong>Address:</strong> ${account.address}<br>
        <!-- Public key - used for cryptographic operations -->
        <strong>Public Key:</strong> ${account.publicKey}
      </div>
    `;
    
    // STEP 14: Add account option to the dropdown selector
    const option = document.createElement('option');
    option.value = index.toString(); // Use array index as value
    // Show account number and truncated address for easy identification
    option.textContent = `Account ${index + 1} (${account.address.slice(0, 8)}...)`;
    
    // STEP 15: Set the selected account based on stored connection or default to first
    const storedConnection = loadWalletConnection();
    if (storedConnection && 
        wallet.name === storedConnection.walletName && 
        index === storedConnection.accountIndex) {
      option.selected = true;
    } else if (index === 0 && !storedConnection) {
      // Default to first account only if no stored connection
      option.selected = true;
    }
    
    accountSelect.appendChild(option);
  });

  // Update the display with all account information
  accountListDiv.innerHTML = accountsHtml;
  
  // STEP 16: Add event listener for account selection changes
  accountSelect.addEventListener('change', () => {
    const selectedIndex = parseInt(accountSelect.value);
    const selectedAccount = wallet.accounts[selectedIndex];
    if (selectedAccount) {
      // Save the new account selection to localStorage
      saveWalletConnection(wallet.name, selectedAccount.address, selectedIndex);
      console.log(`Selected account ${selectedIndex + 1} for ${wallet.name}`);
    }
  });
}

// STEP 17: Application initialization and automatic wallet discovery
// The app initializes immediately when the page loads
const app = document.getElementById('app');
if (app) {
  // Set up the basic HTML structure for the wallet demo
  // No buttons needed - everything happens automatically
  app.innerHTML = `
    <h1>Wallet Ops Demo</h1>
    <p>This tutorial demonstrates automatic wallet discovery, connection persistence, and account management.</p>
    <div id="output">Loading wallets...</div>
  `;

  // STEP 18: Automatically discover and display wallets with delay
  // The delay ensures wallet extensions have time to register with the wallet standard
  // This replaces manual button clicking with seamless automatic loading
  setTimeout(() => {
    displaySuiWallets();
  }, 500);
}
