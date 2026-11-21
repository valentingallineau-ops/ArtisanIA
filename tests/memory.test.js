const test = require("node:test");
const assert = require("node:assert/strict");
const { createMemoryStore, MEMORY_KEY } = require("../brain/memory.js");

function makeStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function legacySnapshot() {
  return {
    version: 2,
    clients: [{ id: "c1", name: "Dupont", phone: "0600000000" }],
    prospects: [{ id: "p1", name: "Entreprise Martin", status: "À contacter" }],
    jobs: [{ id: "j1", title: "Toiture", clientId: "c1", client: "Dupont" }],
    tasks: [{ id: "t1", title: "Appeler Dupont", client: "Dupont", job: "Toiture" }],
    suppliers: [{ id: "s1", name: "Négoce Bois" }],
    materials: [{ id: "m1", name: "Chevron", supplier: "Négoce Bois" }],
    events: [{ id: "e1", title: "Visite", clientId: "c1" }],
    notes: [{ id: "n1", title: "Mesure toiture", job: "Toiture" }],
    invoices: [{ id: "i1", number: "F-001", clientId: "c1" }],
    expenses: [{ id: "x1", title: "Bois", supplier: "Négoce Bois" }]
  };
}

test("imports every V2 collection into a separate memory namespace", () => {
  const storage = makeStorage();
  const store = createMemoryStore(storage);
  const snapshot = legacySnapshot();
  const result = store.importBusinessData(snapshot);
  assert.equal(result.imported, 10);
  assert.equal(result.total, 10);
  assert.ok(storage.getItem(MEMORY_KEY));
  assert.equal(snapshot.clients[0].name, "Dupont");
});

test("creates links between known clients, jobs and suppliers", () => {
  const store = createMemoryStore(makeStorage());
  store.importBusinessData(legacySnapshot());
  const memory = store.getSnapshot();
  const task = memory.entities.find(item => item.type === "task");
  const material = memory.entities.find(item => item.type === "material");
  assert.deepEqual(task.links.map(link => link.type).sort(), ["client", "job"]);
  assert.equal(material.links[0].type, "supplier");
});

test("does not guess links when client names are ambiguous", () => {
  const store = createMemoryStore(makeStorage());
  const snapshot = legacySnapshot();
  snapshot.clients.push({ id: "c2", name: "Dupont" });
  store.importBusinessData(snapshot);
  const task = store.getSnapshot().entities.find(item => item.type === "task");
  assert.equal(task.links.some(link => link.type === "client"), false);
});

test("repeated import is idempotent and does not overwrite memory edits", () => {
  const store = createMemoryStore(makeStorage());
  const snapshot = legacySnapshot();
  store.importBusinessData(snapshot);
  const client = store.getSnapshot().entities.find(item => item.type === "client");
  store.upsertEntity({ ...client, data: { ...client.data, name: "Dupont modifié" } });
  const result = store.importBusinessData(snapshot);
  assert.equal(result.imported, 0);
  assert.equal(result.skippedExisting, 10);
  assert.equal(store.getEntity(client.id).data.name, "Dupont modifié");
});

test("upsert updates an entity without changing its identity or creation date", () => {
  const store = createMemoryStore(makeStorage());
  const first = store.upsertEntity({ id: "memory:client:test", type: "client", sourceId: "test", data: { name: "A" } });
  const second = store.upsertEntity({ ...first, data: { name: "B" } });
  assert.equal(second.id, first.id);
  assert.equal(second.createdAt, first.createdAt);
  assert.equal(second.data.name, "B");
});

test("rejects unsupported legacy versions and malformed collections", () => {
  const store = createMemoryStore(makeStorage());
  assert.throws(() => store.importBusinessData({ version: 1 }), /format V2/);
  assert.throws(() => store.importBusinessData({ version: 2, clients: {} }), /Collection invalide/);
});

test("does not silently overwrite unreadable memory", () => {
  const storage = makeStorage();
  storage.setItem(MEMORY_KEY, "{bad json");
  const store = createMemoryStore(storage);
  assert.throws(() => store.getSnapshot(), /illisible/);
});
