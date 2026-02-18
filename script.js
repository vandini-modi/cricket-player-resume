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
  function sanitizeDigits(s){ return (s||'').replace(/\D/g,''); }

  // age calculation (robust)
  function ageFromDobString(dobStr){
    if(!dobStr) return null;
    let d = new Date(dobStr);
    if(isNaN(d)){
      const parts = dobStr.trim().replace(/,+/g,'').split(/\s+/);
      if(parts.length >= 3){
        const day = parts[0].replace(/\D/g,''), month = parts[1], year = parts.slice(2).join(' ');
        d = new Date(`${month} ${day}, ${year}`);
      }
    }
    if(isNaN(d)) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  }

  // small UI niceties
  function highlightRow(row){
    row.style.transition = 'background 300ms, transform 300ms';
    row.style.background = 'linear-gradient(90deg, rgba(109,40,217,0.06), rgba(6,182,212,0.04))';
    row.style.transform = 'translateY(-2px)';
    setTimeout(()=>{ row.style.background=''; row.style.transform=''; }, 900);
  }

  function animateCounter(el, target, duration=900){
    const start = 0, range = target - start;
    let startTime = null;
    function step(ts){
      if(!startTime) startTime = ts;
      const progress = Math.min((ts - startTime)/duration, 1);
      el.textContent = Math.round(start + (range * progress));
      if(progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // feature initializers (loosely coupled, use data-key first)
  function initStats(){
    const statEls = document.querySelectorAll('.stat .num');
    const targets = [140,235,231];
    statEls.forEach((el,i)=> animateCounter(el, targets[i] || parseInt(el.textContent,10) || 0));
  }

  function initWhatsApp(){
    const phoneItem = document.querySelector('.contact .item[data-key="phone"]') ||
                      Array.from(document.querySelectorAll('.contact .item')).find(item=>{
                        const lbl = item.querySelector('strong'); return lbl && lbl.textContent.trim().toLowerCase() === 'phone';
                      });
    if(!phoneItem) return;
    const span = phoneItem.querySelector('span');
    const digits = sanitizeDigits(span ? span.textContent : '');
    if(!digits) return;
    const a = document.createElement('a');
    a.href = `https://wa.me/${digits}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'chip';
    a.style.marginLeft = '8px';
    a.textContent = 'WhatsApp';
    phoneItem.appendChild(a);
  }

  function initAgeFromDob(){
    const dobItem = document.querySelector('.contact .item[data-key="dob"]') ||
                    Array.from(document.querySelectorAll('.contact .item')).find(item=>{
                      const lbl = item.querySelector('strong'); return lbl && lbl.textContent.trim().toLowerCase() === 'dob';
                    });
    const ageItem = document.querySelector('.contact .item[data-key="age"]') ||
                    Array.from(document.querySelectorAll('.contact .item')).find(item=>{
                      const lbl = item.querySelector('strong'); return lbl && lbl.textContent.trim().toLowerCase() === 'age';
                    });
    if(!dobItem || !ageItem) return;
    const dobSpan = dobItem.querySelector('span');
    const ageSpan = ageItem.querySelector('span');
    const dobText = dobSpan ? dobSpan.textContent.trim() : '';
    const computed = ageFromDobString(dobText);
    if(computed !== null && ageSpan) ageSpan.textContent = computed;
  }

  // public init
  function initAll(){
    initStats();
    initWhatsApp();
    initAgeFromDob();
    // other initializers can be added here
  }

  document.addEventListener('DOMContentLoaded', initAll);
})();
