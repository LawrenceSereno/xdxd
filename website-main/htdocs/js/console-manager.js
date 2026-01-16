/* ============================================
   Console Manager - Lightweight Error Suppression
   Performance Optimized Version
   ============================================ */

class ConsoleManager {
  constructor() {
    this.suppressedErrors = new Set();
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };
    
    // Production mode - set to true to minimize logs
    this.productionMode = true;
    
    // Debug categories that can be toggled
    this.debugCategories = {
      booking: false,
      auth: false,
      firebase: false,
      ui: false,
      all: false
    };
    
    // Suppress patterns - checked once per error type
    this.suppressPatterns = [
      'Tracking Prevention',
      'Permissions policy violation',
      'accelerometer',
      'streetview.js',
      'common.js',
      'init_embed.js',
      'Permission denied',
      'Error getting bookings',
      'Error getting users',
      'absences is not defined',
      'firebase-db.js',
      'Google Maps'
    ];
    
    this.init();
  }

  init() {
    this.setupErrorSuppression();
    this.setupPermissionErrorHandling();
    this.setupProductionLogging();
  }
  
  setupProductionLogging() {
    const self = this;
    const orig = this.originalConsole;
    
    // Override console.log in production mode
    console.log = function(...args) {
      // Always show errors and important messages
      const msg = args[0]?.toString() || '';
      
      // Always show these important logs
      if (msg.includes('✅') || msg.includes('🚨') || msg.includes('❌') || 
          msg.includes('Error') || msg.includes('error') ||
          msg.includes('Success') || msg.includes('success')) {
        orig.log(...args);
        return;
      }
      
      // In production mode, only show critical logs
      if (self.productionMode && !self.debugCategories.all) {
        // Check if this is a debug category log
        if (msg.startsWith('[') && msg.includes(']')) {
          const category = msg.match(/\[([^\]]+)\]/)?.[1]?.toLowerCase() || '';
          if (category.includes('booking') && !self.debugCategories.booking) return;
          if (category.includes('auth') && !self.debugCategories.auth) return;
          if (category.includes('firebase') && !self.debugCategories.firebase) return;
          if (category.includes('ui') && !self.debugCategories.ui) return;
        }
      }
      
      orig.log(...args);
    };
  }

  setupErrorSuppression() {
    const self = this;
    
    // Lightweight error override
    console.error = function(...args) {
      const msg = args[0]?.toString() || '';
      
      // Quick pattern check
      for (const pattern of self.suppressPatterns) {
        if (msg.includes(pattern)) {
          const key = pattern.substring(0, 20);
          if (self.suppressedErrors.has(key)) return;
          self.suppressedErrors.add(key);
        }
      }
      
      self.originalConsole.error(...args);
    };

    // Lightweight warn override
    console.warn = function(...args) {
      const msg = args[0]?.toString() || '';
      
      for (const pattern of self.suppressPatterns) {
        if (msg.includes(pattern)) {
          const key = 'w-' + pattern.substring(0, 20);
          if (self.suppressedErrors.has(key)) return;
          self.suppressedErrors.add(key);
        }
      }
      
      self.originalConsole.warn(...args);
    };
  }

  setupPermissionErrorHandling() {
    window.addEventListener('unhandledrejection', (event) => {
      const msg = event.reason?.message || '';
      if (msg.includes('Permission denied')) {
        event.preventDefault();
      }
    });
  }

  createCleanLogger() {
    const orig = this.originalConsole;
    return {
      info: (msg, ...args) => orig.info(`[App] ${msg}`, ...args),
      success: (msg, ...args) => orig.log(`✅ ${msg}`, ...args),
      warning: (msg, ...args) => orig.warn(`⚠️ ${msg}`, ...args),
      error: (msg, ...args) => orig.error(`❌ ${msg}`, ...args)
    };
  }

  getErrorStats() {
    return { suppressedCount: this.suppressedErrors.size };
  }

  reset() {
    this.suppressedErrors.clear();
  }

  restore() {
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.info = this.originalConsole.info;
  }

  enableVerboseMode() {
    this.productionMode = false;
    this.debugCategories.all = true;
    this.suppressedErrors.clear();
    this.suppressPatterns = [];
    console.log('🔧 Verbose logging enabled');
  }
  
  enableProductionMode() {
    this.productionMode = true;
    this.debugCategories.all = false;
    console.log('🔧 Production logging enabled (minimal logs)');
  }
  
  enableDebugCategory(category) {
    if (this.debugCategories.hasOwnProperty(category)) {
      this.debugCategories[category] = true;
      console.log(`🔧 Debug enabled for: ${category}`);
    }
  }
}

// Create global instance
const consoleManager = new ConsoleManager();
const logger = consoleManager.createCleanLogger();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConsoleManager, logger };
}

window.getConsoleStats = () => consoleManager.getErrorStats();
window.resetConsoleTracking = () => consoleManager.reset();
window.enableVerboseLogging = () => consoleManager.enableVerboseMode();
window.enableProductionLogging = () => consoleManager.enableProductionMode();
window.debugBooking = () => consoleManager.enableDebugCategory('booking');
window.consoleManager = consoleManager;
window.logger = logger;