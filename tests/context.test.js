const test = require("node:test");
const assert = require("node:assert/strict");
const { createMemoryStore } = require("../brain/memory.js");
const { resolveContext } = require("../brain/context.js");

function snapshot(duplicate = false) {
  const storage = new Map();
  const store = createMemoryStore({
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  });
  const business = {
    version: 2,
    clients: [
      { id: "c1", name: "Dupont" },
      ...(duplicate ? [{ id: "c2", name: "Dupont" }] : [])
    ],
    jobs: [{ id: "j1", title: "Rénovation toiture", clientId: "c1", client: "Dupont" }],
    tasks: [{ id: "t1", title: "Appeler le client", clientId: "c1", client: "Dupont", job: "Rénovation toiture" }],
    prospects: [], suppliers: [], materials: [], events: [], notes: [], invoices: [], expenses: []
  };
  store.importBusinessData(business);
  return store.getSnapshot();
}

test("resolves a named client and includes its linked job and task", () => {
  const result = resolveContext(snapshot(), "Prépare les informations pour Dupont");
  assert.equal(result.matched.length, 1);
  assert.equal(result.matched[0].type, "client");
  assert.deepEqual(result.related.map(item => item.type).sort(), ["job", "task"]);
  assert.equal(result.needsClarification, false);
});

test("does not choose between duplicate client names", () => {
  const result = resolveContext(snapshot(true), "Rappelle Dupont");
  assert.equal(result.matched.length, 0);
  assert.equal(result.ambiguities.length, 1);
  assert.equal(result.needsClarification, true);
});

test("resolves accented job titles with normalized text", () => {
  const result = resolveContext(snapshot(), "Que sait-on sur la RENOVATION toiture ?");
  assert.equal(result.matched.length, 1);
  assert.equal(result.matched[0].type, "job");
});

test("does not match partial words or invent context", () => {
  const result = resolveContext(snapshot(), "Parle-moi de monsieur Dupontier");
  assert.equal(result.matched.length, 0);
  assert.equal(result.related.length, 0);
  assert.equal(result.ambiguities.length, 0);
});

test("resolves a named job and follows its explicit client relationship", () => {
  const result = resolveContext(snapshot(), "Où en est la rénovation toiture ?");
  assert.equal(result.matched[0].type, "job");
  assert.ok(result.related.some(item => item.type === "client"));
  assert.ok(result.related.some(item => item.type === "task"));
});
