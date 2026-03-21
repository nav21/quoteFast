import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const __dirname = dirname(fileURLToPath(import.meta.url));

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function renderTemplate(templateName, data) {
  const templatePath = join(__dirname, '..', 'templates', `${templateName}.html`);
  let html = await readFile(templatePath, 'utf-8');

  // Handle loop blocks: {{#lineItems}}...{{/lineItems}}
  html = html.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, block) => {
    const arr = data[key];
    if (!Array.isArray(arr)) return '';
    return arr.map((item, index) => {
      let row = block;
      // Replace {{index}} with 1-based index
      row = row.replace(/\{\{index\}\}/g, String(index + 1));
      // Replace item-level placeholders
      for (const [k, v] of Object.entries(item)) {
        row = row.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v ?? ''));
      }
      return row;
    }).join('');
  });

  // Replace scalar placeholders
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'object' || value === null) {
      html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value ?? ''));
    }
  }

  return html;
}

export async function generatePdf(quote, user) {
  const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/quote/${quote.shareToken}`;

  const data = {
    businessName: user.businessName || user.name || '',
    businessEmail: user.email || '',
    businessPhone: user.phone || '',
    businessAddress: user.address || '',
    brandColor: user.brandColor || '#1B2A4A',
    quoteNumber: quote.quoteNumber,
    quoteDate: formatDate(quote.createdAt),
    expiresDate: quote.expiresAt ? formatDate(quote.expiresAt) : '',
    clientName: quote.clientName || '',
    clientEmail: quote.clientEmail || '',
    clientPhone: quote.clientPhone || '',
    jobDescription: quote.jobDescription || '',
    lineItems: (quote.lineItems || []).map((item, i) => ({
      index: i + 1,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit || 'flat rate',
      unitPrice: formatCurrency(item.unitPrice),
      amount: formatCurrency(item.amount),
    })),
    subtotal: formatCurrency(quote.subtotal),
    taxRate: quote.taxRate || 0,
    tax: formatCurrency(quote.tax),
    total: formatCurrency(quote.total),
    notes: (quote.notes || '').replace(/\n/g, '<br>'),
    shareUrl,
  };

  const templateName = quote.templateStyle || user.templateStyle || 'clean-minimal';
  const html = await renderTemplate(templateName, data);

  const executablePath = process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless ?? 'new',
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
