/**
 * Navigation functionality for Financial Management App
 */

import * as Utils from './utils.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation
  initNavigation();
  
  console.log('Navigation initialized');
});

/**
 * Initialize navigation
 */
function initNavigation() {
  // Set up sidebar toggle
  setupSidebarToggle();
  
  // Set up navigation links
  setupNavigationLinks();
  
  // Set up dropdown toggles
  setupDropdownToggles();
  
  // Handle initial page load (based on URL)
  handleInitialPageLoad();
}

/**
 * Set up sidebar toggle button
 */
function setupSidebarToggle() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
      document.body.classList.toggle('sidebar-collapsed');
      
      // Store preference in localStorage
      const isCollapsed = document.body.classList.contains('sidebar-collapsed');
      Utils.saveToStorage('sidebarCollapsed', isCollapsed);
    });
    
    // Apply stored sidebar state
    if (Utils.getFromStorage('sidebarCollapsed')) {
      document.body.classList.add('sidebar-collapsed');
    }
  }
}

/**
 * Set up navigation links
 */
function setupNavigationLinks() {
  const navLinks = document.querySelectorAll('.sidebar-nav a[data-page]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only handle links with data-page
      if (!this.dataset.page) return;
      
      // Get page from data attribute
      const pageId = this.dataset.page;
      
      // Get page URL from href
      const pageUrl = this.getAttribute('href');
      
      // If this is just a dropdown toggle with no specific page, return
      if (this.classList.contains('dropdown-toggle')) return;
      
      // Check if page exists
      if (!pageUrl || !pageExists(pageUrl)) {
        e.preventDefault();
        alert(`Page "${pageId}" is not implemented yet.`);
        return;
      }
    });
  });
}

/**
 * Check if a page file exists
 * @param {string} url - The page URL
 * @returns {boolean} True if page exists
 */
function pageExists(url) {
  // For this demo, we'll check for empty files
  const emptyPages = ['customers.html', 'notes.html', 'tasks.html'];
  
  // Extract filename from URL
  const filename = url.split('/').pop();
  
  // Return false for empty pages
  return !emptyPages.includes(filename);
}

/**
 * Set up dropdown toggles
 */
function setupDropdownToggles() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Toggle dropdown
      const parent = this.parentElement;
      parent.classList.toggle('open');
      
      // Toggle dropdown menu display
      const dropdownMenu = parent.querySelector('.dropdown-menu');
      
      if (dropdownMenu) {
        dropdownMenu.style.display = parent.classList.contains('open') ? 'block' : 'none';
      }
      
      // Toggle dropdown icon
      const dropdownIcon = this.querySelector('.dropdown-icon');
      
      if (dropdownIcon) {
        dropdownIcon.classList.toggle('fa-chevron-down');
        dropdownIcon.classList.toggle('fa-chevron-up');
      }
    });
  });
  
  // Open dropdown if it contains active item
  const activeDropdownItem = document.querySelector('.dropdown-menu .active');
  
  if (activeDropdownItem) {
    const parentDropdown = activeDropdownItem.closest('.nav-dropdown');
    
    if (parentDropdown) {
      parentDropdown.classList.add('open');
      
      const dropdownMenu = parentDropdown.querySelector('.dropdown-menu');
      if (dropdownMenu) {
        dropdownMenu.style.display = 'block';
      }
      
      const dropdownIcon = parentDropdown.querySelector('.dropdown-icon');
      if (dropdownIcon) {
        dropdownIcon.classList.remove('fa-chevron-down');
        dropdownIcon.classList.add('fa-chevron-up');
      }
    }
  }
}

/**
 * Handle initial page load
 */
function handleInitialPageLoad() {
  // Get current page from URL
  const url = window.location.href;
  const pagePath = url.split('/').pop();
  
  // If no specific page is loaded, we're on the index/dashboard
  const currentPageId = pagePath ? getPageIdFromPath(pagePath) : 'dashboard';
  
  // Trigger page loaded event
  triggerPageLoadedEvent(currentPageId);
}

/**
 * Get page ID from path
 * @param {string} path - The page path
 * @returns {string} The page ID
 */
function getPageIdFromPath(path) {
  // Remove file extension and query params
  const basePageName = path.split('.')[0].split('?')[0];
  
  // Special case for index
  if (basePageName === 'index' || basePageName === '') {
    return 'dashboard';
  }
  
  // Check for nested paths
  if (path.includes('/')) {
    const pathParts = path.split('/');
    const section = pathParts[pathParts.length - 2];
    const page = pathParts[pathParts.length - 1].split('.')[0];
    
    return `${section}-${page}`;
  }
  
  return basePageName;
}

/**
 * Trigger a page loaded event
 * @param {string} pageId - The ID of the page
 */
function triggerPageLoadedEvent(pageId) {
  // Create and dispatch custom event
  const event = new CustomEvent('pageLoaded', {
    detail: {
      pageId: pageId
    }
  });
  
  document.dispatchEvent(event);
}

// Export public API
export {
  initNavigation,
  triggerPageLoadedEvent
};