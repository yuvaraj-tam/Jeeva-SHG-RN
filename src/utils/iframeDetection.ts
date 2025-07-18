// Iframe detection and optimization utilities

export interface IframeConfig {
  isInIframe: boolean;
  parentDomain: string | null;
  viewportHeight: number;
  viewportWidth: number;
}

class IframeManager {
  private config: IframeConfig;
  private resizeTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.config = this.detectIframeEnvironment();
    this.initializeOptimizations();
  }

  private detectIframeEnvironment(): IframeConfig {
    const isInIframe = window !== window.parent;
    let parentDomain = null;

    if (isInIframe) {
      try {
        parentDomain = document.referrer ? new URL(document.referrer).hostname : null;
      } catch (error) {
        console.log('Cannot access parent domain due to CORS');
      }
    }

    return {
      isInIframe,
      parentDomain,
      viewportHeight: window.innerHeight,
      viewportWidth: window.innerWidth
    };
  }

  private initializeOptimizations(): void {
    // Always apply scrolling optimizations, not just for iframe
    this.applyScrollingStyles();
    this.setupCommunication();
    this.handleResize();
    this.optimizeScrolling();
    this.fixTouchEvents();
    
    if (this.config.isInIframe) {
      // Apply iframe-specific optimizations
      this.applyIframeStyles();
    }
  }

  private applyScrollingStyles(): void {
    // Apply scrolling styles to all environments
    const styles = `
      /* Global scrolling fixes for all environments */
      body {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        height: auto !important;
        min-height: 100vh !important;
        -webkit-overflow-scrolling: touch !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      html {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        height: auto !important;
        min-height: 100vh !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* Fix React Native Web root */
      [data-rn-root] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        height: auto !important;
        min-height: 100vh !important;
        -webkit-overflow-scrolling: touch !important;
        display: block !important;
        flex-direction: column !important;
      }

      /* Fix main app container */
      [data-rn-root] > div {
        height: auto !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        display: block !important;
        flex: 1 !important;
      }

      /* Fix all div containers */
      div {
        box-sizing: border-box !important;
      }

      /* Fix main content area */
      .main-content {
        height: auto !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        display: block !important;
        flex: 1 !important;
      }

      /* Fix screen containers */
      .screen-container {
        height: auto !important;
        min-height: calc(100vh - 60px) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        padding-bottom: 20px !important;
        display: block !important;
      }

      /* Fix ScrollView components */
      [class*="ScrollView"] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        height: auto !important;
        min-height: 100% !important;
        display: block !important;
      }

      /* Fix sidebar */
      .sidebar {
        position: fixed;
        z-index: 1000;
        height: 100vh;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* Mobile optimization */
      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          width: 280px;
        }
        
        .sidebar.mobile-open {
          transform: translateX(0);
        }
        
        .main-content {
          margin-left: 0 !important;
          padding: 10px;
        }

        .screen-container {
          height: auto !important;
          min-height: calc(100vh - 60px) !important;
          padding: 10px !important;
        }
      }

      /* Prevent horizontal scrolling */
      * {
        max-width: 100% !important;
        box-sizing: border-box !important;
      }

      /* Optimize buttons and interactive elements */
      button {
        min-height: 44px;
        min-width: 44px;
      }

      /* Better touch targets for mobile */
      .touchable {
        min-height: 48px;
        display: flex;
        align-items: center;
        padding: 8px 16px;
      }

      /* Force scrolling on all content areas */
      .content-container {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        height: auto !important;
        min-height: 100% !important;
        display: block !important;
      }

      /* Fix for cards and other containers */
      .card {
        overflow: visible !important;
      }

      .card-content {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        height: auto !important;
        min-height: 100% !important;
        display: block !important;
      }

      /* Override any fixed heights */
      [style*="height"] {
        height: auto !important;
        min-height: 100vh !important;
      }

      [style*="overflow: hidden"] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }

      /* Ensure the root element is scrollable */
      #root {
        height: auto !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* Fix for React Native Web specific issues */
      [data-rn-root] {
        display: block !important;
        flex-direction: column !important;
        height: auto !important;
        min-height: 100vh !important;
        overflow: visible !important;
      }

      [data-rn-root] > div {
        flex: 1 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        height: auto !important;
        min-height: 100vh !important;
        display: block !important;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Also apply styles directly to body and html
    if (document.body) {
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
      document.body.style.height = 'auto';
      document.body.style.minHeight = '100vh';
      (document.body.style as any).webkitOverflowScrolling = 'touch';
    }

    if (document.documentElement) {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.height = 'auto';
      document.documentElement.style.minHeight = '100vh';
      (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
    }
  }

  private applyIframeStyles(): void {
    // Add iframe-mode class to body
    document.body.classList.add('iframe-mode');

    // Add dynamic styles for iframe optimization
    const styles = `
      /* Reset body and html for iframe */
      .iframe-mode {
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden !important;
        min-height: 100vh !important;
        height: auto !important;
        position: relative !important;
      }

      /* Force scrolling on body and html */
      .iframe-mode body,
      .iframe-mode html {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        height: auto !important;
        min-height: 100vh !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* Fix scrolling for all containers */
      .iframe-mode [data-rn-root] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        height: auto !important;
        min-height: 100vh !important;
        -webkit-overflow-scrolling: touch !important;
        display: block !important;
      }

      /* Fix main app container */
      .iframe-mode [data-rn-root] > div {
        height: auto !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        display: block !important;
      }

      /* Fix sidebar scrolling */
      .iframe-mode .sidebar {
        position: fixed;
        z-index: 1000;
        height: 100vh;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }

      /* Fix main content scrolling */
      .iframe-mode .main-content {
        transition: margin-left 0.3s ease;
        height: auto !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        display: block !important;
      }

      /* Fix screen containers */
      .iframe-mode .screen-container {
        height: auto !important;
        min-height: calc(100vh - 60px) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        padding-bottom: 20px !important;
        display: block !important;
      }

      /* Fix ScrollView components */
      .iframe-mode [class*="ScrollView"] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        height: auto !important;
        min-height: 100% !important;
        display: block !important;
      }

      /* Fix all div elements that should scroll */
      .iframe-mode div {
        box-sizing: border-box !important;
      }

      /* Force all content to be scrollable */
      .iframe-mode * {
        max-width: 100% !important;
        box-sizing: border-box !important;
      }

      /* Mobile optimization for iframe */
      @media (max-width: 768px) {
        .iframe-mode .sidebar {
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          width: 280px;
        }
        
        .iframe-mode .sidebar.mobile-open {
          transform: translateX(0);
        }
        
        .iframe-mode .main-content {
          margin-left: 0 !important;
          padding: 10px;
        }

        .iframe-mode .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          display: none;
        }

        .iframe-mode .mobile-menu-overlay.active {
          display: block;
        }

        /* Mobile specific scrolling fixes */
        .iframe-mode .screen-container {
          height: auto !important;
          min-height: calc(100vh - 60px) !important;
          padding: 10px !important;
        }
      }

      /* Prevent horizontal scrolling in iframe */
      .iframe-mode * {
        max-width: 100% !important;
        box-sizing: border-box !important;
      }

      /* Optimize buttons and interactive elements */
      .iframe-mode button {
        min-height: 44px;
        min-width: 44px;
      }

      /* Better touch targets for mobile */
      .iframe-mode .touchable {
        min-height: 48px;
        display: flex;
        align-items: center;
        padding: 8px 16px;
      }

      /* Fix for React Native Web components */
      .iframe-mode [data-rn-root] {
        display: block !important;
        flex-direction: column !important;
        height: auto !important;
        min-height: 100vh !important;
        overflow: visible !important;
      }

      .iframe-mode [data-rn-root] > div {
        flex: 1 !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        height: auto !important;
        min-height: 100vh !important;
        display: block !important;
      }

      /* Ensure proper scrolling for all content areas */
      .iframe-mode .content-container {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        height: auto !important;
        min-height: 100% !important;
        display: block !important;
      }

      /* Fix for cards and other containers */
      .iframe-mode .card {
        overflow: visible !important;
      }

      .iframe-mode .card-content {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
        height: auto !important;
        min-height: 100% !important;
        display: block !important;
      }

      /* Force iframe to be scrollable */
      .iframe-mode iframe {
        overflow-y: auto !important;
        overflow-x: hidden !important;
        height: auto !important;
        min-height: 100vh !important;
      }

      /* Override any fixed heights */
      .iframe-mode [style*="height"] {
        height: auto !important;
        min-height: 100vh !important;
      }

      .iframe-mode [style*="overflow: hidden"] {
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }

      /* Ensure the root element is scrollable */
      .iframe-mode #root {
        height: auto !important;
        min-height: 100vh !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Also apply styles directly to body and html
    if (document.body) {
      document.body.style.overflowY = 'auto';
      document.body.style.overflowX = 'hidden';
      document.body.style.height = 'auto';
      document.body.style.minHeight = '100vh';
      (document.body.style as any).webkitOverflowScrolling = 'touch';
    }

    if (document.documentElement) {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.overflowX = 'hidden';
      document.documentElement.style.height = 'auto';
      document.documentElement.style.minHeight = '100vh';
      (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
    }
  }

  private setupCommunication(): void {
    // Notify parent frame that app is ready
    this.postMessageToParent({
      type: 'APP_READY',
      height: document.body.scrollHeight,
      width: document.body.scrollWidth,
      domain: window.location.hostname
    });

    // Listen for messages from parent
    window.addEventListener('message', (event) => {
      this.handleParentMessage(event);
    });

    // Notify parent of height changes
    this.observeHeightChanges();
  }

  private handleParentMessage(event: MessageEvent): void {
    const { data } = event;

    switch (data.type) {
      case 'THEME_UPDATE':
        this.updateTheme(data.theme);
        break;
      case 'RESIZE':
        this.handleExternalResize(data.width, data.height);
        break;
      case 'SCROLL_TO_TOP':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      default:
        console.log('Received message from parent:', data);
    }
  }

  private postMessageToParent(message: any): void {
    if (this.config.isInIframe) {
      try {
        window.parent.postMessage(message, '*');
      } catch (error) {
        console.log('Cannot post message to parent:', error);
      }
    }
  }

  private handleResize(): void {
    window.addEventListener('resize', () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        this.config.viewportHeight = window.innerHeight;
        this.config.viewportWidth = window.innerWidth;

        this.postMessageToParent({
          type: 'VIEWPORT_CHANGE',
          height: window.innerHeight,
          width: window.innerWidth
        });

        this.optimizeForViewport();
      }, 250);
    });
  }

  private optimizeForViewport(): void {
    const isMobile = this.config.viewportWidth < 768;
    
    if (isMobile) {
      document.body.classList.add('mobile-iframe');
      // Adjust layout for mobile iframe
      this.optimizeMobileLayout();
    } else {
      document.body.classList.remove('mobile-iframe');
    }
  }

  private optimizeMobileLayout(): void {
    // Add mobile-specific optimizations
    const mobileStyles = `
      .mobile-iframe .sidebar {
        width: calc(100vw - 40px);
        max-width: 280px;
      }

      .mobile-iframe .modal {
        width: calc(100vw - 20px);
        max-width: none;
        margin: 10px;
      }

      .mobile-iframe .table-container {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .mobile-iframe .screen-container {
        padding: 10px !important;
      }
    `;

    const existingMobileStyles = document.getElementById('mobile-iframe-styles');
    if (!existingMobileStyles) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'mobile-iframe-styles';
      styleSheet.textContent = mobileStyles;
      document.head.appendChild(styleSheet);
    }
  }

  private optimizeScrolling(): void {
    // Prevent parent page scrolling when scrolling inside iframe
    let isScrolling = false;

    // Handle wheel events
    window.addEventListener('wheel', (event) => {
      if (!isScrolling) {
        isScrolling = true;
        setTimeout(() => { isScrolling = false; }, 100);
        
        // Notify parent about scroll activity
        this.postMessageToParent({
          type: 'SCROLL_ACTIVITY',
          deltaY: event.deltaY,
          deltaX: event.deltaX
        });
      }
    }, { passive: true });

    // Handle touch events for mobile
    let touchStartY = 0;
    let touchStartX = 0;

    window.addEventListener('touchstart', (event) => {
      touchStartY = event.touches[0].clientY;
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
      const touchY = event.touches[0].clientY;
      const touchX = event.touches[0].clientX;
      const deltaY = touchStartY - touchY;
      const deltaX = touchStartX - touchX;

      // Notify parent about touch scroll activity
      this.postMessageToParent({
        type: 'TOUCH_SCROLL',
        deltaY: deltaY,
        deltaX: deltaX
      });
    }, { passive: true });

    // Fix scrolling for all scrollable elements
    this.fixScrollableElements();

    // Force scroll test to ensure scrolling works
    setTimeout(() => {
      this.forceScrollTest();
    }, 2000);
  }

  private forceScrollTest(): void {
    // Force scroll to bottom and back to top to ensure scrolling works
    const scrollToBottom = () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // Test scrolling after a delay
    setTimeout(scrollToBottom, 500);
    setTimeout(scrollToTop, 1500);

    // Also notify parent about content height
    this.postMessageToParent({
      type: 'CONTENT_HEIGHT',
      height: document.body.scrollHeight,
      viewportHeight: window.innerHeight
    });
  }

  private fixScrollableElements(): void {
    // Find all elements that should be scrollable and fix their scrolling
    const scrollableSelectors = [
      '[data-rn-root]',
      '.main-content',
      '.screen-container',
      '.content-container',
      '[class*="ScrollView"]',
      '.card-content',
      'body',
      'html',
      '#root'
    ];

    scrollableSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.overflowY = 'auto';
          element.style.overflowX = 'hidden';
          element.style.height = 'auto';
          element.style.minHeight = '100vh';
          (element.style as any).webkitOverflowScrolling = 'touch';
          element.style.display = 'block';
        }
      });
    });

    // Also fix any dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (scrollableSelectors.some(selector => node.matches(selector))) {
              node.style.overflowY = 'auto';
              node.style.overflowX = 'hidden';
              node.style.height = 'auto';
              node.style.minHeight = '100vh';
              (node.style as any).webkitOverflowScrolling = 'touch';
              node.style.display = 'block';
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Force apply styles to all div elements
    setTimeout(() => {
      const allDivs = document.querySelectorAll('div');
      allDivs.forEach(div => {
        if (div instanceof HTMLElement) {
          // Only apply if the div has content that might need scrolling
          if (div.scrollHeight > div.clientHeight || div.children.length > 0) {
            div.style.overflowY = 'auto';
            div.style.overflowX = 'hidden';
            (div.style as any).webkitOverflowScrolling = 'touch';
          }
        }
      });
    }, 1000);

    // Apply fixes repeatedly to catch any missed elements
    const applyFixes = () => {
      // Force body and html scrolling
      if (document.body) {
        document.body.style.overflowY = 'auto';
        document.body.style.overflowX = 'hidden';
        document.body.style.height = 'auto';
        document.body.style.minHeight = '100vh';
        (document.body.style as any).webkitOverflowScrolling = 'touch';
      }

      if (document.documentElement) {
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.height = 'auto';
        document.documentElement.style.minHeight = '100vh';
        (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
      }

      // Fix React Native Web root
      const rnRoot = document.querySelector('[data-rn-root]');
      if (rnRoot instanceof HTMLElement) {
        rnRoot.style.overflowY = 'auto';
        rnRoot.style.overflowX = 'hidden';
        rnRoot.style.height = 'auto';
        rnRoot.style.minHeight = '100vh';
        (rnRoot.style as any).webkitOverflowScrolling = 'touch';
        rnRoot.style.display = 'block';
      }

      // Fix main app container
      const mainContainer = document.querySelector('[data-rn-root] > div');
      if (mainContainer instanceof HTMLElement) {
        mainContainer.style.overflowY = 'auto';
        mainContainer.style.overflowX = 'hidden';
        mainContainer.style.height = 'auto';
        mainContainer.style.minHeight = '100vh';
        (mainContainer.style as any).webkitOverflowScrolling = 'touch';
        mainContainer.style.display = 'block';
        mainContainer.style.flex = '1';
      }
    };

    // Apply fixes immediately and then repeatedly
    applyFixes();
    setTimeout(applyFixes, 500);
    setTimeout(applyFixes, 1000);
    setTimeout(applyFixes, 2000);
    setTimeout(applyFixes, 5000);

    // Also apply fixes on window resize and scroll events
    window.addEventListener('resize', applyFixes);
    window.addEventListener('scroll', applyFixes);
  }

  private fixTouchEvents(): void {
    // Ensure touch events work properly in iframe
    document.addEventListener('touchstart', (event) => {
      // Prevent default only if needed
      if (event.target instanceof HTMLElement) {
        const tagName = event.target.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
          return; // Allow default behavior for form elements
        }
      }
    }, { passive: true });

    // Fix for iOS Safari iframe scrolling
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
    }
  }

  private observeHeightChanges(): void {
    // Observe changes in document height and notify parent
    let lastHeight = document.body.scrollHeight;
    
    const observer = new ResizeObserver(() => {
      const currentHeight = document.body.scrollHeight;
      if (currentHeight !== lastHeight) {
        lastHeight = currentHeight;
        this.postMessageToParent({
          type: 'HEIGHT_CHANGE',
          height: currentHeight
        });
      }
    });

    observer.observe(document.body);
  }

  private updateTheme(theme: any): void {
    // Handle theme updates from parent
    console.log('Theme update received:', theme);
  }

  private handleExternalResize(width: number, height: number): void {
    this.config.viewportWidth = width;
    this.config.viewportHeight = height;
    this.optimizeForViewport();
  }

  public getConfig(): IframeConfig {
    return this.config;
  }

  public isInIframe(): boolean {
    return this.config.isInIframe;
  }

  public toggleMobileSidebar(): void {
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.mobile-menu-overlay');
      
      if (sidebar && overlay) {
        const isOpen = sidebar.classList.contains('mobile-open');
        if (isOpen) {
          sidebar.classList.remove('mobile-open');
          overlay.classList.remove('active');
        } else {
          sidebar.classList.add('mobile-open');
          overlay.classList.add('active');
        }
      }
    }
  }

  public optimizeFormInputs(): void {
    // Optimize form inputs for iframe environment
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input instanceof HTMLElement) {
        input.style.fontSize = '16px'; // Prevent zoom on iOS
        input.style.transform = 'translateZ(0)'; // Force hardware acceleration
      }
    });
  }
}

// Create singleton instance
const iframeManager = new IframeManager();

// Export utility functions
export const isInIframe = () => iframeManager.isInIframe();
export const getIframeConfig = () => iframeManager.getConfig();
export const toggleMobileSidebar = () => iframeManager.toggleMobileSidebar();
export const optimizeFormInputs = () => iframeManager.optimizeFormInputs(); 