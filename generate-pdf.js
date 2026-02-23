const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const fileUrl = 'file:///Users/vmodi/Documents/Github/cricket-player-resume-master/index.html';
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Print CSS: reduce spacing, font-size, hide large visuals but keep color for key items
    const printOverrides = `
      @media print {
        :root{ -webkit-print-color-adjust: exact; color-adjust: exact; }
        /* tighten typography */
        body { font-size: 11px !important; line-height:1.15 !important; }
        .name h1 { font-size:16px !important; }
        .muted { font-size:10px !important; }

        /* reduce paddings / gaps */
        .container { padding:8px !important; max-width:800px; margin:0 auto !important; }
        .sidebar { padding:8px !important; }
        .profile { gap:8px !important; }
        .avatar { width:56px !important; height:56px !important; }
        .chip, .link-chip { padding:6px 8px !important; font-size:11px !important; }
        .contact .item { gap:6px !important; }

        /* reduce card spacing */
        section.card, .hl-card { padding:8px !important; margin-top:8px !important; }
        .stat { padding:8px !important; }

        /* remove heavy shadows / borders that print as boxes, keep colours */
        .container, .card, .hl-card, .stat, .avatar, .link-chip, .chip { box-shadow:none !important; border:none !important; background:transparent !important; }
        .chip.avail { background:transparent !important; color: var(--accent-4) !important; font-weight:700 !important; }

        /* keep links visible */
        a, .link-chip { color: var(--accent-1) !important; text-decoration: underline !important; }

        /* hide very large elements if needed (uncomment to save space) */
        /* .highlights { display:none !important; } */

        /* make sure cards don't force extra pages */
        .cards, .highlights { page-break-inside: avoid; }
      }
    `;
    await page.addStyleTag({ content: printOverrides });

    // shorter header (not the full file:// path)
    const headerText = 'Dhyey Modi — cricket-player-resume-master';
    const header = `<div></div>`;

    const footer = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#444;padding:4px 8px;width:100%;display:flex;justify-content:space-between;">
        <span>Generated: ${new Date().toLocaleDateString()}</span>
        <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`;

    // Produce a single-page PDF by tightening margins and applying a scale.
    // Adjust scale downward if still overflowing (0.7-0.9).
    await page.pdf({
      path: '/Users/vmodi/Downloads/dhyey-modi-resume-onepage.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '28px', bottom: '28px', left: '12px', right: '12px' },
      displayHeaderFooter: true,
      headerTemplate: header, // empty header
      footerTemplate: footer,
      scale: 0.78,
      preferCSSPageSize: true
    });

    await browser.close();
    console.log('PDF saved to /Users/vmodi/Downloads/dhyey-modi-resume-onepage.pdf');
  } catch (err) {
    console.error('Error generating PDF:', err);
    process.exit(1);
  }
})();
