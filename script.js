// script.js

// Smooth Scrolling
const smoothScrollTo = (target) => {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
};

// Dynamic Statistics
const updateStatistics = (element, value) => {
    const statElement = document.querySelector(element);
    statElement.textContent = value;
};

// Keyboard Navigation
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            smoothScrollTo('#section1');
            break;
        case 'ArrowDown':
            smoothScrollTo('#section2');
            break;
        // Add more cases for other sections
    }
});

// Example usage of updateStatistics
// updateStatistics('#stat1', '100'); // Call this to update statistics

(function(){
  'use strict';

  // helpers
  // sanitize digits only (returns string like "919876543210")
  function sanitizeDigits(s){ return (s||'').replace(/\D/g,''); }

  // age calculation (robust)
  function ageFromDobString(dobStr){
    if(!dobStr) return null;
    // try native parse first
    let d = new Date(dobStr);
    if (isNaN(d)) {
      // support "DD Month YYYY" or "DD Month, YYYY"
      const parts = dobStr.trim().replace(/,+/g, '').split(/\s+/);
      if (parts.length >= 3) {
        const day = parts[0].replace(/\D/g, '');
        const month = parts[1];
        const year = parts.slice(2).join(' ');
        d = new Date(`${month} ${day}, ${year}`);
      }
    }
    if (isNaN(d)) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }

  function initAgeFromDob() {
    const dobItem = document.querySelector('.contact .item[data-key="dob"]');
    const ageSpan = document.querySelector('.contact .item[data-key="age"] [data-age]');
    if (!dobItem || !ageSpan) return;
    const dobSpan = dobItem.querySelector('span');
    const dobText = dobSpan ? dobSpan.textContent.trim() : '';
    const computed = ageFromDobString(dobText);
    if (computed !== null) {
      ageSpan.textContent = String(computed);
    }
  }

  // fetch profile text and inject into #profile-summary
  function loadProfileText(){
    const container = document.getElementById('profile-summary');
    if(!container) return;
    fetch('assets/profile.txt', {cache: "no-cache"})
      .then(response => {
        if(!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(text => {
        // split into paragraphs on one-or-more blank lines
        const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
        container.innerHTML = paras.map(p => `<p style="margin:0 0 10px;font-size:14px;color:#0b1220;line-height:1.5">${escapeHtml(p)}</p>`).join('');
      })
      .catch(err => {
        console.warn('Failed to load profile.txt:', err);
        container.textContent = 'Profile information is currently unavailable.';
      });
  }

  // simple HTML escaper
  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // add WhatsApp quick-link next to phone item
  function initWhatsApp(){
    const phoneItem = document.querySelector('.contact .item[data-key="phone"]');
    if(!phoneItem) return;
    // avoid adding twice
    if(phoneItem.querySelector('a.whatsapp-link')) return;
    const span = phoneItem.querySelector('span');
    const digits = sanitizeDigits(span ? span.textContent : '');
    if(!digits) return;
    const a = document.createElement('a');
    a.href = `https://wa.me/${digits}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'chip whatsapp-link';
    a.style.marginLeft = '8px';
    a.textContent = 'WhatsApp';
    phoneItem.appendChild(a);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAgeFromDob();
    loadProfileText();
    initWhatsApp();
  });
})();
