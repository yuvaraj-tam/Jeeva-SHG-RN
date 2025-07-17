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
    if (this.config.isInIframe) {
      // Apply iframe-specific optimizations
      this.applyIframeStyles();
      this.setupCommunication();
      this.handleResize();
      this.optimizeScrolling();
    }
  }

  private applyIframeStyles(): void {
    // Add iframe-mode class to body
    document.body.classList.add('iframe-mode');

    // Add dynamic styles for iframe optimization
    const styles = `
      .iframe-mode {
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden;
        min-height: 100vh;
      }

      .iframe-mode .sidebar {
        position: fixed;
        z-index: 1000;
        height: 100vh;
        overflow-y: auto;
      }

      .iframe-mode .main-content {
        transition: margin-left 0.3s ease;
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
      }

      /* Prevent horizontal scrolling in iframe */
      .iframe-mode * {
        max-width: 100% !important;
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
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
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

    window.addEventListener('wheel', (event) => {
      if (!isScrolling) {
        isScrolling = true;
        setTimeout(() => { isScrolling = false; }, 100);
        
        // Notify parent about scroll activity
        this.postMessageToParent({
          type: 'SCROLL_ACTIVITY',
          scrollTop: window.scrollY,
          scrollLeft: window.scrollX
        });
      }
    }, { passive: true });
  }

  private observeHeightChanges(): void {
    // Use ResizeObserver to monitor content height changes
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === document.body) {
            this.postMessageToParent({
              type: 'HEIGHT_CHANGE',
              height: entry.contentRect.height
            });
          }
        }
      });

      resizeObserver.observe(document.body);
    } else {
      // Fallback for browsers without ResizeObserver
      setInterval(() => {
        this.postMessageToParent({
          type: 'HEIGHT_CHANGE',
          height: document.body.scrollHeight
        });
      }, 1000);
    }
  }

  private updateTheme(theme: any): void {
    // Update app theme based on parent page
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
    document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
  }

  private handleExternalResize(width: number, height: number): void {
    // Handle resize events from parent
    this.config.viewportWidth = width;
    this.config.viewportHeight = height;
    this.optimizeForViewport();
  }

  // Public methods
  public getConfig(): IframeConfig {
    return { ...this.config };
  }

  public isInIframe(): boolean {
    return this.config.isInIframe;
  }

  public toggleMobileSidebar(): void {
    if (this.isInIframe() && this.config.viewportWidth < 768) {
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.mobile-menu-overlay');
      
      if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
      }
    }
  }

  public optimizeFormInputs(): void {
    // Optimize form inputs for iframe environment
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        // Scroll input into view for mobile keyboards
        if (this.config.viewportWidth < 768) {
          setTimeout(() => {
            (input as HTMLElement).scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }, 300);
        }
      });
    });
  }
}

// Create singleton instance
export const iframeManager = new IframeManager();

// Export utility functions
export const isInIframe = () => iframeManager.isInIframe();
export const getIframeConfig = () => iframeManager.getConfig();
export const toggleMobileSidebar = () => iframeManager.toggleMobileSidebar();
export const optimizeFormInputs = () => iframeManager.optimizeFormInputs(); 