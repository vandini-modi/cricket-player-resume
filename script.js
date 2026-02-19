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

  // simple fetcher for small text files
  async function fetchText(path){
    try{
      const res = await fetch(path, { cache: 'no-cache' });
      if(!res.ok) throw new Error('fetch failed');
      return (await res.text()).trim();
    }catch(err){
      console.warn('fetchText failed', path, err);
      return null;
    }
  }

  // parse DOB like "24 November 2006" into age
  function ageFromDobString(dobStr){
    if(!dobStr) return null;
    let d = new Date(dobStr);
    if(isNaN(d)){
      const parts = dobStr.replace(/,+/g,'').split(/\s+/);
      if(parts.length >= 3){
        const day = parts[0].replace(/\D/g,'');
        const month = parts[1];
        const year = parts.slice(2).join(' ');
        d = new Date(`${month} ${day}, ${year}`);
      }
    }
    if(isNaN(d)) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if(m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age;
  }

  // populate contact items from data-file attributes
  async function initContactFromAssets(){
    const items = document.querySelectorAll('.contact .item');
    let dobText = null;
    for(const item of items){
      const file = item.dataset.file;
      const key = item.dataset.key;
      const span = item.querySelector('span');
      if(!span) continue;
      if(file){
        const text = await fetchText(file);
        if(text) span.textContent = text;
        // remember dob to compute age later
        if(key === 'dob') dobText = text || span.textContent;
      }
    }
    // compute & set age if DOB found
    const ageSpan = document.querySelector('.contact .item[data-key="age"] [data-age]');
    if(dobText && ageSpan){
      const computed = ageFromDobString(dobText);
      if(computed !== null) ageSpan.textContent = String(computed);
    }
    // init WhatsApp (after phone is populated)
    initWhatsApp();
  }

  // create WhatsApp chip using phone text (sanitizes digits)
  function sanitizeDigits(s){ return (s||'').replace(/\D/g,''); }
  function initWhatsApp(){
    const phoneItem = document.querySelector('.contact .item[data-key="phone"]');
    if(!phoneItem) return;
    if(phoneItem.querySelector('a.whatsapp-link')) return;
    const span = phoneItem.querySelector('span');
    const digits = sanitizeDigits(span ? span.textContent : '');
    if(!digits) return;
    const a = document.createElement('a');
    a.className = 'chip whatsapp-link';
    a.href = `https://wa.me/${digits}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'WhatsApp';
    a.style.marginLeft = '8px';
    phoneItem.appendChild(a);
  }

  // existing inits...
  document.addEventListener('DOMContentLoaded', function () {
    // existing initializers...
    initContactFromAssets();
  });
})();
