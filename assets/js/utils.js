/**
 * Utility functions for Financial Management App
 */

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

/**
 * Save data to local storage
 * @param {string} key - The storage key
 * @param {any} value - The value to store
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Get data from local storage
 * @param {string} key - The storage key
 * @param {any} defaultValue - The default value if not found
 * @returns {any} The stored value or default value
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error retrieving from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Remove data from local storage
 * @param {string} key - The storage key
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * Generate a unique reference number 
 * @param {string} prefix - Reference prefix
 * @returns {string} Unique reference number
 */
export function generateReference(prefix) {
  const date = new Date();
  const datePart = date.toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${datePart}-${randomPart}`;
}

/**
 * Update accounts after journal entries
 * @param {Array} entries - Journal entries
 * @param {string} entryType - Type of entry (receipt, payment, transfer, general)
 */
export function updateAccountBalances(entries, entryType) {
  // Get current accounts
  const accounts = getFromStorage('accounts', []);
  
  // Create a map of accounts by code for easy lookup
  const accountMap = accounts.reduce((map, account) => {
    map[account.code] = account;
    return map;
  }, {});
  
  // Update account balances based on entry type
  switch (entryType) {
    case 'receipt':
      // For receipt: Credit the first account, debit the others
      if (entries.length > 0) {
        const mainAccount = entries[0].account;
        if (accountMap[mainAccount]) {
          accountMap[mainAccount].balance += entries[0].amount;
        }
        
        for (let i = 1; i < entries.length; i++) {
          const account = entries[i].account;
          if (accountMap[account]) {
            accountMap[account].balance += entries[i].amount;
          }
        }
      }
      break;
      
    case 'payment':
      // For payment: Debit the first account, credit the others
      if (entries.length > 0) {
        const mainAccount = entries[0].account;
        if (accountMap[mainAccount]) {
          accountMap[mainAccount].balance -= entries[0].amount;
        }
        
        for (let i = 1; i < entries.length; i++) {
          const account = entries[i].account;
          if (accountMap[account]) {
            accountMap[account].balance -= entries[i].amount;
          }
        }
      }
      break;
      
    case 'transfer':
      // For transfer: Debit the from account, credit the to account
      if (entries.length > 0) {
        const fromAccount = entries[0].fromAccount;
        const toAccount = entries[0].toAccount;
        const amount = entries[0].amount;
        
        if (accountMap[fromAccount]) {
          accountMap[fromAccount].balance -= amount;
        }
        
        if (accountMap[toAccount]) {
          accountMap[toAccount].balance += amount;
        }
      }
      break;
      
    case 'general':
      // For general: Apply debits and credits directly
      entries.forEach(entry => {
        const account = entry.account;
        if (accountMap[account]) {
          if (entry.debit > 0) {
            // Debits increase for Asset and Expense accounts, decrease for others
            if (accountMap[account].type === 'Asset' || accountMap[account].type === 'Expense') {
              accountMap[account].balance += entry.debit;
            } else {
              accountMap[account].balance -= entry.debit;
            }
          }
          
          if (entry.credit > 0) {
            // Credits decrease for Asset and Expense accounts, increase for others
            if (accountMap[account].type === 'Asset' || accountMap[account].type === 'Expense') {
              accountMap[account].balance -= entry.credit;
            } else {
              accountMap[account].balance += entry.credit;
            }
          }
        }
      });
      break;
  }
  
  // Convert the map back to an array and save
  const updatedAccounts = Object.values(accountMap);
  saveToStorage('accounts', updatedAccounts);
  
  return updatedAccounts;
}

/**
 * Validate a journal entry for double-entry compliance
 * @param {Array} entries - The journal entries to validate
 * @param {string} entryType - The type of entry
 * @returns {boolean} True if the entry is valid
 */
export function validateDoubleEntry(entries, entryType) {
  if (entryType === 'general') {
    // For general journal, total debits must equal total credits
    let totalDebits = 0;
    let totalCredits = 0;
    
    entries.forEach(entry => {
      totalDebits += Number(entry.debit || 0);
      totalCredits += Number(entry.credit || 0);
    });
    
    // Allow for small floating point differences
    return Math.abs(totalDebits - totalCredits) < 0.001;
  }
  
  // For other entry types, the validation is handled by the form structure
  return true;
}
