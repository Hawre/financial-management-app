/**
 * Dashboard functionality for Financial Management App
 */

// Import utility functions
import * as Utils from './utils.js';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dashboard if it's the current page
  document.addEventListener('pageLoaded', function(e) {
    if (e.detail.pageId === 'dashboard') {
      initDashboard();
    }
  });
});

/**
 * Initialize dashboard
 */
function initDashboard() {
  // Initialize charts
  initCashFlowChart();
  initIncomePieChart();
  initExpensePieChart();
  
  // Initialize dashboard components
  initDateRangeFilter();
  initTransactionList();
  initAccountBalances();
  initQuickActions();
  initTasksList();
  
  console.log('Dashboard initialized');
}

/**
 * Initialize date range filter
 */
function initDateRangeFilter() {
  const dateRangeSelect = document.getElementById('dateRangeSelect');
  
  if (dateRangeSelect) {
    dateRangeSelect.addEventListener('change', function() {
      // Update dashboard data based on selected range
      updateDashboardData(this.value);
    });
  }
}

/**
 * Update dashboard data
 * @param {string} dateRange - The selected date range
 */
function updateDashboardData(dateRange) {
  // Show loading indicators
  showLoading();
  
  // In a real app, this would fetch data from an API
  // For this demo, we'll simulate an API request with a timeout
  setTimeout(function() {
    // Update stats based on date range
    updateStats(dateRange);
    
    // Update charts
    updateCharts(dateRange);
    
    // Update transaction list
    updateTransactionList(dateRange);
    
    // Update account balances
    updateAccountBalances(dateRange);
    
    // Hide loading indicators
    hideLoading();
    
    // Show notification
    Utils.showNotification(`Dashboard updated for ${dateRange}`, 'success', 3000);
  }, 1000);
}

/**
 * Show loading indicators
 */
function showLoading() {
  // Add loading class to dashboard elements
  document.querySelectorAll('.dashboard-card, .stat-card').forEach(card => {
    card.classList.add('loading');
    
    // Create loading overlay if it doesn't exist
    if (!card.querySelector('.loading-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      card.appendChild(overlay);
    }
  });
}

/**
 * Hide loading indicators
 */
function hideLoading() {
  // Remove loading class from dashboard elements
  document.querySelectorAll('.dashboard-card, .stat-card').forEach(card => {
    card.classList.remove('loading');
    
    // Remove loading overlay
    const overlay = card.querySelector('.loading-overlay');
    if (overlay) {
      overlay.remove();
    }
  });
}

/**
 * Update stats cards
 * @param {string} dateRange - The selected date range
 */
function updateStats(dateRange) {
  // In a real app, this would update the stats with actual data
  // For this demo, we'll just simulate it with static data
  
  // Get stat value elements
  const incomeValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
  const expenseValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
  const profitValue = document.querySelector('.stat-card:nth-child(3) .stat-value');
  const invoicesValue = document.querySelector('.stat-card:nth-child(4) .stat-value');
  
  // Update values based on date range
  if (dateRange === 'today') {
    if (incomeValue) incomeValue.textContent = '$1,250';
    if (expenseValue) expenseValue.textContent = '$750';
    if (profitValue) profitValue.textContent = '$500';
    if (invoicesValue) invoicesValue.textContent = '3';
  } else if (dateRange === 'week') {
    if (incomeValue) incomeValue.textContent = '$8,450';
    if (expenseValue) expenseValue.textContent = '$4,980';
    if (profitValue) profitValue.textContent = '$3,470';
    if (invoicesValue) invoicesValue.textContent = '7';
  } else if (dateRange === 'month') {
    if (incomeValue) incomeValue.textContent = '$32,450';
    if (expenseValue) expenseValue.textContent = '$18,260';
    if (profitValue) profitValue.textContent = '$14,190';
    if (invoicesValue) invoicesValue.textContent = '12';
  } else if (dateRange === 'quarter') {
    if (incomeValue) incomeValue.textContent = '$98,750';
    if (expenseValue) expenseValue.textContent = '$54,320';
    if (profitValue) profitValue.textContent = '$44,430';
    if (invoicesValue) invoicesValue.textContent = '28';
  } else if (dateRange === 'year') {
    if (incomeValue) incomeValue.textContent = '$387,640';
    if (expenseValue) expenseValue.textContent = '$212,980';
    if (profitValue) profitValue.textContent = '$174,660';
    if (invoicesValue) invoicesValue.textContent = '84';
  }
}

/**
 * Update charts
 * @param {string} dateRange - The selected date range
 */
function updateCharts(dateRange) {
  // In a real app, this would fetch new data and update the charts
  // For this demo, we'll just update the existing charts
  
  // Get chart instances
  const cashFlowChart = Chart.getChart('cashFlowChart');
  const incomePieChart = Chart.getChart('incomePieChart');
  const expensePieChart = Chart.getChart('expensePieChart');
  
  // Update chart data based on date range
  if (cashFlowChart) {
    // Update labels based on date range
    let labels = [];
    
    if (dateRange === 'today') {
      labels = ['9AM', '12PM', '3PM', '6PM', '9PM'];
    } else if (dateRange === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (dateRange === 'month') {
      labels = ['Apr 1', 'Apr 7', 'Apr 14', 'Apr 21', 'Apr 28', 'May 3'];
    } else if (dateRange === 'quarter') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    } else if (dateRange === 'year') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
    
    // Update chart data
    cashFlowChart.data.labels = labels;
    
    // Simulate different data based on date range
    const factor = dateRange === 'today' ? 0.05 : 
                  dateRange === 'week' ? 0.2 : 
                  dateRange === 'month' ? 1 : 
                  dateRange === 'quarter' ? 3 : 
                  5;
    
    // Update income data
    cashFlowChart.data.datasets[0].data = [
      6200 * factor, 
      15800 * factor, 
      20400 * factor, 
      27300 * factor, 
      32450 * factor, 
      dateRange === 'month' || dateRange === 'quarter' || dateRange === 'year' ? 32450 * factor : null
    ].filter(Boolean);
    
    // Update expense data
    cashFlowChart.data.datasets[1].data = [
      3800 * factor, 
      8200 * factor, 
      11500 * factor, 
      15400 * factor, 
      18260 * factor,
      dateRange === 'month' || dateRange === 'quarter' || dateRange === 'year' ? 18260 * factor : null
    ].filter(Boolean);
    
    // Update chart
    cashFlowChart.update();
  }
  
  // Update pie charts (simpler update)
  if (incomePieChart) {
    incomePieChart.update();
  }
  
  if (expensePieChart) {
    expensePieChart.update();
  }
}

/**
 * Initialize cash flow chart
 */
function initCashFlowChart() {
  const ctx = document.getElementById('cashFlowChart');
  
  if (ctx) {
    const cashFlowChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Apr 1', 'Apr 7', 'Apr 14', 'Apr 21', 'Apr 28', 'May 3'],
        datasets: [
          {
            label: 'Income',
            data: [6200, 15800, 20400, 27300, 32450, 32450],
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Expenses',
            data: [3800, 8200, 11500, 15400, 18260, 18260],
            borderColor: '#F44336',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }
}

/**
 * Initialize income pie chart
 */
function initIncomePieChart() {
  const ctx = document.getElementById('incomePieChart');
  
  if (ctx) {
    const incomePieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Sales', 'Services', 'Investments', 'Other'],
        datasets: [{
          data: [18500, 9200, 3800, 950],
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#9C27B0',
            '#FF9800'
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  }
}

/**
 * Initialize expense pie chart
 */
function initExpensePieChart() {
  const ctx = document.getElementById('expensePieChart');
  
  if (ctx) {
    const expensePieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Rent', 'Salaries', 'Utilities', 'Supplies', 'Marketing', 'Other'],
        datasets: [{
          data: [2500, 8200, 1750, 2300, 2100, 1410],
          backgroundColor: [
            '#F44336',
            '#E91E63',
            '#9C27B0',
            '#673AB7',
            '#3F51B5',
            '#607D8B'
          ],
          borderColor: '#FFFFFF',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: $${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  }
}

/**
 * Update transaction list
 * @param {string} dateRange - The selected date range
 */
function updateTransactionList(dateRange) {
  // In a real app, this would fetch new transaction data
  // For this demo, we'll keep the existing transactions
  console.log('Transaction list updated for', dateRange);
}

/**
 * Initialize transaction list
 */
function initTransactionList() {
  // In a real app, this would add event listeners to transactions
  // For this demo, we'll just add a click listener
  
  const transactionList = document.querySelector('.transaction-list');
  
  if (transactionList) {
    transactionList.addEventListener('click', function(e) {
      const transactionItem = e.target.closest('.transaction-item');
      
      if (transactionItem) {
        // In a real app, this would open the transaction details
        console.log('Transaction clicked:', transactionItem.querySelector('.transaction-main h4').textContent);
      }
    });
  }
}

/**
 * Update account balances
 * @param {string} dateRange - The selected date range
 */
function updateAccountBalances(dateRange) {
  // In a real app, this would fetch new account balance data
  // For this demo, we'll keep the existing account balances
  console.log('Account balances updated for', dateRange);
}

/**
 * Initialize account balances
 */
function initAccountBalances() {
  // In a real app, this would add event listeners to accounts
  // For this demo, we'll just add a click listener
  
  const accountsList = document.querySelector('.accounts-list');
  
  if (accountsList) {
    accountsList.addEventListener('click', function(e) {
      const accountItem = e.target.closest('.account-item');
      
      if (accountItem) {
        // In a real app, this would open the account details
        console.log('Account clicked:', accountItem.querySelector('.account-info h4').textContent);
      }
    });
  }
}

/**
 * Initialize quick actions
 */
function initQuickActions() {
  // Quick actions already have href attributes for navigation
  // No additional initialization needed
}

/**
 * Initialize tasks list
 */
function initTasksList() {
  // Add click event listeners to task checkboxes
  const tasksList = document.querySelector('.tasks-list');
  
  if (tasksList) {
    tasksList.addEventListener('change', function(e) {
      if (e.target.type === 'checkbox') {
        const taskItem = e.target.closest('.task-item');
        
        if (taskItem) {
          if (e.target.checked) {
            taskItem.classList.add('completed');
          } else {
            taskItem.classList.remove('completed');
          }
          
          // In a real app, this would update the task status in the database
          console.log('Task status changed:', taskItem.querySelector('.task-details h4').textContent);
        }
      }
    });
  }
}

// Export dashboard functions
export {
  initDashboard,
  updateDashboardData
};