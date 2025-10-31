// Digital Business Card Script
(function() {
  'use strict';

  // Generate QR Code on page load
  function generateQRCode() {
    const qrcodeContainer = document.getElementById('qrcode');
    if (!qrcodeContainer) return;

    // Clear any existing QR code
    qrcodeContainer.innerHTML = '';

    // Generate QR code pointing to your bio page (purple color to match theme)
    new QRCode(qrcodeContainer, {
      text: 'https://saloni111.github.io/Bio/',
      width: 220,
      height: 220,
      colorDark: '#7c3aed',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    console.log('✅ QR Code generated successfully');
  }

  // Initialize when DOM is ready
  function init() {
    // Wait a bit for QRCode library to load
    setTimeout(generateQRCode, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

