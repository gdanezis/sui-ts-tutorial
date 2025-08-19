/**
 * Sui Wallet Operations Tutorial
 * 
 * This tutorial demonstrates how to:
 * 1. Discover available Sui wallets
 * 2. Connect to wallets
 * 3. Disconnect from wallets
 * 4. Access wallet accounts
 * 5. Handle wallet connection states
 * 6. Listen to wallet events for state changes
 * 
 * Key Concepts:
 * - Wallet Standard: Uses @mysten/wallet-standard for consistent wallet interactions
 * - Connection State: Determined by presence of accounts in wallet.accounts array
 * - Event System: Wallets emit 'change' events for accounts, features, and chains
 * - Account Structure: Each account has address (Sui address) and publicKey properties
 */

// Import the getWallets function from Mysten's wallet standard library
// This is the main entry point for discovering available Sui wallets
import { getWallets } from '@mysten/wallet-standard';

/**
 * Main function to display all available Sui wallets and their connection states
 * 
 * This function:
 * - Discovers all installed Sui wallet extensions
 * - Registers event listeners for wallet state changes
 * - Shows their connection status (connected/disconnected)
 * - Displays appropriate buttons (connect/disconnect)
 * - Shows accounts for connected wallets
 * - Automatically refreshes UI when wallet events occur
 */
function displaySuiWallets(): void {
  // Get the output container element where we'll display wallet information
  const output = document.getElementById('output');
  if (!output) return;

  // STEP 1: Discover available wallets
  // getWallets() returns a registry of all available wallet standards
  // .get() returns an array of wallet objects that support the Sui standard
  const availableWallets = getWallets().get();

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

      const walletAccounts = wallet.accounts || [];
      const isConnected = walletAccounts.length > 0;
      
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
      const isConnected = wallet.accounts && wallet.accounts.length > 0;
      
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
    
    // STEP 15: Set the first account as default (as per Sui wallet standards)
    // Most wallets present the primary/default account first
    if (index === 0) option.selected = true;
    
    accountSelect.appendChild(option);
  });

  // Update the display with all account information
  accountListDiv.innerHTML = accountsHtml;
}

// STEP 16: Application initialization
// Wait for the DOM to be fully loaded before setting up the wallet interface
const app = document.getElementById('app');
if (app) {
  // Set up the basic HTML structure for the wallet demo
  app.innerHTML = `
    <h1>Wallet Ops Demo</h1>
    <p>This tutorial demonstrates how to connect to Sui wallets and access accounts.</p>
    <button id="walletsBtn">Show Sui Wallets</button>
    <div id="output"></div>
  `;

  // STEP 17: Add event listener to trigger wallet discovery and display
  const btn = document.getElementById('walletsBtn');
  btn?.addEventListener('click', displaySuiWallets);
}
