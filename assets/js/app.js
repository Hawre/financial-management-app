/**
 * Main Application Logic for Financial Management App
 */

import * as Utils from './utils.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize app
  initApp();
  console.log('App initialized');
});

/**
 * Initialize the application
 */
function initApp() {
  // Setup global event listeners
  setupEventListeners();
  
  // Initialize notification system
  initNotifications();
  
  // Initialize UI components
  initUIComponents();
  
  // Initialize user settings
  initUserSettings();
  
  // Initialize data (load cached data from localStorage)
  initAppData();
  
  // Show app ready notification
  showNotification('Application loaded successfully', 'success', 3000);
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
  // Listen for page navigation events
  document.addEventListener('pageLoaded', function(e) {
    console.log('Page loaded:', e.detail.pageId);
    
    // Update UI based on page
    updateUIForPage(e.detail.pageId);
  });
  
  // Listen for global error events
  window.addEventListener('error', function(e) {
    console.error('Global error:', e.error || e.message);
    showNotification('An error occurred: ' + (e.error?.message || e.message), 'error', 5000);
  });
  
  // Listen for network status changes
  window.addEventListener('online', function() {
    showNotification('You are back online', 'success', 3000);
  });
  
  window.addEventListener('offline', function() {
    showNotification('You are offline. Some features may be unavailable', 'warning', 5000);
  });
}

/**
 * Initialize notification system
 */
function initNotifications() {
  // In a real app, this might set up web socket connections
  // for real-time notifications, or poll a notifications API
  
  // For demo purposes, we'll simulate some notifications after a delay
  setTimeout(function() {
    const notificationCount = document.querySelector('.notification-icon .badge');
    
    if (notificationCount) {
      notificationCount.textContent = '3';
    }
  }, 3000);
}

/**
 * Initialize UI components
 */
function initUIComponents() {
  // Custom select boxes
  document.querySelectorAll('.custom-select select').forEach(select => {
    select.addEventListener('change', function() {
      // Add any custom logic for select changes
      console.log('Select changed:', this.value);
    });
  });
  
  // Date range selector in dashboard
  const dateRangeSelect = document.getElementById('dateRangeSelect');
  if (dateRangeSelect) {
    dateRangeSelect.addEventListener('change', function() {
      // In a real app, this would update the dashboard data
      console.log('Date range changed:', this.value);
      
      // If custom range selected, show date picker
      if (this.value === 'custom') {
        // Show date picker
        showCustomDatePicker();
      } else {
        // Update dashboard with selected range
        updateDashboardData(this.value);
      }
    });
  }
}

/**
 * Show custom date range picker
 */
function showCustomDatePicker() {
  // In a real app, this would show a date range picker
  // For demo, we'll just show a notification
  showNotification('Custom date range picker would appear here', 'info', 3000);
}

/**
 * Update dashboard data based on date range
 * @param {string} range - The selected date range
 */
function updateDashboardData(range) {
  // In a real app, this would fetch new data from an API
  // For demo, we'll just show a notification
  showNotification(`Dashboard data updated for range: ${range}`, 'info', 3000);
}

/**
 * Initialize user settings
 */
function initUserSettings() {
  // Load user settings from localStorage
  const userSettings = Utils.getFromStorage('userSettings', {
    theme: 'light',
    language: 'en',
    currency: 'USD',
    notifications: true
  });
  
  // Apply settings
  applyUserSettings(userSettings);
}

/**
 * Apply user settings to the application
 * @param {Object} settings - The user settings object
 */
function applyUserSettings(settings) {
  // Apply theme
  document.body.setAttribute('data-theme', settings.theme);
  
  // Apply language (in a real app, this would load language files)
  document.documentElement.setAttribute('lang', settings.language);
  
  // Set currency format
  window.appCurrency = settings.currency;
}

/**
 * Initialize application data
 */
function initAppData() {
  // Check if this is the first run
  const isFirstRun = !Utils.getFromStorage('appInitialized');
  
  if (isFirstRun) {
    // Initialize with demo data
    initializeDemoData();
    
    // Mark as initialized
    Utils.saveToStorage('appInitialized', true);
  } else {
    // Load cached data
    loadCachedData();
  }
}

/**
 * Initialize application with demo data
 */
function initializeDemoData() {
  // In a real app, this would initialize local data stores
  // For this demo, we'll just store some basic data in localStorage
  
  // Demo accounts
  const demoAccounts = [
    { code: '1110', name: 'Cash', type: 'Asset', balance: 4580 },
    { code: '1121', name: 'Checking Account', type: 'Asset', balance: 28450.32 },
    { code: '1122', name: 'Savings Account', type: 'Asset', balance: 35620 },
    { code: '1130', name: 'Accounts Receivable', type: 'Asset', balance: 12380.5 },
    { code: '2110', name: 'Accounts Payable', type: 'Liability', balance: 8450.75 },
    { code: '3100', name: 'Capital', type: 'Equity', balance: 50000 },
    { code: '4100', name: 'Sales', type: 'Revenue', balance: 32450 },
    { code: '5100', name: 'Cost of Goods Sold', type: 'Expense', balance: 18260 }
  ];
  
  // Save demo accounts
  Utils.saveToStorage('accounts', demoAccounts);
  
  // Demo journal entries
  const demoJournalEntries = [
    {
      id: 'JE-25042501',
      type: 'receipt',
      date: '2025-04-25',
      reference: 'REC-25042025',
      description: 'Payment received from Karwan Khalil',
      timestamp: '2025-04-25T10:30:45.123Z',
      entries: [
        { account: '1121', description: 'Bank deposit', amount: 12800 },
        { account: '4100', description: 'Sales revenue', amount: 12800 }
      ]
    },
    {
      id: 'JE-25042502',
      type: 'payment',
      date: '2025-04-25',
      reference: 'PAY-25042025',
      description: 'Payment to Raad Aneed for supplies',
      timestamp: '2025-04-25T14:15:22.456Z',
      entries: [
        { account: '1110', description: 'Cash payment', amount: 4500 },
        { account: '5100', description: 'Purchase of supplies', amount: 4500 }
      ]
    },
    {
      id: 'JE-24042503',
      type: 'general',
      date: '2025-04-24',
      reference: 'JNL-24042025',
      description: 'Monthly depreciation entry',
      timestamp: '2025-04-24T16:45:33.789Z',
      entries: [
        { account: '5200', description: 'Depreciation expense', debit: 1200, credit: 0 },
        { account: '1200', description: 'Accumulated depreciation', debit: 0, credit: 1200 }
      ]
    },
    {
      id: 'JE-23042504',
      type: 'transfer',
      date: '2025-04-23',
      reference: 'TRF-23042025',
      description: 'Transfer from Savings to Checking',
      timestamp: '2025-04-23T09:20:11.345Z',
      entries: [
        { fromAccount: '1122', toAccount: '1121', description: 'Fund transfer', amount: 8320 }
      ]
    }
  ];
  
  // Save demo journal entries
  Utils.saveToStorage('journalEntries', demoJournalEntries);
}

/**
 * Load cached data
 */
function loadCachedData() {
  // Load accounts
  const accounts = Utils.getFromStorage('accounts', []);
  console.log('Loaded accounts:', accounts.length);
  
  // Load journal entries
  const journalEntries = Utils.getFromStorage('journalEntries', []);
  console.log('Loaded journal entries:', journalEntries.length);
}

/**
 * Update UI for the current page
 * @param {string} pageId - The current page ID
 */
function updateUIForPage(pageId) {
  // Update page title
  updatePageTitle(pageId);
  
  // Set active navigation item
  setActiveNavItem(pageId);
  
  // Initialize page-specific components
  initPageComponents(pageId);
}

/**
 * Update the page title based on the current page
 * @param {string} pageId - The current page ID
 */
function updatePageTitle(pageId) {
  let title = 'Financial Management';
  
  if (pageId === 'dashboard') {
    title += ' - Dashboard';
  } else if (pageId === 'chart-of-accounts') {
    title += ' - Chart of Accounts';
  } else if (pageId.includes('journal')) {
    title += ' - Journal Entries';
  } else if (pageId === 'customers') {
    title += ' - Customers';
  } else if (pageId.includes('travel')) {
    title += ' - Travel';
  } else if (pageId === 'tasks') {
    title += ' - Tasks';
  } else if (pageId === 'notes') {
    title += ' - Notes';
  }
  
  document.title = title;
}

/**
 * Set the active navigation item in the sidebar
 * @param {string} pageId - The current page ID
 */
function setActiveNavItem(pageId) {
  // Remove active class from all nav items
  document.querySelectorAll('.sidebar-nav li').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to the current page's nav item
  const activeItem = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`);
  
  if (activeItem) {
    const parentLi = activeItem.closest('li');
    parentLi.classList.add('active');
    
    // If it's in a dropdown, expand the dropdown
    const parentDropdown = parentLi.closest('.nav-dropdown');
    if (parentDropdown) {
      parentDropdown.classList.add('active');
      const dropdownMenu = parentDropdown.querySelector('.dropdown-menu');
      if (dropdownMenu) {
        dropdownMenu.style.display = 'block';
      }
    }
  }
}

/**
 * Initialize page-specific components
 * @param {string} pageId - The current page ID
 */
function initPageComponents(pageId) {
  // Trigger a custom event for page initialization
  // This allows other modules to initialize their components
  const event = new CustomEvent('pageLoaded', {
    detail: {
      pageId: pageId
    }
  });
  
  document.dispatchEvent(event);
}

/**
 * Show a notification message
 * @param {string} message - The notification message
 * @param {string} type - The notification type (info, success, warning, error)
 * @param {number} duration - The duration to show the notification (in ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  // Set notification content
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fas fa-${getNotificationIcon(type)}"></i>
    </div>
    <div class="notification-content">
      <p>${message}</p>
    </div>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Get or create notification container
  let container = document.querySelector('.notification-container');
  
  if (!container) {
    container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
  }
  
  // Add to container
  container.appendChild(notification);
  
  // Auto remove after duration
  setTimeout(() => {
    notification.classList.add('fade-out');
    
    // Remove from DOM after fade out
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);
  
  // Add close button handler
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
}

/**
 * Get the icon for a notification type
 * @param {string} type - The notification type
 * @returns {string} The icon name
 */
function getNotificationIcon(type) {
  switch (type) {
    case 'success':
      return 'check-circle';
    case 'warning':
      return 'exclamation-triangle';
    case 'error':
      return 'times-circle';
    case 'info':
    default:
      return 'info-circle';
  }
}

// Export app functions
export {
  initApp,
  updateDashboardData,
  applyUserSettings,
  showNotification,
  saveToStorage,
  getFromStorage,
  removeFromStorage
};