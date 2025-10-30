// Link-in-bio site JavaScript
// Handles share functionality, QR code generation, and analytics

(function () {
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

  // QR Code functionality
  function initQRCode() {
    const qrBtn = document.getElementById('qrBtn');
    const linkedinQrBtn = document.getElementById('linkedinQrBtn');
    const modal = document.getElementById('qrModal');
    const linkedinModal = document.getElementById('linkedinQrModal');
    const closeBtn = document.getElementById('closeModal');
    const closeLinkedinBtn = document.getElementById('closeLinkedinModal');
    const downloadBtn = document.getElementById('downloadQR');
    const downloadLinkedinBtn = document.getElementById('downloadLinkedinQR');
    const printBtn = document.getElementById('printQR');
    const qrContainer = document.getElementById('qrcode');
    const linkedinQrContainer = document.getElementById('linkedinQrcode');

    if (!qrBtn || !modal || !closeBtn || !downloadBtn || !qrContainer) return;

    let qrCodeInstance = null;
    let linkedinQrCodeInstance = null;

    // Generate QR code - Simple and reliable approach
    function generateQR(container, url, instance) {
      // Clear previous QR code
      container.innerHTML = '';

      // Show loading state
      container.innerHTML = '<div style="padding: 2rem; color: var(--text-color);">Generating QR Code...</div>';

      // Use QR Server API - most reliable method
      const qrImg = document.createElement('img');
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      // QR Server API with color customization
      const bgColor = isDark ? '000000' : 'ffffff';
      const fgColor = isDark ? 'ffffff' : '000000';

      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&bgcolor=${bgColor}&color=${fgColor}&data=${encodeURIComponent(url)}`;
      qrImg.alt = 'QR Code for ' + url;
      qrImg.style.cssText = `
        border-radius: 1rem;
        box-shadow: 0 4px 16px var(--shadow-color);
        max-width: 250px;
        height: auto;
        display: block;
      `;

      qrImg.onload = () => {
        container.innerHTML = '';
        container.appendChild(qrImg);
        if (container === qrContainer) {
          qrCodeInstance = qrImg;
        } else {
          linkedinQrCodeInstance = qrImg;
        }
        console.log('✅ QR Code generated successfully');
      };

      qrImg.onerror = () => {
        // Fallback: Try without color customization
        const fallbackImg = document.createElement('img');
        fallbackImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(url)}`;
        fallbackImg.alt = 'QR Code for ' + url;
        fallbackImg.style.cssText = qrImg.style.cssText;

        fallbackImg.onload = () => {
          container.innerHTML = '';
          container.appendChild(fallbackImg);
          if (container === qrContainer) {
            qrCodeInstance = fallbackImg;
          } else {
            linkedinQrCodeInstance = fallbackImg;
          }
          console.log('✅ QR Code generated (fallback)');
        };

        fallbackImg.onerror = () => {
          // Final fallback - show URL as text with copy button
          container.innerHTML = `
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

    // Show main QR modal
    function showModal() {
      const url = window.location.href;
      generateQR(qrContainer, url);
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      
      // Update URL display
      const urlDisplay = document.getElementById('qrUrl');
      if (urlDisplay) {
        urlDisplay.textContent = url.replace('https://', '').replace('http://', '');
      }

      setupModalFocus(modal, qrBtn);
    }

    // Show LinkedIn QR modal
    function showLinkedinModal() {
      if (!linkedinModal || !linkedinQrContainer) return;
      
      const linkedinUrl = 'https://www.linkedin.com/in/saloni-gandhi-8a3b401b2/';
      generateQR(linkedinQrContainer, linkedinUrl);
      linkedinModal.classList.add('active');
      linkedinModal.setAttribute('aria-hidden', 'false');

      setupModalFocus(linkedinModal, linkedinQrBtn);
    }

    // Setup modal focus trap
    function setupModalFocus(modalElement, returnButton) {
      const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement?.focus();

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

      modalElement.addEventListener('keydown', handleModalKeydown);
      modalElement._handleModalKeydown = handleModalKeydown;
    }

    // Hide modal
    function hideModal(modalElement, returnButton) {
      modalElement.classList.remove('active');
      modalElement.setAttribute('aria-hidden', 'true');
      if (modalElement._handleModalKeydown) {
        modalElement.removeEventListener('keydown', modalElement._handleModalKeydown);
        delete modalElement._handleModalKeydown;
      }
      returnButton?.focus();
    }

    // Download QR code as PNG
    function downloadQR(instance, filename) {
      if (!instance || instance.tagName !== 'IMG') {
        showToast('No QR code available to download');
        return;
      }

      try {
        // Create a canvas to convert the image to downloadable format
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = instance.naturalWidth || 250;
        canvas.height = instance.naturalHeight || 250;

        // Draw the QR code image onto canvas
        ctx.drawImage(instance, 0, 0);

        // Convert to data URL and download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('💾 QR Code downloaded successfully');
        showToast('QR Code downloaded for printing!');
      } catch (err) {
        console.error('Failed to download QR code:', err);

        // Fallback: try direct image download
        try {
          const link = document.createElement('a');
          link.download = filename;
          link.href = instance.src;
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

    // Print QR code
    function printQR() {
      if (!qrCodeInstance) {
        showToast('No QR code available to print');
        return;
      }

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Saloni Gandhi - QR Code for Badge</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              .qr-container {
                display: inline-block;
                border: 2px solid #2563eb;
                border-radius: 15px;
                padding: 20px;
                margin: 10px;
                background: white;
              }
              .qr-label {
                font-size: 14px;
                font-weight: bold;
                color: #2563eb;
                margin-bottom: 10px;
              }
              .qr-subtitle {
                font-size: 12px;
                color: #666;
                margin-top: 10px;
              }
              img {
                display: block;
                margin: 0 auto;
              }
              @media print {
                body { margin: 0; }
                .qr-container { 
                  page-break-inside: avoid;
                  border: 2px solid #000;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="qr-label">👋 Scan to see my projects!</div>
              <img src="${qrCodeInstance.src}" alt="QR Code" style="width: 200px; height: 200px;">
              <div class="qr-subtitle">Saloni Gandhi - Software Engineer</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }

    // Event listeners
    qrBtn.addEventListener('click', showModal);
    closeBtn.addEventListener('click', () => hideModal(modal, qrBtn));
    downloadBtn.addEventListener('click', () => downloadQR(qrCodeInstance, 'saloni-gandhi-badge-qr.png'));
    
    if (printBtn) {
      printBtn.addEventListener('click', printQR);
    }

    if (linkedinQrBtn) {
      linkedinQrBtn.addEventListener('click', showLinkedinModal);
    }

    if (closeLinkedinBtn) {
      closeLinkedinBtn.addEventListener('click', () => hideModal(linkedinModal, linkedinQrBtn));
    }

    if (downloadLinkedinBtn) {
      downloadLinkedinBtn.addEventListener('click', () => downloadQR(linkedinQrCodeInstance, 'saloni-gandhi-linkedin-qr.png'));
    }

    // Close modal on escape key or backdrop click
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (modal.classList.contains('active')) {
          hideModal(modal, qrBtn);
        }
        if (linkedinModal && linkedinModal.classList.contains('active')) {
          hideModal(linkedinModal, linkedinQrBtn);
        }
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideModal(modal, qrBtn);
      }
    });

    if (linkedinModal) {
      linkedinModal.addEventListener('click', (e) => {
        if (e.target === linkedinModal) {
          hideModal(linkedinModal, linkedinQrBtn);
        }
      });
    }
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
    initShareButton();
    initQRCode();
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