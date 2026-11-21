const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeText, analyzeMessage } = require("../brain/core.js");

test("normalizes French accents and whitespace", () => {
  assert.equal(normalizeText("  RÉNOVE   la toiture  "), "renove la toiture");
});

test("detects reminder and keeps date unresolved for confirmation", () => {
  const r = analyzeMessage("Rappelle-moi d'appeler Dupont demain");
  assert.equal(r.intent, "reminder");
  assert.equal(r.actionProposal.requiresConfirmation, true);
  assert.deepEqual(r.entities[0], { type: "relative_date", value: "demain", resolved: false });
});

test("asks for context when reminder has no date", () => {
  const r = analyzeMessage("Pense à relancer le client");
  assert.equal(r.intent, "reminder");
  assert.equal(r.needsClarification, true);
});

test("delivery is only a proposal, never automatic", () => {
  const r = analyzeMessage("Le fournisseur livre les tuiles jeudi");
  assert.equal(r.intent, "delivery");
  assert.equal(r.actionProposal.status, "proposed");
  assert.equal(r.actionProposal.requiresConfirmation, true);
});

test("payment mention requests checking rather than booking a payment", () => {
  const r = analyzeMessage("J'ai reçu 200 euros d'acompte");
  assert.equal(r.intent, "payment_received");
  assert.equal(r.actionProposal.type, "payment_review");
  assert.equal(r.needsClarification, true);
});

test("unknown or empty messages do not create action proposals", () => {
  assert.equal(analyzeMessage("Bonjour").actionProposal, null);
  assert.equal(analyzeMessage("").actionProposal, null);
});

test("job-related language produces a cautious update proposal", () => {
  const r = analyzeMessage("Le chantier commence lundi");
  assert.equal(r.intent, "job_update");
  assert.equal(r.actionProposal.requiresConfirmation, true);
  assert.equal(r.needsClarification, true);
});
