// Link-in-bio site JavaScript
// Handles share functionality, QR code generation, and analytics

(function() {
  'use strict';

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
            title: 'Saloni Gandhi — Links',
            text: 'Connect with Saloni Gandhi - Frontend Engineer',
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
        document.execCommand('copy');
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

  // QR Code functionality
  function initQRCode() {
    const qrBtn = document.getElementById('qrBtn');
    const modal = document.getElementById('qrModal');
    const closeBtn = document.getElementById('closeModal');
    const downloadBtn = document.getElementById('downloadQR');
    const qrContainer = document.getElementById('qrcode');

    if (!qrBtn || !modal || !closeBtn || !downloadBtn || !qrContainer) return;

    let qrCodeInstance = null;

    // Generate QR code - Simple and reliable approach
    function generateQR() {
      // Clear previous QR code
      qrContainer.innerHTML = '';
      
      const url = window.location.href;
      
      // Show loading state
      qrContainer.innerHTML = '<div style="padding: 2rem; color: var(--text-color);">Generating QR Code...</div>';
      
      // Use QR Server API - most reliable method
      const qrImg = document.createElement('img');
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // QR Server API with color customization
      const bgColor = isDark ? '000000' : 'ffffff';
      const fgColor = isDark ? 'ffffff' : '000000';
      
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=${bgColor}&color=${fgColor}&data=${encodeURIComponent(url)}`;
      qrImg.alt = 'QR Code for ' + url;
      qrImg.style.cssText = `
        border-radius: 1rem;
        box-shadow: 0 4px 16px var(--shadow-color);
        max-width: 200px;
        height: auto;
        display: block;
      `;
      
      qrImg.onload = () => {
        qrContainer.innerHTML = '';
        qrContainer.appendChild(qrImg);
        qrCodeInstance = qrImg;
        console.log('✅ QR Code generated successfully');
      };
      
      qrImg.onerror = () => {
        // Fallback: Try without color customization
        const fallbackImg = document.createElement('img');
        fallbackImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
        fallbackImg.alt = 'QR Code for ' + url;
        fallbackImg.style.cssText = qrImg.style.cssText;
        
        fallbackImg.onload = () => {
          qrContainer.innerHTML = '';
          qrContainer.appendChild(fallbackImg);
          qrCodeInstance = fallbackImg;
          console.log('✅ QR Code generated (fallback)');
        };
        
        fallbackImg.onerror = () => {
          // Final fallback - show URL as text with copy button
          qrContainer.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-color);">
              <p style="margin-bottom: 1rem; font-weight: 500;">QR Code Service Unavailable</p>
              <p style="font-size: 0.875rem; margin-bottom: 1rem;">Share this URL instead:</p>
              <div style="background: var(--hover-bg); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                <p style="font-size: 0.875rem; word-break: break-all; font-family: monospace;">${url}</p>
              </div>
              <button onclick="navigator.clipboard.writeText('${url}').then(() => alert('URL copied!'))" 
                      style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                Copy URL
              </button>
            </div>
          `;
          console.warn('❌ QR Code generation failed, showing URL fallback');
        };
      };
    }

    // Show modal
    function showModal() {
      generateQR();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      
      // Focus trap
      const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      firstElement?.focus();
      
      // Trap focus within modal
      modal.addEventListener('keydown', handleModalKeydown);
      
      function handleModalKeydown(e) {
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
    }

    // Hide modal
    function hideModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      modal.removeEventListener('keydown', handleModalKeydown);
      qrBtn.focus(); // Return focus to trigger button
    }

    // Download QR code as PNG
    function downloadQR() {
      if (!qrCodeInstance || qrCodeInstance.tagName !== 'IMG') {
        showToast('No QR code available to download');
        return;
      }
      
      try {
        // Create a canvas to convert the image to downloadable format
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = qrCodeInstance.naturalWidth || 200;
        canvas.height = qrCodeInstance.naturalHeight || 200;
        
        // Draw the QR code image onto canvas
        ctx.drawImage(qrCodeInstance, 0, 0);
        
        // Convert to data URL and download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'saloni-gandhi-qr-code.png';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('💾 QR Code downloaded successfully');
        showToast('QR Code downloaded!');
      } catch (err) {
        console.error('Failed to download QR code:', err);
        
        // Fallback: try direct image download
        try {
          const link = document.createElement('a');
          link.download = 'saloni-gandhi-qr-code.png';
          link.href = qrCodeInstance.src;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          showToast('QR Code opened in new tab');
        } catch (fallbackErr) {
          showToast('Download failed. Right-click the QR code to save.');
        }
      }
    }

    // Event listeners
    qrBtn.addEventListener('click', showModal);
    closeBtn.addEventListener('click', hideModal);
    downloadBtn.addEventListener('click', downloadQR);

    // Close modal on escape key or backdrop click
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        hideModal();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal();
      }
    });
  }

  // Link analytics
  function initLinkAnalytics() {
    const links = document.querySelectorAll('[data-link]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
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

  // Progressive enhancement check
  function checkJavaScriptSupport() {
    // Add a class to indicate JS is working
    document.documentElement.classList.add('js-enabled');
    
    // Log successful initialization
    console.log('🚀 Link-in-bio site initialized');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🌐 URL:', window.location.href);
  }

  // Initialize everything when DOM is ready
  function init() {
    checkJavaScriptSupport();
    initShareButton();
    initQRCode();
    initLinkAnalytics();
    initKeyboardNavigation();
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle QR library loading errors
  window.addEventListener('error', (e) => {
    if (e.filename && e.filename.includes('qrcode')) {
      console.warn('QR Code library failed to load. QR functionality will be limited.');
    }
  });

})();
