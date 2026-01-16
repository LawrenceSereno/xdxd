/* ============================================
BestBuddies Pet Grooming - Adaptive Performance System
Version: 1.0
Purpose: Automatically detects network speed and device capabilities,
         adjusts timeouts and performance settings accordingly
============================================ */

class AdaptivePerformanceSystem {
  constructor() {
    this.networkSpeed = 'normal'; // 'fast', 'normal', 'slow'
    this.deviceCapability = 'medium'; // 'high', 'medium', 'low'
    this.baseTimeouts = {
      loginCheck: 8000,      // Increased from 5000
      userFetch: 8000,       // Increased from 5000
      warningPanel: 5000,    // Increased from 3000
      autoCancel: 5000,      // Increased from 3000
      bookingsLoad: 15000,   // Increased from 8000
      notifications: 5000,   // Increased from 2000
      firebaseUser: 45000,   // Increased from 30000
      debounce: 300,
      scrollDelay: 150
    };
    this.retryAttempts = 3;
    this.retryBackoffMultiplier = 1.5;
    this.performanceMetrics = [];
    this.maxMetricsHistory = 100;
    
    this.init();
  }

  /**
   * Initialize the adaptive performance system
   * Detect network speed and device capability
   */
  init() {
    console.log('[AdaptivePerformance] Initializing...');
    
    // Detect network speed
    this.detectNetworkSpeed();
    
    // Detect device capability
    this.detectDeviceCapability();
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Setup memory monitoring
    this.setupMemoryMonitoring();
    
    console.log('[AdaptivePerformance] Initialized:', {
      networkSpeed: this.networkSpeed,
      deviceCapability: this.deviceCapability
    });
  }

  /**
   * Detect network speed using Navigation Timing API
   * Analyzes connection type and latency
   */
  detectNetworkSpeed() {
    try {
      // Check if we have connection info
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
        const downlink = connection.downlink; // Mbps
        
        console.log('[AdaptivePerformance] Connection info:', { effectiveType, downlink });
        
        // Classify based on effective type
        if (effectiveType === '4g' || effectiveType === 'wifi') {
          this.networkSpeed = 'fast';
        } else if (effectiveType === '3g') {
          this.networkSpeed = 'normal';
        } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
          this.networkSpeed = 'slow';
        }
      } else {
        // Fallback: use navigation timing to estimate
        if (window.performance && window.performance.timing) {
          const timing = window.performance.timing;
          const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
          
          // If page took more than 3 seconds to load, assume slow network
          if (pageLoadTime > 3000) {
            this.networkSpeed = 'slow';
          } else if (pageLoadTime > 1500) {
            this.networkSpeed = 'normal';
          } else {
            this.networkSpeed = 'fast';
          }
        }
      }
    } catch (error) {
      console.warn('[AdaptivePerformance] Network detection failed:', error);
      this.networkSpeed = 'normal'; // Default to normal
    }
  }

  /**
   * Detect device capability based on hardware specs
   * Analyzes CPU cores, RAM, and device type
   */
  detectDeviceCapability() {
    try {
      const cores = navigator.hardwareConcurrency || 1;
      const ram = navigator.deviceMemory || 4;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log('[AdaptivePerformance] Device info:', { cores, ram, isMobile });
      
      // Classify based on hardware
      if (cores >= 4 && ram >= 8 && !isMobile) {
        this.deviceCapability = 'high';
      } else if (cores >= 2 && ram >= 4) {
        this.deviceCapability = 'medium';
      } else {
        this.deviceCapability = 'low';
      }
    } catch (error) {
      console.warn('[AdaptivePerformance] Device detection failed:', error);
      this.deviceCapability = 'medium'; // Default to medium
    }
  }

  /**
   * Setup performance monitoring using PerformanceObserver
   * Tracks resource timing and navigation timing
   */
  setupPerformanceMonitoring() {
    try {
      if ('PerformanceObserver' in window) {
        // Monitor resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              type: 'resource',
              name: entry.name,
              duration: entry.duration,
              size: entry.transferSize || 0
            });
          }
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
        console.log('[AdaptivePerformance] Resource monitoring enabled');
      }
    } catch (error) {
      console.warn('[AdaptivePerformance] Performance monitoring setup failed:', error);
    }
  }

  /**
   * Setup memory monitoring
   * Tracks memory usage and adjusts performance if needed
   */
  setupMemoryMonitoring() {
    try {
      if (performance.memory) {
        setInterval(() => {
          const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
          
          // If memory usage is high, degrade performance
          if (memoryUsage > 0.9) {
            console.warn('[AdaptivePerformance] High memory usage detected:', (memoryUsage * 100).toFixed(2) + '%');
            this.deviceCapability = 'low';
          } else if (memoryUsage < 0.5 && this.deviceCapability === 'low') {
            // If memory usage is low and we downgraded, try to upgrade back
            this.detectDeviceCapability();
          }
        }, 5000); // Check every 5 seconds
      }
    } catch (error) {
      console.warn('[AdaptivePerformance] Memory monitoring setup failed:', error);
    }
  }

  /**
   * Record performance metric
   * Keeps history for analysis
   */
  recordMetric(metric) {
    this.performanceMetrics.push({
      ...metric,
      timestamp: Date.now()
    });
    
    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxMetricsHistory) {
      this.performanceMetrics.shift();
    }
  }

  /**
   * Get timeout value for an operation
   * Applies multipliers based on network speed and device capability
   * 
   * @param {string} operation - Operation name (e.g., 'loginCheck', 'bookingsLoad')
   * @returns {number} Timeout in milliseconds
   */
  getTimeout(operation) {
    const baseTimeout = this.baseTimeouts[operation] || 5000;
    
    // Network speed multipliers
    const networkMultiplier = {
      'fast': 0.8,
      'normal': 1.0,
      'slow': 2.0
    }[this.networkSpeed] || 1.0;
    
    // Device capability multipliers
    const deviceMultiplier = {
      'high': 0.8,
      'medium': 1.0,
      'low': 1.5
    }[this.deviceCapability] || 1.0;
    
    // Calculate final timeout
    const finalTimeout = Math.round(baseTimeout * networkMultiplier * deviceMultiplier);
    
    console.log('[AdaptivePerformance] Timeout for', operation, ':', {
      base: baseTimeout,
      network: this.networkSpeed,
      networkMult: networkMultiplier,
      device: this.deviceCapability,
      deviceMult: deviceMultiplier,
      final: finalTimeout
    });
    
    return finalTimeout;
  }

  /**
   * Execute operation with automatic retry logic
   * Uses exponential backoff for retries
   * 
   * @param {Function} operation - Async function to execute
   * @param {string} operationName - Name for logging
   * @param {number} maxAttempts - Maximum retry attempts
   * @returns {Promise} Result of operation
   */
  async executeWithRetry(operation, operationName = 'operation', maxAttempts = this.retryAttempts) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[AdaptivePerformance] Executing ${operationName} (attempt ${attempt}/${maxAttempts})`);
        const result = await operation();
        console.log(`[AdaptivePerformance] ${operationName} succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`[AdaptivePerformance] ${operationName} failed on attempt ${attempt}:`, error.message);
        
        if (attempt < maxAttempts) {
          // Calculate backoff delay
          const backoffDelay = Math.round(1000 * Math.pow(this.retryBackoffMultiplier, attempt - 1));
          console.log(`[AdaptivePerformance] Retrying ${operationName} in ${backoffDelay}ms...`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }
    
    // All attempts failed
    console.error(`[AdaptivePerformance] ${operationName} failed after ${maxAttempts} attempts`);
    throw lastError;
  }

  /**
   * Execute operation with timeout
   * Combines timeout with retry logic
   * 
   * @param {Function} operation - Async function to execute
   * @param {string} operationName - Operation name for timeout lookup
   * @returns {Promise} Result of operation
   */
  async executeWithTimeout(operation, operationName) {
    const timeout = this.getTimeout(operationName);
    
    return Promise.race([
      operation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`${operationName} timeout after ${timeout}ms`)), timeout)
      )
    ]);
  }

  /**
   * Get performance report
   * Useful for debugging and optimization
   * 
   * @returns {Object} Performance report
   */
  getPerformanceReport() {
    const avgDuration = this.performanceMetrics.length > 0
      ? this.performanceMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / this.performanceMetrics.length
      : 0;
    
    const totalSize = this.performanceMetrics.reduce((sum, m) => sum + (m.size || 0), 0);
    
    return {
      networkSpeed: this.networkSpeed,
      deviceCapability: this.deviceCapability,
      metricsCount: this.performanceMetrics.length,
      avgDuration: avgDuration.toFixed(2),
      totalSize: (totalSize / 1024).toFixed(2) + ' KB',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reset system
   * Useful for testing or when conditions change
   */
  reset() {
    console.log('[AdaptivePerformance] Resetting system...');
    this.performanceMetrics = [];
    this.init();
  }
}

// Create global instance
window.adaptivePerformance = new AdaptivePerformanceSystem();

// Export for debugging
window.getAdaptivePerformanceReport = () => window.adaptivePerformance.getPerformanceReport();
window.resetAdaptivePerformance = () => window.adaptivePerformance.reset();

console.log('[AdaptivePerformance] System loaded and ready');
