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

(function () {
  'use strict';

  // fetch small text file, return trimmed text or null
  async function fetchText(path) {
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      return (await res.text()).trim();
    } catch (err) {
      console.warn('fetchText failed', path, err);
      return null;
    }
  }

  // robust DOB -> age parser
  function ageFromDobString(dobStr) {
    if (!dobStr) return null;
    let d = new Date(dobStr);
    if (isNaN(d)) {
      // try "DD Month YYYY" or similar
      const parts = dobStr.replace(/,+/g, '').split(/\s+/).filter(Boolean);
      if (parts.length >= 3) {
        const day = parts[0].replace(/\D/g, '');
        const month = parts[1];
        const year = parts.slice(2).join(' ');
        d = new Date(`${month} ${day}, ${year}`);
      }
    }
    if (isNaN(d)) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  }

  // keep only digits (used for wa.me)
  function sanitizeDigits(s) { return (s || '').replace(/\D/g, ''); }

  // add WhatsApp chip next to phone item (avoids duplicates)
  function addWhatsAppChip(phoneItem) {
    if (!phoneItem) return;
    if (phoneItem.querySelector('a.whatsapp-link')) return;
    const span = phoneItem.querySelector('span');
    const digits = sanitizeDigits(span ? span.textContent : '');
    if (!digits) return;
    const a = document.createElement('a');
    a.className = 'chip whatsapp-link';
    a.href = `https://wa.me/${digits}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'WhatsApp';
    a.style.marginLeft = '8px';
    phoneItem.appendChild(a);
  }

  // populate contact items that have data-file attributes
  async function initContactFromAssets() {
    const items = Array.from(document.querySelectorAll('.contact .item'));
    let dobText = null;
    for (const item of items) {
      const file = item.dataset.file;
      const key = item.dataset.key;
      const span = item.querySelector('span');
      if (!span) continue;
      if (file) {
        const text = await fetchText(file);
        if (text) span.textContent = text;
        // remember DOB for age computation
        if (key === 'dob') dobText = text || span.textContent;
      }
    }
    // compute age
    const ageSpan = document.querySelector('.contact .item[data-key="age"] [data-age]');
    if (dobText && ageSpan) {
      const computed = ageFromDobString(dobText);
      if (computed !== null) ageSpan.textContent = String(computed);
    }
    // add WhatsApp after phone populated
    const phoneItem = document.querySelector('.contact .item[data-key="phone"]');
    addWhatsAppChip(phoneItem);
  }

  // load profile text into #profile-summary with spinner + timeout
  async function loadProfileText() {
    const container = document.getElementById('profile-summary');
    if (!container) return;
    // spinner + initial message
    container.innerHTML = '<span aria-hidden="true" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--accent-1);margin-right:8px;vertical-align:middle;animation:spin 900ms linear infinite;"></span>Loading profile…';
    const timeoutId = setTimeout(() => {
      if (container && container.textContent && container.textContent.includes('Loading')) {
        container.textContent = 'Profile is taking longer than expected.';
      }
    }, 6000);

    try {
      const text = await fetchText('assets/profile.txt');
      clearTimeout(timeoutId);
      if (!text) throw new Error('empty profile');
      const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
      container.innerHTML = paras.map(p => `<p style="margin:0 0 10px;font-size:14px;color:#0b1220;line-height:1.5">${escapeHtml(p)}</p>`).join('');
    } catch (err) {
      console.warn('Failed to load profile.txt:', err);
      container.textContent = 'Profile information is currently unavailable.';
    }
  }

  // simple escaper
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // init everything
  document.addEventListener('DOMContentLoaded', function () {
    // sequentially populate contact + profile
    initContactFromAssets().catch(err => console.warn('initContactFromAssets', err));
    loadProfileText().catch(err => console.warn('loadProfileText', err));
  });

  // small keyframes injection for spinner (safe if style already exists)
  (function injectSpinKeyframes(){
    if (document.getElementById('spin-keyframes')) return;
    const style = document.createElement('style');
    style.id = 'spin-keyframes';
    style.textContent = '@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
    document.head.appendChild(style);
  })();

})();
