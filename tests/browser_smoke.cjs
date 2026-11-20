const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#ai2-launch', { timeout: 10000 });
    await page.click('#ai2-launch');

    // Assistant and client creation.
    await page.click('[data-tab="assistant"]');
    await page.fill('#ai2-command', 'Ajoute un client : Jean Martin, 0612345678 jean@example.fr');
    await page.click('#ai2-run');
    await page.waitForFunction(() => document.querySelector('#ai2-result')?.textContent.includes('enregistré'));
    await page.click('[data-tab="clients"]');
    await page.getByText('Jean Martin', { exact: true }).waitFor();

    // A prospect marked as converted must also become a client.
    await page.click('[data-tab="prospects"]');
    await page.click('[data-new="prospect"]');
    await page.locator('[name="name"]').fill('Sophie Martin');
    await page.locator('[name="phone"]').fill('0611223344');
    await page.locator('[name="status"]').selectOption({ label: 'Converti' });
    await page.locator('#ai2-form button[type="submit"]').click();
    await page.click('[data-tab="clients"]');
    await page.getByText('Sophie Martin', { exact: true }).waitFor();

    // Exercise the principal business records.
    const records = [
      { tab: 'jobs', type: 'job', fields: { title: 'Rénovation toiture test', status: 'À planifier' } },
      { tab: 'tasks', type: 'task', fields: { title: 'Relancer Sophie test', date: '2026-10-01', priority: 'Haute', status: 'À faire' } },
      { tab: 'suppliers', type: 'supplier', fields: { name: 'Fournisseur test', category: 'Bois' } },
      { tab: 'materials', type: 'material', fields: { name: 'Tuile test', reference: 'T-001', unit: 'u', price: '2.50' } },
      { tab: 'events', type: 'event', fields: { title: 'Visite chantier test', date: '2026-11-21', time: '10:00', place: 'Atelier' } },
      { tab: 'notes', type: 'note', fields: { title: 'Note chantier test', content: 'Vérifier les dimensions avant commande.' } },
      { tab: 'expenses', type: 'expense', fields: { title: 'Achat visserie test', date: '2026-11-20', amount: '45', status: 'Payée' } }
    ];
    for (const record of records) {
      await page.click(`[data-tab="${record.tab}"]`);
      await page.click(`[data-new="${record.type}"]`);
      for (const [name, value] of Object.entries(record.fields)) {
        const field = page.locator(`[name="${name}"]`);
        if (name === 'status' || name === 'priority') await field.selectOption({ label: value });
        else await field.fill(value);
      }
      await page.locator('#ai2-form button[type="submit"]').click();
      const title = record.fields.title || record.fields.name;
      await page.getByText(title, { exact: true }).waitFor();
    }

    // Client changes propagate to records linked by client identity.
    await page.click('[data-tab="clients"]');
    await page.click('[data-new="client"]');
    await page.locator('[name="name"]').fill('Client lié test');
    await page.locator('[name="address"]').fill('1 rue ancienne');
    await page.locator('#ai2-form button[type="submit"]').click();
    await page.click('[data-tab="jobs"]');
    await page.click('[data-new="job"]');
    await page.locator('[name="title"]').fill('Chantier lié test');
    await page.locator('[name="client"]').fill('Client lié test');
    await page.locator('[name="address"]').fill('1 rue ancienne');
    await page.locator('#ai2-form button[type="submit"]').click();
    await page.click('[data-tab="clients"]');
    const linkedClient = page.locator('.item').filter({ hasText: 'Client lié test' }).first();
    await linkedClient.locator('[data-edit="client"]').click();
    await page.locator('[name="name"]').fill('Client renommé test');
    await page.locator('[name="address"]').fill('2 rue nouvelle');
    await page.locator('#ai2-form button[type="submit"]').click();
    await page.click('[data-tab="jobs"]');
    const linkedJob = page.locator('.item').filter({ hasText: 'Chantier lié test' }).first();
    await linkedJob.locator('[data-edit="job"]').click();
    await page.locator('[name="client"]').waitFor();
    assert.equal(await page.locator('[name="client"]').inputValue(), 'Client renommé test');
    assert.equal(await page.locator('[name="address"]').inputValue(), '2 rue nouvelle');
    await page.locator('#ai2-cancel').click();

    // Invoice tracking and overdue detection.
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

    await page.click('[data-new="invoice"]');
    await page.locator('[name="number"]').fill('FA-OVERDUE-001');
    await page.locator('[name="client"]').fill('Jean Martin');
    await page.locator('[name="invoiceDate"]').fill('2026-09-01');
    await page.locator('[name="dueDate"]').fill('2026-10-01');
    await page.locator('[name="amount"]').fill('350');
    await page.locator('[name="status"]').selectOption({ label: 'Envoyée' });
    await page.locator('#ai2-form button[type="submit"]').click();

    // Export a backup, then prove that importing it restores the earlier state.
    await page.click('[data-tab="home"]');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-export]').click();
    const download = await downloadPromise;
    const backupPath = '/tmp/artisania-backup-test.json';
    await download.saveAs(backupPath);
    const backup = JSON.parse(await fs.readFile(backupPath, 'utf8'));
    assert.ok(backup.clients.some(client => client.name === 'Sophie Martin'));
    assert.ok(backup.invoices.some(invoice => invoice.number === 'FA-TEST-001'));

    await page.click('[data-tab="clients"]');
    await page.click('[data-new="client"]');
    await page.locator('[name="name"]').fill('Client temporaire test');
    await page.locator('#ai2-form button[type="submit"]').click();
    await page.click('[data-tab="home"]');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#ai2-import').setInputFiles(backupPath);
    await page.getByText('Sauvegarde importée.', { exact: true }).waitFor();
    await page.click('[data-tab="clients"]');
    await page.getByText('Sophie Martin', { exact: true }).waitFor();
    await page.getByText('Client temporaire test', { exact: true }).waitFor({ state: 'detached' });

    // Reload proves persistence; dashboard lists overdue items.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#ai2-launch');
    await page.click('#ai2-launch');
    await page.getByText('FA-OVERDUE-001', { exact: true }).first().waitFor();
    await page.click('[data-tab="invoices"]');
    await page.getByText('FA-TEST-001', { exact: true }).waitFor();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
    await mobile.waitForSelector('#ai2-launch');
    await mobile.click('#ai2-launch');
    await mobile.locator('#ai2-root.open').waitFor();

    console.log('Browser smoke test passed: assistant, clients, prospect conversion, core modules, invoices, backup restore, persistence and mobile layout.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
