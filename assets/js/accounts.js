/**
 * Chart of Accounts functionality for Financial Management App
 */

// Import utility functions
import * as Utils from './utils.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize accounts page if it's the current page
  document.addEventListener('pageLoaded', function(e) {
    if (e.detail.pageId === 'chart-of-accounts') {
      initAccountsPage();
    }
  });
});

/**
 * Initialize accounts page
 */
function initAccountsPage() {
  // Load accounts data
  loadAccounts();
  
  // Set up event listeners
  setupAccountsEventListeners();
  
  console.log('Accounts page initialized');
}

/**
 * Load accounts data
 */
function loadAccounts() {
  // Get accounts from storage
  const accounts = Utils.getFromStorage('accounts', []);
  
  // Render accounts table
  renderAccountsTable(accounts);
  
  // Render account statistics
  renderAccountStats(accounts);
}

/**
 * Render accounts table
 * @param {Array} accounts - The accounts data array
 */
function renderAccountsTable(accounts) {
  const tableBody = document.querySelector('.accounts-table tbody');
  
  if (!tableBody) return;
  
  // Clear table body
  tableBody.innerHTML = '';
  
  // Sort accounts by code
  accounts.sort((a, b) => parseInt(a.code) - parseInt(b.code));
  
  // Render each account
  accounts.forEach(account => {
    const row = document.createElement('tr');
    row.setAttribute('data-account-code', account.code);
    
    // Format balance with positive/negative indicator
    const formattedBalance = Utils.formatCurrency(account.balance);
    const balanceClass = getBalanceClass(account.type, account.balance);
    
    row.innerHTML = `
      <td>${account.code}</td>
      <td>${account.name}</td>
      <td>${account.type}</td>
      <td class="text-right ${balanceClass}">${formattedBalance}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm btn-primary edit-account" data-code="${account.code}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-account" data-code="${account.code}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

/**
 * Get the appropriate CSS class for an account balance based on account type and balance value
 * @param {string} accountType - The account type
 * @param {number} balance - The account balance
 * @returns {string} The CSS class
 */
function getBalanceClass(accountType, balance) {
  // For asset and expense accounts, positive is normal
  if (accountType === 'Asset' || accountType === 'Expense') {
    return balance >= 0 ? 'positive' : 'negative';
  }
  // For liability, equity, and revenue accounts, negative is normal
  else {
    return balance >= 0 ? 'positive' : 'negative';
  }
}

/**
 * Render account statistics
 * @param {Array} accounts - The accounts data array
 */
function renderAccountStats(accounts) {
  // Calculate totals by account type
  const totals = accounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = 0;
    }
    
    acc[account.type] += account.balance;
    return acc;
  }, {});
  
  // Update stats elements
  updateAccountStat('asset-total', totals['Asset'] || 0);
  updateAccountStat('liability-total', totals['Liability'] || 0);
  updateAccountStat('equity-total', totals['Equity'] || 0);
  updateAccountStat('revenue-total', totals['Revenue'] || 0);
  updateAccountStat('expense-total', totals['Expense'] || 0);
  
  // Calculate net income
  const netIncome = (totals['Revenue'] || 0) - (totals['Expense'] || 0);
  updateAccountStat('net-income', netIncome);
  
  // Calculate equity + net income
  const totalEquity = (totals['Equity'] || 0) + netIncome;
  updateAccountStat('total-equity', totalEquity);
  
  // Calculate accounting equation: Assets = Liabilities + Equity
  const assets = totals['Asset'] || 0;
  const liabilities = totals['Liability'] || 0;
  const accounting_equation = assets - liabilities - totalEquity;
  
  // Update accounting equation (should be zero)
  const equationDisplay = document.getElementById('accounting-equation');
  if (equationDisplay) {
    if (Math.abs(accounting_equation) < 0.01) {
      equationDisplay.textContent = 'Balanced';
      equationDisplay.className = 'balanced';
    } else {
      equationDisplay.textContent = 'Unbalanced: ' + Utils.formatCurrency(accounting_equation);
      equationDisplay.className = 'unbalanced';
    }
  }
}

/**
 * Update account stat element
 * @param {string} id - The element ID
 * @param {number} value - The stat value
 */
function updateAccountStat(id, value) {
  const element = document.getElementById(id);
  
  if (element) {
    element.textContent = Utils.formatCurrency(value);
    
    // Add positive/negative class
    element.classList.remove('positive', 'negative');
    element.classList.add(value >= 0 ? 'positive' : 'negative');
  }
}

/**
 * Set up event listeners for accounts page
 */
function setupAccountsEventListeners() {
  // Add account button
  const addAccountBtn = document.getElementById('add-account-btn');
  
  if (addAccountBtn) {
    addAccountBtn.addEventListener('click', function() {
      showAccountForm();
    });
  }
  
  // Account search
  const accountSearch = document.getElementById('account-search');
  
  if (accountSearch) {
    accountSearch.addEventListener('input', function() {
      filterAccounts(this.value);
    });
  }
  
  // Account type filter
  const accountTypeFilter = document.getElementById('account-type-filter');
  
  if (accountTypeFilter) {
    accountTypeFilter.addEventListener('change', function() {
      filterAccountsByType(this.value);
    });
  }
  
  // Table action buttons (using event delegation)
  const accountsTable = document.querySelector('.accounts-table');
  
  if (accountsTable) {
    accountsTable.addEventListener('click', function(e) {
      const editBtn = e.target.closest('.edit-account');
      const deleteBtn = e.target.closest('.delete-account');
      
      if (editBtn) {
        const accountCode = editBtn.getAttribute('data-code');
        editAccount(accountCode);
      } else if (deleteBtn) {
        const accountCode = deleteBtn.getAttribute('data-code');
        deleteAccount(accountCode);
      }
    });
  }
  
  // Account form submit
  const accountForm = document.getElementById('account-form');
  
  if (accountForm) {
    accountForm.addEventListener('submit', function(e) {
      e.preventDefault();
      saveAccount();
    });
  }
  
  // Account form cancel button
  const cancelAccountBtn = document.getElementById('cancel-account-btn');
  
  if (cancelAccountBtn) {
    cancelAccountBtn.addEventListener('click', function(e) {
      e.preventDefault();
      hideAccountForm();
    });
  }
  
  // Account type change in form
  const accountTypeSelect = document.getElementById('account-type');
  
  if (accountTypeSelect) {
    accountTypeSelect.addEventListener('change', function() {
      updateCodePrefix(this.value);
    });
  }
  
  // Generate code button
  const generateCodeBtn = document.getElementById('generate-code-btn');
  
  if (generateCodeBtn) {
    generateCodeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      generateAccountCode();
    });
  }
}

/**
 * Filter accounts by search term
 * @param {string} searchTerm - The search term
 */
function filterAccounts(searchTerm) {
  const rows = document.querySelectorAll('.accounts-table tbody tr');
  
  if (!rows.length) return;
  
  const term = searchTerm.toLowerCase();
  
  rows.forEach(row => {
    const code = row.cells[0].textContent.toLowerCase();
    const name = row.cells[1].textContent.toLowerCase();
    
    if (code.includes(term) || name.includes(term)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

/**
 * Filter accounts by type
 * @param {string} accountType - The account type to filter by
 */
function filterAccountsByType(accountType) {
  const rows = document.querySelectorAll('.accounts-table tbody tr');
  
  if (!rows.length) return;
  
  rows.forEach(row => {
    const type = row.cells[2].textContent;
    
    if (accountType === 'all' || type === accountType) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

/**
 * Show account form
 * @param {Object} account - The account to edit (optional)
 */
function showAccountForm(account = null) {
  const accountModal = document.getElementById('account-modal');
  
  if (!accountModal) {
    // Create modal if it doesn't exist
    const modalHTML = `
      <div id="account-modal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${account ? 'Edit Account' : 'Add Account'}</h2>
            <button type="button" class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="account-form">
              <input type="hidden" id="edit-mode" value="${account ? 'edit' : 'add'}">
              <input type="hidden" id="original-code" value="${account ? account.code : ''}">
              
              <div class="form-row">
                <div class="form-group">
                  <label for="account-type">Account Type</label>
                  <select id="account-type" class="form-control" required>
                    <option value="">Select Type</option>
                    <option value="Asset" ${account && account.type === 'Asset' ? 'selected' : ''}>Asset</option>
                    <option value="Liability" ${account && account.type === 'Liability' ? 'selected' : ''}>Liability</option>
                    <option value="Equity" ${account && account.type === 'Equity' ? 'selected' : ''}>Equity</option>
                    <option value="Revenue" ${account && account.type === 'Revenue' ? 'selected' : ''}>Revenue</option>
                    <option value="Expense" ${account && account.type === 'Expense' ? 'selected' : ''}>Expense</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="account-code">Account Code</label>
                  <div class="input-group">
                    <input type="text" id="account-code" class="form-control" required pattern="[0-9]+" 
                           value="${account ? account.code : ''}" placeholder="1110">
                    <button id="generate-code-btn" class="btn btn-outline">Generate</button>
                  </div>
                </div>
              </div>
              
              <div class="form-group">
                <label for="account-name">Account Name</label>
                <input type="text" id="account-name" class="form-control" required 
                       value="${account ? account.name : ''}" placeholder="Cash">
              </div>
              
              <div class="form-group">
                <label for="account-description">Description (Optional)</label>
                <textarea id="account-description" class="form-control" 
                          placeholder="Account description">${account ? account.description || '' : ''}</textarea>
              </div>
              
              <div class="form-group">
                <label for="account-balance">Opening Balance</label>
                <input type="number" id="account-balance" class="form-control" step="0.01"
                       value="${account ? account.balance : '0'}" ${account ? 'readonly' : ''}>
                <small class="text-muted">
                  ${account ? 'Balance cannot be directly edited once account is created.' : 'Initial account balance.'}
                </small>
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">${account ? 'Update' : 'Save'}</button>
                <button type="button" id="cancel-account-btn" class="btn btn-outline">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    
    // Append modal to body
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHTML;
    document.body.appendChild(modalElement.firstElementChild);
    
    // Set up event listeners for the new modal
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', hideAccountForm);
    }
    
    // Set up other form event listeners
    setupAccountsEventListeners();
  } else {
    // Update existing modal
    const modalTitle = accountModal.querySelector('.modal-header h2');
    const editModeInput = document.getElementById('edit-mode');
    const originalCodeInput = document.getElementById('original-code');
    const accountTypeSelect = document.getElementById('account-type');
    const accountCodeInput = document.getElementById('account-code');
    const accountNameInput = document.getElementById('account-name');
    const accountDescriptionInput = document.getElementById('account-description');
    const accountBalanceInput = document.getElementById('account-balance');
    const submitButton = accountModal.querySelector('button[type="submit"]');
    
    if (modalTitle) modalTitle.textContent = account ? 'Edit Account' : 'Add Account';
    if (editModeInput) editModeInput.value = account ? 'edit' : 'add';
    if (originalCodeInput) originalCodeInput.value = account ? account.code : '';
    if (accountTypeSelect) accountTypeSelect.value = account ? account.type : '';
    if (accountCodeInput) accountCodeInput.value = account ? account.code : '';
    if (accountNameInput) accountNameInput.value = account ? account.name : '';
    if (accountDescriptionInput) accountDescriptionInput.value = account ? account.description || '' : '';
    if (accountBalanceInput) {
      accountBalanceInput.value = account ? account.balance : '0';
      accountBalanceInput.readOnly = !!account;
    }
    if (submitButton) submitButton.textContent = account ? 'Update' : 'Save';
    
    // Show the modal
    accountModal.style.display = 'block';
  }
}

/**
 * Hide account form
 */
function hideAccountForm() {
  const accountModal = document.getElementById('account-modal');
  
  if (accountModal) {
    accountModal.style.display = 'none';
    
    // Reset form
    const accountForm = document.getElementById('account-form');
    if (accountForm) {
      accountForm.reset();
    }
  }
}

/**
 * Update account code prefix based on account type
 * @param {string} accountType - The account type
 */
function updateCodePrefix(accountType) {
  const accountCodeInput = document.getElementById('account-code');
  
  if (accountCodeInput && !accountCodeInput.value) {
    let prefix = '';
    
    switch (accountType) {
      case 'Asset':
        prefix = '1';
        break;
      case 'Liability':
        prefix = '2';
        break;
      case 'Equity':
        prefix = '3';
        break;
      case 'Revenue':
        prefix = '4';
        break;
      case 'Expense':
        prefix = '5';
        break;
    }
    
    accountCodeInput.value = prefix;
  }
}

/**
 * Generate a new account code
 */
function generateAccountCode() {
  const accountType = document.getElementById('account-type').value;
  
  if (!accountType) {
    alert('Please select an account type first.');
    return;
  }
  
  const accounts = Utils.getFromStorage('accounts', []);
  
  // Filter accounts by type
  const typeAccounts = accounts.filter(a => a.type === accountType);
  
  // Get prefix for account type
  let prefix = '';
  
  switch (accountType) {
    case 'Asset':
      prefix = '1';
      break;
    case 'Liability':
      prefix = '2';
      break;
    case 'Equity':
      prefix = '3';
      break;
    case 'Revenue':
      prefix = '4';
      break;
    case 'Expense':
      prefix = '5';
      break;
  }
  
  // Find the highest code for this type
  let highestCode = 0;
  
  typeAccounts.forEach(account => {
    const code = parseInt(account.code);
    if (code > highestCode && code.toString().startsWith(prefix)) {
      highestCode = code;
    }
  });
  
  // Generate new code (increment highest code)
  let newCode = highestCode ? highestCode + 10 : parseInt(prefix + '100');
  
  // Update input
  const accountCodeInput = document.getElementById('account-code');
  if (accountCodeInput) {
    accountCodeInput.value = newCode;
  }
}

/**
 * Save account
 */
function saveAccount() {
  // Get form values
  const editMode = document.getElementById('edit-mode').value;
  const originalCode = document.getElementById('original-code').value;
  const accountType = document.getElementById('account-type').value;
  const accountCode = document.getElementById('account-code').value;
  const accountName = document.getElementById('account-name').value;
  const accountDescription = document.getElementById('account-description').value;
  const accountBalance = parseFloat(document.getElementById('account-balance').value || '0');
  
  // Validate form
  if (!accountType || !accountCode || !accountName) {
    alert('Please fill in all required fields.');
    return;
  }
  
  // Validate account code
  if (!/^\d+$/.test(accountCode)) {
    alert('Account code must contain only numbers.');
    return;
  }
  
  // Get accounts from storage
  const accounts = Utils.getFromStorage('accounts', []);
  
  // Check if account code already exists (for add mode)
  if (editMode === 'add' && accounts.some(a => a.code === accountCode)) {
    alert('Account code already exists. Please choose a different code.');
    return;
  }
  
  // Create account object
  const account = {
    code: accountCode,
    name: accountName,
    type: accountType,
    description: accountDescription,
    balance: accountBalance
  };
  
  // Update or add account
  if (editMode === 'edit') {
    // Find account index
    const accountIndex = accounts.findIndex(a => a.code === originalCode);
    
    if (accountIndex >= 0) {
      // Preserve the balance from the original account
      account.balance = accounts[accountIndex].balance;
      
      // Update account
      accounts[accountIndex] = account;
    }
  } else {
    // Add new account
    accounts.push(account);
  }
  
  // Sort accounts by code
  accounts.sort((a, b) => parseInt(a.code) - parseInt(b.code));
  
  // Save accounts
  Utils.saveToStorage('accounts', accounts);
  
  // Hide form
  hideAccountForm();
  
  // Reload accounts
  loadAccounts();
  
  // Show success message
  alert(`Account ${editMode === 'edit' ? 'updated' : 'added'} successfully.`);
}

/**
 * Edit account
 * @param {string} accountCode - The account code to edit
 */
function editAccount(accountCode) {
  // Get accounts from storage
  const accounts = Utils.getFromStorage('accounts', []);
  
  // Find account
  const account = accounts.find(a => a.code === accountCode);
  
  if (account) {
    // Show account form with account data
    showAccountForm(account);
  } else {
    alert('Account not found.');
  }
}

/**
 * Delete account
 * @param {string} accountCode - The account code to delete
 */
function deleteAccount(accountCode) {
  // Confirm deletion
  if (!confirm('Are you sure you want to delete this account?')) {
    return;
  }
  
  // Get accounts from storage
  const accounts = Utils.getFromStorage('accounts', []);
  
  // Find account
  const accountIndex = accounts.findIndex(a => a.code === accountCode);
  
  if (accountIndex >= 0) {
    const account = accounts[accountIndex];
    
    // Check if account has transactions
    // In a real app, you would check if the account is used in journal entries
    // For this demo, we'll just check if the balance is not zero
    if (account.balance !== 0) {
      alert('Cannot delete an account with a non-zero balance. Please transfer the balance to another account first.');
      return;
    }
    
    // Remove account
    accounts.splice(accountIndex, 1);
    
    // Save accounts
    Utils.saveToStorage('accounts', accounts);
    
    // Reload accounts
    loadAccounts();
    
    // Show success message
    alert('Account deleted successfully.');
  } else {
    alert('Account not found.');
  }
}

// Export functions
export {
  initAccountsPage,
  loadAccounts,
  saveAccount,
  deleteAccount
};