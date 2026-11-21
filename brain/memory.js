/* ArtisanIA Brain — structured local memory V1.
 * Storage is injected: no browser globals, network, or external services.
 * Legacy business records are copied into a separate namespace; originals remain untouched.
 */
"use strict";

const MEMORY_KEY = "artisania.brain.memory.v1";
const COLLECTIONS = {
  clients: "client",
  prospects: "prospect",
  jobs: "job",
  tasks: "task",
  suppliers: "supplier",
  materials: "material",
  events: "event",
  notes: "note",
  invoices: "invoice",
  expenses: "expense"
};

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function emptyMemory() {
  return { version: 1, entities: [], updatedAt: null };
}

function stableId(type, sourceId) {
  return "memory:" + type + ":" + encodeURIComponent(String(sourceId));
}

function normalizeName(value) {
  return String(value ?? "").trim().toLocaleLowerCase("fr");
}

function makeLink(type, entity) {
  return { type, id: entity.id };
}

function createMemoryStore(storage, options = {}) {
  if (!storage || typeof storage.getItem !== "function" ||
      typeof storage.setItem !== "function") {
    throw new TypeError("Un stockage compatible getItem/setItem est obligatoire.");
  }

  const key = options.key || MEMORY_KEY;

  function read() {
    try {
      const parsed = JSON.parse(storage.getItem(key) || "null");
      if (parsed && parsed.version === 1 && Array.isArray(parsed.entities)) {
        return {
          version: 1,
          entities: parsed.entities,
          updatedAt: parsed.updatedAt || null
        };
      }
    } catch (_) {
      // A damaged memory file is not overwritten implicitly.
      throw new Error("La mémoire locale est illisible. Aucune donnée n'a été modifiée.");
    }
    return emptyMemory();
  }

  function write(memory) {
    const next = {
      version: 1,
      entities: memory.entities,
      updatedAt: new Date().toISOString()
    };
    storage.setItem(key, JSON.stringify(next));
    return next;
  }

  function getSnapshot() {
    return clone(read());
  }

  function getEntity(id) {
    const entity = read().entities.find(item => item.id === String(id));
    return entity ? clone(entity) : null;
  }

  function upsertEntity(input) {
    if (!input || typeof input !== "object" || !input.type) {
      throw new TypeError("Une entité doit posséder un type.");
    }
    const now = new Date().toISOString();
    const entity = {
      id: String(input.id || stableId(input.type, input.sourceId || now)),
      type: String(input.type),
      sourceId: input.sourceId == null ? null : String(input.sourceId),
      data: clone(input.data || {}),
      createdAt: input.createdAt || now,
      updatedAt: now,
      source: input.source || "local",
      confidence: Number.isFinite(input.confidence) ? input.confidence : 1,
      links: Array.isArray(input.links) ? clone(input.links) : [],
      status: input.status || "confirmed"
    };
    const memory = read();
    const index = memory.entities.findIndex(item => item.id === entity.id);
    if (index >= 0) {
      entity.createdAt = memory.entities[index].createdAt || entity.createdAt;
      memory.entities[index] = entity;
    } else {
      memory.entities.push(entity);
    }
    write(memory);
    return clone(entity);
  }

  // Copies a V2 business snapshot into a separate, versioned memory store.
  // Existing memory entities are never overwritten by a repeated import.
  function importBusinessData(snapshot) {
    if (!snapshot || snapshot.version !== 2) {
      throw new TypeError("La sauvegarde métier doit être au format V2.");
    }

    const pending = [];
    for (const [collection, type] of Object.entries(COLLECTIONS)) {
      const records = snapshot[collection];
      if (records == null) continue;
      if (!Array.isArray(records)) {
        throw new TypeError("Collection invalide : " + collection);
      }
      records.forEach((record, index) => {
        if (!record || typeof record !== "object") return;
        const sourceId = record.id == null ? "legacy-" + index : String(record.id);
        pending.push({
          id: stableId(type, sourceId),
          type,
          sourceId,
          data: clone(record),
          createdAt: record.createdAt || null,
          source: "migration:artisania.business.v2",
          confidence: 1,
          links: [],
          status: "confirmed"
        });
      });
    }

    const memory = read();
    const existingIds = new Set(memory.entities.map(entity => entity.id));
    const imported = pending.filter(entity => !existingIds.has(entity.id));
    const byId = new Map([...memory.entities, ...imported].map(entity => [entity.id, entity]));
    const byType = type => [...byId.values()].filter(entity => entity.type === type);

    // Link clients conservatively: use a direct ID first, otherwise a unique exact name.
    const findClient = record => {
      if (record.clientId) {
        const direct = byId.get(stableId("client", record.clientId));
        if (direct) return direct;
      }
      const name = normalizeName(record.client);
      if (!name) return null;
      const matches = byType("client").filter(entity =>
        normalizeName(entity.data.name) === name
      );
      return matches.length === 1 ? matches[0] : null;
    };

    // Link jobs only when a unique exact title match exists.
    const findJob = record => {
      if (record.jobId) {
        const direct = byId.get(stableId("job", record.jobId));
        if (direct) return direct;
      }
      const title = normalizeName(record.job);
      if (!title) return null;
      const matches = byType("job").filter(entity =>
        normalizeName(entity.data.title) === title
      );
      return matches.length === 1 ? matches[0] : null;
    };

    for (const entity of imported) {
      const record = entity.data;
      const links = [];
      if (entity.type === "job") {
        const client = findClient({ clientId: record.clientId, client: record.client });
        if (client) links.push(makeLink("client", client));
      } else if (["task", "event", "note", "invoice"].includes(entity.type)) {
        const client = findClient(record);
        const job = findJob(record);
        if (client) links.push(makeLink("client", client));
        if (job) links.push(makeLink("job", job));
      } else if (entity.type === "material" || entity.type === "expense") {
        const supplierName = normalizeName(record.supplier);
        const matches = byType("supplier").filter(item =>
          normalizeName(item.data.name) === supplierName && supplierName
        );
        if (matches.length === 1) links.push(makeLink("supplier", matches[0]));
      }
      entity.links = links;
    }

    memory.entities.push(...imported);
    write(memory);
    return {
      imported: imported.length,
      skippedExisting: pending.length - imported.length,
      total: memory.entities.length
    };
  }

  return { getSnapshot, getEntity, upsertEntity, importBusinessData };
}

module.exports = { MEMORY_KEY, createMemoryStore, stableId };
