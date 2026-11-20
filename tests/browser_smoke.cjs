const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#ai2-launch', { timeout: 10000 });
    await page.click('#ai2-launch');
    await page.click('[data-tab="assistant"]');
    await page.fill('#ai2-command', 'Ajoute un client : Jean Martin, 0612345678 jean@example.fr');
    await page.click('#ai2-run');
    await page.waitForFunction(() => document.querySelector('#ai2-result')?.textContent.includes('enregistré'));
    await page.click('[data-tab="clients"]');
    await page.getByText('Jean Martin', { exact: true }).waitFor();

    await page.click('[data-tab="invoices"]');
    await page.click('[data-new="invoice"]');
    await page.locator('[name="number"]').fill('FA-TEST-001');
    await page.locator('[name="client"]').fill('Jean Martin');
    await page.locator('[name="invoiceDate"]').fill('2026-11-20');
    await page.locator('[name="dueDate"]').fill('2026-12-20');
    await page.locator('[name="amount"]').fill('1250');
    await page.locator('[name="status"]').selectOption({ label: 'Envoyée' });
    await page.locator('#ai2-form button[type="submit"]').click();
    await page.getByText('FA-TEST-001', { exact: true }).waitFor();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#ai2-launch');
    await page.click('#ai2-launch');
    await page.click('[data-tab="invoices"]');
    await page.getByText('FA-TEST-001', { exact: true }).waitFor();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
    await mobile.waitForSelector('#ai2-launch');
    await mobile.click('#ai2-launch');
    await mobile.locator('#ai2-root.open').waitFor();
    console.log('Browser smoke test passed: assistant, client creation, invoice tracking, persistence and mobile layout.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
