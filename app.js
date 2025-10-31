// Link-in-bio site JavaScript
// Handles share functionality, QR code generation, and analytics

(function () {
  'use strict';

  // Link section ID constant for email capture scroll
  const LINK_SECTION_ID = 'links-root';
  
  // API endpoint configuration
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://your-backend-url.com'; // Replace with your deployed backend URL

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

  // Supabase Email Capture
  const SUPABASE_URL = 'https://nlyfkrytdyhphtczguip.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seWZrcnl0ZHlocGh0Y3pndWlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MDU0OTksImV4cCI6MjA3NzQ4MTQ5OX0.2uOyhG73EUeYp3N0zqYOogqx3g8qZRe2O70GkQNHmdo';

  // Initialize Supabase client
  let sb;
  function initSupabase() {
    try {
      if (typeof window.supabase !== 'undefined') {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase initialized');
      } else {
        console.log('⚠️ Supabase CDN not loaded, using fallback');
      }
    } catch (error) {
      console.log('⚠️ Supabase initialization failed:', error);
    }
  }

  // Toast notification for email success
  function toast(message) {
    const existingToast = document.querySelector('.email-toast');
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'email-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 5rem;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
      z-index: 1001;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Submit email to Supabase
  async function submitEmail() {
    const input = document.querySelector('#email');
    const email = input.value.trim();
    
    // Gentle validation - only check for @ symbol
    if (!email.includes('@')) return;

    const submitBtn = document.querySelector('#send-btn');
    const successMessage = document.getElementById('emailSuccessMessage');
    const form = document.getElementById('emailCaptureForm');
    
    // Update button state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const payload = {
      email: email.toLowerCase(),
      source: 'ghc25-smart-card',
      ua: navigator.userAgent
    };

    try {
      if (sb) {
        await sb.from('emails').insert(payload);
      }
      
      // Clear input and show success
      input.value = '';
      successMessage.style.display = 'block';
      form.style.display = 'none';
      toast('✨ Thanks for connecting — I\'ll share our GHC photo!');
      
      console.log('📧 Email captured:', email, 'from source: ghc25-smart-card', 'at:', new Date().toISOString());
      
    } catch (e) {
      console.log('retrying...', e);
      await new Promise(r => setTimeout(r, 400));
      try { 
        if (sb) {
          await sb.from('emails').insert(payload); 
        }
        // Still show success even if retry fails
        input.value = '';
        successMessage.style.display = 'block';
        form.style.display = 'none';
        toast('✨ Thanks for connecting — I\'ll share our GHC photo!');
      } catch (retryError) {
        console.log('Final retry failed, but showing success anyway');
        // Always show success to user
        input.value = '';
        successMessage.style.display = 'block';
        form.style.display = 'none';
        toast('✨ Thanks for connecting — I\'ll share our GHC photo!');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  function initEmailCapture() {
    const sendBtn = document.querySelector('#send-btn');
    const emailInput = document.querySelector('#email');
    
    if (!sendBtn || !emailInput) {
      console.log('⚠️ Email form elements not found');
      return;
    }

    console.log('✅ Email capture initialized');

    // Handle button click
    sendBtn.addEventListener('click', submitEmail);
    
    // Handle Enter key in input
    emailInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitEmail();
      }
    });

    // Ensure button is always clickable
    sendBtn.disabled = false;
    sendBtn.style.pointerEvents = 'auto';
    sendBtn.style.cursor = 'pointer';
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
    console.log('🚀 Link-in-bio site initialized');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🌐 URL:', window.location.href);
  }

  // Initialize everything when DOM is ready
  function init() {
    checkJavaScriptSupport();
    // Wait a bit for Supabase CDN to load
    setTimeout(() => {
      initSupabase();
      initEmailCapture();
    }, 100);
    initShareButton();
    initResumeModal();
    initLinkAnalytics();
    initKeyboardNavigation();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
