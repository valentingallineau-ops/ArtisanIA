const test = require("node:test");
const assert = require("node:assert/strict");
const { createMemoryStore } = require("../brain/memory.js");
const { createAssistantResponse } = require("../brain/assistant.js");

function makeMemory(duplicate = false) {
  const values = new Map();
  const store = createMemoryStore({
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  });
  store.importBusinessData({
    version: 2,
    clients: [
      { id: "c1", name: "Dupont" },
      ...(duplicate ? [{ id: "c2", name: "Dupont" }] : [])
    ],
    jobs: [{ id: "j1", title: "Toiture", clientId: "c1", client: "Dupont" }],
    tasks: [{ id: "t1", title: "Appeler Dupont", clientId: "c1", client: "Dupont" }],
    prospects: [], suppliers: [], materials: [], events: [], notes: [], invoices: [], expenses: []
  });
  return { store, values };
}

test("combines a reminder proposal with unique client context without executing it", () => {
  const { store, values } = makeMemory();
  const before = store.getSnapshot();
  const result = createAssistantResponse("Rappelle-moi d'appeler Dupont demain", before);
  assert.equal(result.understanding.intent, "reminder");
  assert.equal(result.actionProposal.target.type, "client");
  assert.equal(result.actionProposal.target.id, "memory:client:c1");
  assert.equal(result.actionProposal.requiresConfirmation, true);
  assert.equal(result.actionProposal.status, "proposed");
  assert.equal(result.execution.performed, false);
  assert.equal(store.getSnapshot().entities.length, before.entities.length);
  assert.ok(values.size > 0);
});

test("does not attach a target when the named client is ambiguous", () => {
  const { store } = makeMemory(true);
  const result = createAssistantResponse("Rappelle-moi d'appeler Dupont demain", store.getSnapshot());
  assert.equal(result.needsClarification, true);
  assert.equal(result.actionProposal.target, null);
  assert.match(result.clarification, /Plusieurs fiches/);
  assert.equal(result.execution.performed, false);
});

test("unknown messages return neither an action nor a guessed target", () => {
  const { store } = makeMemory();
  const result = createAssistantResponse("Bonjour Dupont", store.getSnapshot());
  assert.equal(result.understanding.intent, "unknown");
  assert.equal(result.actionProposal, null);
  assert.equal(result.context.matched.length, 1);
  assert.equal(result.execution.performed, false);
});

test("a message without a matching entity can still produce an unassigned proposal", () => {
  const { store } = makeMemory();
  const result = createAssistantResponse("Pense à vérifier les outils demain", store.getSnapshot());
  assert.equal(result.actionProposal.type, "task");
  assert.equal(result.actionProposal.target, null);
  assert.equal(result.actionProposal.requiresConfirmation, true);
});
