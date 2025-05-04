// Journal entries functionality
import * as Utils from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Listen for page load events
    document.addEventListener('pageLoaded', function(e) {
      // Initialize journal form if it's a journal page
      if (e.detail.pageId.includes('journal') || 
          e.detail.pageId.includes('receipt') || 
          e.detail.pageId.includes('payment') ||
          e.detail.pageId.includes('transfer')) {
        initJournalForm(e.detail.pageId);
      }
    });
  });
  
  function initJournalForm(pageId) {
    // Determine journal type from page ID
    const journalType = getJournalTypeFromPageId(pageId);
    
    // Load accounts into dropdowns
    loadAccountsIntoForm(journalType);
    
    // Attach add line button handler
    attachAddLineButtonHandler(journalType);
    
    // Add submit form handler
    attachSubmitFormHandler(journalType);
    
    // Load journal data if it's a list page
    if (pageId.includes('list')) {
      loadJournalEntries(journalType);
    }

    // Initialize date field with current date
    const dateField = document.querySelector(`.page-${journalType}-journal input[type="date"]`);
    if (dateField) {
      const today = new Date().toISOString().split('T')[0];
      dateField.value = today;
    }

    // Initialize reference number
    const referenceField = document.querySelector(`.page-${journalType}-journal input[name="reference"]`);
    if (referenceField && !referenceField.value) {
      const prefix = getJournalPrefix(journalType);
      referenceField.value = Utils.generateReference(prefix);
    }
  }
  
  function getJournalTypeFromPageId(pageId) {
    if (pageId.includes('receipt')) {
      return 'receipt';
    } else if (pageId.includes('payment')) {
      return 'payment';
    } else if (pageId.includes('transfer')) {
      return 'transfer';
    } else {
      return 'general';
    }
  }

  function getJournalPrefix(journalType) {
    switch (journalType) {
      case 'receipt': return 'REC';
      case 'payment': return 'PAY';
      case 'transfer': return 'TRF';
      case 'general': return 'JNL';
      default: return 'JNL';
    }
  }

  function loadAccountsIntoForm(journalType) {
    // Get accounts from storage
    const accounts = Utils.getFromStorage('accounts', []);
    
    // Get all select elements in the journal form
    const selects = document.querySelectorAll(`.page-${journalType}-journal select`);
    
    selects.forEach(select => {
      // Keep the first option (placeholder)
      const firstOption = select.options[0];
      
      // Clear other options
      select.innerHTML = '';
      select.appendChild(firstOption);
      
      // Sort accounts by code
      accounts.sort((a, b) => parseInt(a.code) - parseInt(b.code));
      
      // Filter accounts based on select purpose and journal type
      let filteredAccounts = accounts;
      
      if (journalType === 'receipt' && select.closest('.form-group').querySelector('label').textContent.includes('Account')) {
        // For receipt, first account is usually a cash/bank account
        if (select === selects[0]) {
          filteredAccounts = accounts.filter(a => a.type === 'Asset' && (a.code.startsWith('11') || a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank')));
        } else {
          // Other accounts are usually revenue accounts
          filteredAccounts = accounts.filter(a => a.type === 'Revenue' || a.type === 'Asset');
        }
      } else if (journalType === 'payment' && select.closest('.form-group').querySelector('label').textContent.includes('Account')) {
        // For payment, first account is usually a cash/bank account
        if (select === selects[0]) {
          filteredAccounts = accounts.filter(a => a.type === 'Asset' && (a.code.startsWith('11') || a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank')));
        } else {
          // Other accounts are usually expense accounts
          filteredAccounts = accounts.filter(a => a.type === 'Expense' || a.type === 'Asset' || a.type === 'Liability');
        }
      } else if (journalType === 'transfer') {
        // For transfer, only show asset accounts
        filteredAccounts = accounts.filter(a => a.type === 'Asset' && (a.code.startsWith('11') || a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank')));
      }
      
      // Add account options
      filteredAccounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.code;
        option.textContent = `${account.code} - ${account.name}`;
        select.appendChild(option);
      });
    });
  }
  
  function attachAddLineButtonHandler(journalType) {
    const addLineBtn = document.querySelector(`.page-${journalType}-journal .add-line-btn`);
    if (!addLineBtn) return;
    
    addLineBtn.addEventListener('click', function() {
      const journalEntries = document.querySelector(`.page-${journalType}-journal .journal-entries`);
      if (!journalEntries) return;
      
      // Create new journal entry element
      const entryElement = document.createElement('div');
      entryElement.className = 'journal-entry';
      
      // Different structure based on journal type
      if (journalType === 'receipt' || journalType === 'payment') {
        entryElement.innerHTML = `
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Account</label>
              <div class="custom-select">
                <select class="form-control account-select">
                  <option value="">Select Account</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <input type="text" class="form-control" placeholder="Description">
            </div>
            <div class="form-group">
              <label class="form-label">Amount</label>
              <input type="number" class="form-control" placeholder="0.00" step="0.01" min="0">
            </div>
          </div>
          <button class="btn btn-danger btn-sm remove-line-btn">
            <i class="fas fa-trash-alt"></i> Remove
          </button>
        `;
      } else if (journalType === 'transfer') {
        entryElement.innerHTML = `
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">From Account</label>
              <div class="custom-select">
                <select class="form-control from-account-select">
                  <option value="">Select Account</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">To Account</label>
              <div class="custom-select">
                <select class="form-control to-account-select">
                  <option value="">Select Account</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Amount</label>
              <input type="number" class="form-control" placeholder="0.00" step="0.01" min="0">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input type="text" class="form-control" placeholder="Description">
          </div>
          <button class="btn btn-danger btn-sm remove-line-btn">
            <i class="fas fa-trash-alt"></i> Remove
          </button>
        `;
      } else {
        // General journal
        entryElement.innerHTML = `
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Account</label>
              <div class="custom-select">
                <select class="form-control account-select">
                  <option value="">Select Account</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <input type="text" class="form-control" placeholder="Description">
            </div>
            <div class="form-group">
              <label class="form-label">Debit</label>
              <input type="number" class="form-control debit-amount" placeholder="0.00" step="0.01" min="0" oninput="this.closest('.journal-entry').querySelector('.credit-amount').value = this.value ? '' : ''">
            </div>
            <div class="form-group">
              <label class="form-label">Credit</label>
              <input type="number" class="form-control credit-amount" placeholder="0.00" step="0.01" min="0" oninput="this.closest('.journal-entry').querySelector('.debit-amount').value = this.value ? '' : ''">
            </div>
          </div>
          <button class="btn btn-danger btn-sm remove-line-btn">
            <i class="fas fa-trash-alt"></i> Remove
          </button>
        `;
      }
      
      journalEntries.appendChild(entryElement);
      
      // Load accounts into new selects
      const selects = entryElement.querySelectorAll('select');
      
      if (selects.length > 0) {
        loadAccountsIntoForm(journalType);
      }
      
      // Add remove line button handler
      const removeLineBtn = entryElement.querySelector('.remove-line-btn');
      removeLineBtn.addEventListener('click', function() {
        entryElement.remove();
      });
    });
  }
  
  function attachSubmitFormHandler(journalType) {
    const formElement = document.querySelector(`.page-${journalType}-journal form`);
    if (!formElement) return;
    
    formElement.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Validate form
      if (!validateJournalForm(journalType)) {
        return;
      }
      
      // Get form data
      const formData = getJournalFormData(journalType);
      
      // Validate double-entry principles
      if (!Utils.validateDoubleEntry(formData.entries, journalType)) {
        alert('Journal entry is not balanced. Total debits must equal total credits.');
        return;
      }
      
      // Save journal entry
      saveJournalEntry(formData, journalType);
      
      // Update account balances
      Utils.updateAccountBalances(formData.entries, journalType);
      
      // Show success message
      alert('Journal entry saved successfully!');
      
      // Reset form
      formElement.reset();
      
      // Remove all journal entries except the first one
      const journalEntries = document.querySelector(`.page-${journalType}-journal .journal-entries`);
      const entries = journalEntries.querySelectorAll('.journal-entry');
      for (let i = 1; i < entries.length; i++) {
        entries[i].remove();
      }
      
      // Reset the first entry's fields
      const firstEntry = entries[0];
      if (firstEntry) {
        const selects = firstEntry.querySelectorAll('select');
        const inputs = firstEntry.querySelectorAll('input');
        
        selects.forEach(select => {
          select.selectedIndex = 0;
        });
        
        inputs.forEach(input => {
          input.value = '';
        });
      }
      
      // Generate new reference number
      const referenceField = document.querySelector(`.page-${journalType}-journal input[name="reference"]`);
      if (referenceField) {
        const prefix = getJournalPrefix(journalType);
        referenceField.value = Utils.generateReference(prefix);
      }
    });
  }
  
  function validateJournalForm(journalType) {
    // This is a simple validation - in a real app, you would have more robust validation
    const journalEntries = document.querySelectorAll(`.page-${journalType}-journal .journal-entry`);
    
    if (journalEntries.length === 0) {
      alert('Please add at least one journal entry.');
      return false;
    }
    
    // Check if all required fields are filled
    let isValid = true;
    
    journalEntries.forEach(entry => {
      const selects = entry.querySelectorAll('select');
      const inputs = entry.querySelectorAll('input[type="text"], input[type="number"]');
      
      selects.forEach(select => {
        if (!select.value) {
          select.classList.add('is-invalid');
          isValid = false;
        } else {
          select.classList.remove('is-invalid');
        }
      });
      
      inputs.forEach(input => {
        if (!input.value && !input.classList.contains('optional')) {
          input.classList.add('is-invalid');
          isValid = false;
        } else {
          input.classList.remove('is-invalid');
        }
      });
    });
    
    if (!isValid) {
      alert('Please fill in all required fields.');
      return false;
    }
    
    // Additional validation for general journal
    if (journalType === 'general') {
      let totalDebits = 0;
      let totalCredits = 0;
      
      journalEntries.forEach(entry => {
        const debitInput = entry.querySelector('.debit-amount');
        const creditInput = entry.querySelector('.credit-amount');
        
        if (debitInput && creditInput) {
          const debit = Number(debitInput.value || 0);
          const credit = Number(creditInput.value || 0);
          
          totalDebits += debit;
          totalCredits += credit;
          
          // Each line should have either a debit or a credit, not both
          if (debit > 0 && credit > 0) {
            debitInput.classList.add('is-invalid');
            creditInput.classList.add('is-invalid');
            isValid = false;
          }
          
          // Each line should have at least one value
          if (debit === 0 && credit === 0) {
            debitInput.classList.add('is-invalid');
            creditInput.classList.add('is-invalid');
            isValid = false;
          }
        }
      });
      
      // Check if debits equal credits
      if (Math.abs(totalDebits - totalCredits) > 0.001) {
        alert(`Journal entry is not balanced. Total debits (${totalDebits.toFixed(2)}) must equal total credits (${totalCredits.toFixed(2)}).`);
        return false;
      }
    }
    
    // Form is valid
    return isValid;
  }
  
  function getJournalFormData(journalType) {
    // Common fields
    const formData = {
      date: document.querySelector(`.page-${journalType}-journal input[type="date"]`).value,
      reference: document.querySelector(`.page-${journalType}-journal input[name="reference"]`).value,
      description: document.querySelector(`.page-${journalType}-journal textarea`).value || '',
      type: journalType,
      entries: []
    };
    
    // Get entries based on journal type
    const journalEntries = document.querySelectorAll(`.page-${journalType}-journal .journal-entry`);
    
    if (journalType === 'receipt' || journalType === 'payment') {
      journalEntries.forEach(entry => {
        const accountSelect = entry.querySelector('select');
        const descriptionInput = entry.querySelector('input[type="text"]');
        const amountInput = entry.querySelector('input[type="number"]');
        
        formData.entries.push({
          account: accountSelect.value,
          description: descriptionInput.value,
          amount: Number(amountInput.value)
        });
      });
    } else if (journalType === 'transfer') {
      journalEntries.forEach(entry => {
        const fromAccountSelect = entry.querySelector('.from-account-select');
        const toAccountSelect = entry.querySelector('.to-account-select');
        const descriptionInput = entry.querySelector('input[type="text"]');
        const amountInput = entry.querySelector('input[type="number"]');
        
        formData.entries.push({
          fromAccount: fromAccountSelect.value,
          toAccount: toAccountSelect.value,
          description: descriptionInput.value,
          amount: Number(amountInput.value)
        });
      });
    } else { // General journal
      journalEntries.forEach(entry => {
        const accountSelect = entry.querySelector('select');
        const descriptionInput = entry.querySelector('input[type="text"]');
        const debitInput = entry.querySelector('.debit-amount');
        const creditInput = entry.querySelector('.credit-amount');
        
        formData.entries.push({
          account: accountSelect.value,
          description: descriptionInput.value,
          debit: Number(debitInput.value || 0),
          credit: Number(creditInput.value || 0)
        });
      });
    }
    
    return formData;
  }
  
  function saveJournalEntry(formData, journalType) {
    // Get existing journal entries
    const journalEntries = Utils.getFromStorage('journalEntries', []);
    
    // Add timestamp and ID
    formData.timestamp = new Date().toISOString();
    formData.id = Utils.generateReference('JE');
    
    // Add to journal entries
    journalEntries.push(formData);
    
    // Save to storage
    Utils.saveToStorage('journalEntries', journalEntries);
    
    // Return the saved entry
    return formData;
  }
  
  function loadJournalEntries(journalType) {
    // Get journal entries from storage
    const allEntries = Utils.getFromStorage('journalEntries', []);
    
    // Filter entries by type
    const entries = allEntries.filter(entry => entry.type === journalType);
    
    // Get the entries container
    const entriesContainer = document.querySelector(`.page-${journalType}-journal .journal-entries-list`);
    if (!entriesContainer) return;
    
    // Clear container
    entriesContainer.innerHTML = '';
    
    // Sort entries by date (newest first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display entries
    entries.forEach(entry => {
      const entryElement = document.createElement('div');
      entryElement.className = 'journal-entry-item';
      
      // Common header
      let headerHTML = `
        <div class="entry-header">
          <div class="entry-info">
            <h4>${entry.reference}</h4>
            <span class="entry-date">${formatDate(entry.date)}</span>
          </div>
          <div class="entry-actions">
            <button class="btn btn-sm btn-outline view-entry" data-id="${entry.id}">
              <i class="fas fa-eye"></i> View
            </button>
          </div>
        </div>
      `;
      
      // Entry details based on type
      let detailsHTML = '';
      
      if (journalType === 'receipt' || journalType === 'payment') {
        // Get the first entry which is usually the main account
        const mainEntry = entry.entries[0];
        const otherEntries = entry.entries.slice(1);
        
        detailsHTML = `
          <div class="entry-details">
            <p class="entry-description">${entry.description}</p>
            <div class="entry-accounts">
              <div class="main-account">
                <strong>${getAccountName(mainEntry.account)}</strong>
                <span class="amount ${journalType === 'receipt' ? 'positive' : 'negative'}">
                  ${Utils.formatCurrency(mainEntry.amount)}
                </span>
              </div>
              <div class="other-accounts">
                ${otherEntries.map(e => `
                  <div class="account-item">
                    <span>${getAccountName(e.account)}</span>
                    <span class="amount">${Utils.formatCurrency(e.amount)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      } else if (journalType === 'transfer') {
        const transferEntry = entry.entries[0];
        
        detailsHTML = `
          <div class="entry-details">
            <p class="entry-description">${entry.description || transferEntry.description}</p>
            <div class="entry-accounts transfer">
              <div class="account-item">
                <span>From: ${getAccountName(transferEntry.fromAccount)}</span>
              </div>
              <div class="account-item">
                <span>To: ${getAccountName(transferEntry.toAccount)}</span>
              </div>
              <div class="account-item">
                <span class="amount">${Utils.formatCurrency(transferEntry.amount)}</span>
              </div>
            </div>
          </div>
        `;
      } else { // General journal
        detailsHTML = `
          <div class="entry-details">
            <p class="entry-description">${entry.description}</p>
            <div class="entry-accounts general">
              <table class="entry-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  ${entry.entries.map(e => `
                    <tr>
                      <td>${getAccountName(e.account)}</td>
                      <td>${e.description}</td>
                      <td class="text-right">${e.debit ? Utils.formatCurrency(e.debit) : ''}</td>
                      <td class="text-right">${e.credit ? Utils.formatCurrency(e.credit) : ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }
      
      entryElement.innerHTML = headerHTML + detailsHTML;
      entriesContainer.appendChild(entryElement);
    });
    
    // Add view entry button handlers
    const viewButtons = entriesContainer.querySelectorAll('.view-entry');
    viewButtons.forEach(button => {
      button.addEventListener('click', function() {
        const entryId = this.getAttribute('data-id');
        viewJournalEntry(entryId);
      });
    });
  }
  
  function getAccountName(accountCode) {
    const accounts = Utils.getFromStorage('accounts', []);
    const account = accounts.find(a => a.code === accountCode);
    return account ? `${account.code} - ${account.name}` : accountCode;
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  function viewJournalEntry(entryId) {
    // Get all journal entries
    const allEntries = Utils.getFromStorage('journalEntries', []);
    
    // Find the entry with the given ID
    const entry = allEntries.find(e => e.id === entryId);
    
    if (!entry) {
      alert('Journal entry not found.');
      return;
    }
    
    // In a real app, this would show a modal with the entry details
    // For demo purposes, just log the entry to console
    console.log('Journal entry details:', entry);
    
    // Show a simple alert with basic info
    alert(`Journal Entry: ${entry.reference}\nDate: ${formatDate(entry.date)}\nDescription: ${entry.description}`);
  }