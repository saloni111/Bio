// Link-in-bio site JavaScript
// Handles share functionality, QR code generation, and analytics

(function () {
  'use strict';

  // Link section ID constant for email capture scroll
  const LINK_SECTION_ID = 'links-root';
  
  // Uniform auto-fit scaling system
  const INNER_ID = 'fit-inner';
  const MIN_SCALE = 0.85;          // never scale below this
  const BREATH = 8;                // breathing room (px)

  function vh() { 
    return Math.max(1, window.innerHeight || document.documentElement.clientHeight); 
  }

  function fit() {
    const el = document.getElementById(INNER_ID);
    if (!el) return;
    
    el.style.transform = 'scale(1)';
    const need = el.getBoundingClientRect().height + BREATH;
    const avail = vh();
    const s = Math.min(1, Math.max(MIN_SCALE, avail / need));
    el.style.transform = `scale(${s})`;
    
    console.log('🎯 Uniform fit:', { need, avail, scale: s });
  }

  let t;
  const deb = fn => { clearTimeout(t); t = setTimeout(fn, 100); };

  // Analytics logger - logs clicks to console
  function logLinkClick(linkType) {
    const timestamp = new Date().toISOString();
    const analytics = {
      event: 'link_click',
      link: linkType,
      timestamp: timestamp,
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    console.log('📊 Link Analytics:', analytics);
  }

  // Share functionality
  function initShareButton() {
    const shareBtn = document.getElementById('shareBtn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', async () => {
      const url = window.location.href;

      // Try native Web Share API first (mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Saloni Gandhi — Software Engineer',
            text: 'Connect with Saloni Gandhi - Software Engineer, AI & Cloud Enthusiast',
            url: url
          });
          console.log('📤 Shared via Web Share API');
          return;
        } catch (err) {
          // User cancelled or error occurred, fall back to clipboard
        }
      }

      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!');
        console.log('📋 Link copied to clipboard');
      } catch (err) {
        // Final fallback - select text method
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (execErr) {
          console.warn('Copy command failed');
        }
        document.body.removeChild(textArea);
        showToast('Link copied to clipboard!');
        console.log('📋 Link copied to clipboard (fallback)');
      }
    });
  }

  // Toast notification
  function showToast(message) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 5rem;
      right: 1rem;
      background: var(--primary-color);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
      z-index: 1001;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }



  // Resume Modal functionality
  function initResumeModal() {
    const modal = document.getElementById('resumeModal');
    const closeBtn = document.getElementById('closeResumeModal');
    const iframe = document.getElementById('resumeFrame');
    const resumeBtn = document.getElementById('resumeButton');

    if (!modal || !closeBtn || !iframe || !resumeBtn) {
      console.error('❌ Resume modal elements not found');
      return;
    }

    // Close modal function
    function hideResumeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      iframe.src = ''; // Stop loading PDF when closed
      if (modal._handleResumeKeydown) {
        modal.removeEventListener('keydown', modal._handleResumeKeydown);
        delete modal._handleResumeKeydown;
      }
    }

    // Function to open resume modal
    function openResumeModal() {
      console.log('🔍 Opening resume modal...');

      if (!modal || !iframe) {
        console.error('❌ Resume modal elements not found');
        return;
      }

      // Use Google Docs viewer for reliable PDF display
      iframe.src = 'https://docs.google.com/viewer?url=https://saloni111.github.io/Bio/SaloniGandhi.pdf&embedded=true';

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');

      // Focus trap
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement?.focus();

      function handleResumeKeydown(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        }
      }

      modal.addEventListener('keydown', handleResumeKeydown);
      modal._handleResumeKeydown = handleResumeKeydown; // Store reference for cleanup

      // Log analytics
      logLinkClick('resume');
      console.log('✅ Resume modal opened successfully');
    }

    // Event listeners
    resumeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔍 Resume button clicked');
      openResumeModal();
    });

    closeBtn.addEventListener('click', hideResumeModal);

    // Close on escape key or backdrop click
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        hideResumeModal();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideResumeModal();
      }
    });
  }

  // Link analytics
  function initLinkAnalytics() {
    const links = document.querySelectorAll('[data-link]');

    links.forEach(link => {
      link.addEventListener('click', () => {
        const linkType = link.getAttribute('data-link');
        logLinkClick(linkType);
      });
    });
  }

  // Keyboard navigation enhancements
  function initKeyboardNavigation() {
    // Add keyboard support for custom buttons
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target;
        if (target.tagName === 'BUTTON' && !target.disabled) {
          e.preventDefault();
          target.click();
        }
      }
    });
  }

  // Email Capture Form Handling
  function scrollToLinks() {
    const linksSection = document.getElementById(LINK_SECTION_ID);
    if (linksSection) {
      linksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function initEmailCapture() {
    const form = document.getElementById('emailCaptureForm');
    const successMessage = document.getElementById('emailSuccessMessage');
    const emailInput = document.getElementById('emailInput');

    if (!form) return;

    // Handle form submission
    form.addEventListener('submit', (e) => {
      const email = emailInput.value.trim();
      // Simple validation - just check for @ symbol
      if (!email || !email.includes('@')) {
        e.preventDefault();
        alert('Please enter a valid email address');
        return;
      }

      const submitBtn = form.querySelector('.email-submit-btn');
      
      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      // Log the email capture
      console.log('📧 Email captured:', email, 'from source: ghc25-qr', 'at:', new Date().toISOString());
      
      // Show success message after a short delay (form will submit to Google Forms)
      setTimeout(() => {
        successMessage.style.display = 'block';
        form.style.display = 'none';
      }, 1000);
      
      // Form will submit naturally to Google Forms via the action attribute
      // The hidden iframe prevents page navigation
    });

    // Skip button removed from UI
  }

  // Progressive enhancement check
  function checkJavaScriptSupport() {
    // Add a class to indicate JS is working
    document.documentElement.classList.add('js-enabled');
    document.body.classList.add('js-enabled');

    // Ensure fade-in elements become visible
    setTimeout(() => {
      const fadeElements = document.querySelectorAll('.fade-in');
      fadeElements.forEach(element => {
        element.style.opacity = '1';
      });
    }, 100);

    // Log successful initialization
    console.log('🚀 Always-one-screen hero initialized');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🌐 URL:', window.location.href);
    console.log('📏 Viewport:', window.innerWidth + 'x' + window.innerHeight);
  }

  // Initialize everything when DOM is ready
  function init() {
    checkJavaScriptSupport();
    initEmailCapture();
    initShareButton();
    initResumeModal();
    initLinkAnalytics();
    initKeyboardNavigation();
    
    // Set up uniform auto-fit scaling
    window.addEventListener('load', fit, { once: true });
    window.addEventListener('resize', () => deb(fit));
    window.addEventListener('orientationchange', fit);
    window.addEventListener('focusin', () => setTimeout(fit, 300));
    window.addEventListener('focusout', () => setTimeout(fit, 300));
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();