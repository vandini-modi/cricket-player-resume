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

  async function fetchText(path){
    try{
      const res = await fetch(path, { cache: 'no-cache' });
      if(!res.ok) throw new Error(`${path} fetch ${res.status}`);
      return (await res.text()).trim();
    }catch(e){
      console.warn('fetchText error', path, e);
      return null;
    }
  }

  function ageFromDobString(dobStr){
    if(!dobStr) return null;
    let d = new Date(dobStr);
    if(isNaN(d)){
      const parts = dobStr.replace(/,+/g,'').split(/\s+/).filter(Boolean);
      if(parts.length >= 3){
        const day = parts[0].replace(/\D/g,''), month = parts[1], year = parts.slice(2).join(' ');
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

  function sanitizeDigits(s){ return (s||'').replace(/\D/g,''); }

  function addWhatsAppChip(phoneItem){
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

  async function initContactFromAssets(){
    const items = Array.from(document.querySelectorAll('.contact .item'));
    let dobText = null;
    for(const item of items){
      const file = item.dataset.file;
      const key = item.dataset.key;
      const span = item.querySelector('span');
      if(!span) continue;
      if(file){
        const text = await fetchText(file);
        if(text) span.textContent = text;
        if(key === 'dob') dobText = text || span.textContent;
      }
    }
    const ageSpan = document.querySelector('.contact .item[data-key="age"] [data-age]');
    if(dobText && ageSpan){
      const computed = ageFromDobString(dobText);
      if(computed !== null) ageSpan.textContent = String(computed);
    }
    const phoneItem = document.querySelector('.contact .item[data-key="phone"]');
    addWhatsAppChip(phoneItem);
  }
/*
    async function loadProfileText(){
        const container = document.getElementById('profile-summary');
        if(!container) return;
        container.innerHTML = '<span aria-hidden="true" style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--accent-1);margin-right:8px;vertical-align:middle;animation:spin 900ms linear infinite;"></span>Loading profile…';
        const timeout = setTimeout(()=>{
            if(container && container.textContent && container.textContent.includes('Loading')) container.textContent = 'Profile is taking longer than expected.';
        }, 6000);
        try{
            const text = await fetchText('assets/profile.txt');
            clearTimeout(timeout);
            if(!text) throw new Error('empty profile');
            const paras = text.split(/\n{2,}/).map(p=>p.trim()).filter(Boolean);
            container.innerHTML = paras.map(p=>`<p style="margin:0 0 10px;font-size:14px;color:#0b1220;line-height:1.5">${escapeHtml(p)}</p>`).join('');
        }catch(e){
            console.warn('loadProfileText', e);
            container.textContent = 'Profile information is currently unavailable.';
        }
    }
*/

  function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  document.addEventListener('DOMContentLoaded', () => {
  // Local profile data (use the numbers you provided)
  const profilesData = {
    "301505": {
      url: "https://cricheroes.com/player-profile/301505/Dhyey-Parag-Modi/",
      stats: { matches: 140, runs: 1631, wickets: 235 },
      highlights: [] // keep empty (no hard-coded highlights)
    },
    "9476612": {
      url: "https://cricheroes.com/player-profile/9476612/dhyey-parag-modi/",
      stats: { matches: 8, runs: 284, wickets: 22 },
      highlights: [] // keep empty
    }
  };

  // Fill the per-profile stat cards
  Object.keys(profilesData).forEach(id => {
    const p = profilesData[id];
    document.querySelectorAll(`.stat[data-stat-for="${id}"]`).forEach(el => {
      const key = el.dataset.key;
      const val = (p.stats && p.stats[key] != null) ? p.stats[key] : '—';
      const num = el.querySelector('.num');
      if (num) num.textContent = val;
    });
  });

  // Update the top summary cards to reflect primary profile (301505)
  const primary = profilesData['301505'];
  if (primary) {
    const summaryNums = document.querySelectorAll('.cards .stat .num');
    // order in HTML is Matches, Wickets, Runs — map accordingly
    if (summaryNums && summaryNums.length >= 3) {
      summaryNums[0].textContent = primary.stats.matches;
      summaryNums[1].textContent = primary.stats.wickets;
      summaryNums[2].textContent = primary.stats.runs;
    }
  }

  // Hook up profile link-chips and primary open button
  const chips = document.querySelectorAll('.link-chip[data-id]');
  const openBtn = document.getElementById('open-selected');
  let selectedId = '301505';

  function setSelected(id){
    selectedId = id;
    chips.forEach(c => c.classList.toggle('active', c.dataset.id === id));
    openBtn.dataset.url = profilesData[id]?.url || '';
  }

  chips.forEach(ch => {
    ch.addEventListener('click', (e) => {
      const id = ch.dataset.id;
      setSelected(id);
    });
  });

  openBtn.addEventListener('click', () => {
    const url = openBtn.dataset.url || profilesData[selectedId]?.url;
    if (url) window.open(url, '_blank', 'noopener');
  });

  // initialize selection
  setSelected(selectedId);

  // expose data for quick updates via console if needed
  window.__profilesData = profilesData;
});

  // inject spinner keyframes if missing
  (function injectSpin(){
    if(document.getElementById('spin-keyframes')) return;
    const s = document.createElement('style'); s.id='spin-keyframes';
    s.textContent='@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  })();

})();
