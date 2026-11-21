/* ArtisanIA Brain — explicit context resolver.
 * Exact local matching only: no fuzzy guesses, network calls, or automatic actions.
 */
"use strict";

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9€.,!?\s-]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsPhrase(message, phrase) {
  const text = normalize(message);
  const target = normalize(phrase);
  if (!target || target.length < 3) return false;
  return (" " + text + " ").includes(" " + target + " ");
}

function resolveContext(memorySnapshot, message) {
  const entities = Array.isArray(memorySnapshot?.entities) ? memorySnapshot.entities : [];
  const searchableTypes = new Set(["client", "prospect", "job", "supplier"]);
  const directMatches = entities.filter(entity => {
    if (!searchableTypes.has(entity.type)) return false;
    const label = entity.type === "job"
      ? entity.data?.title
      : entity.data?.name;
    return containsPhrase(message, label);
  });

  const groups = new Map();
  for (const entity of directMatches) {
    const label = normalize(entity.type === "job" ? entity.data?.title : entity.data?.name);
    const key = entity.type + ":" + label;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entity);
  }

  const selected = [];
  const ambiguities = [];
  for (const [key, matches] of groups) {
    if (matches.length === 1) {
      selected.push(matches[0]);
    } else {
      ambiguities.push({
        type: matches[0].type,
        label: matches[0].type === "job" ? matches[0].data?.title : matches[0].data?.name,
        candidates: matches.map(item => ({ id: item.id, data: item.data }))
      });
    }
  }

  const included = new Map(selected.map(entity => [entity.id, entity]));
  const queue = [...included.keys()];

  // Walk only explicit links, in both directions, to gather the connected context.
  while (queue.length) {
    const currentId = queue.shift();
    const current = included.get(currentId);
    for (const link of (Array.isArray(current?.links) ? current.links : [])) {
      const linked = entities.find(entity => entity.id === link.id);
      if (linked && !included.has(linked.id)) {
        included.set(linked.id, linked);
        queue.push(linked.id);
      }
    }
    for (const entity of entities) {
      const links = Array.isArray(entity.links) ? entity.links : [];
      if (links.some(link => link.id === currentId) && !included.has(entity.id)) {
        included.set(entity.id, entity);
        queue.push(entity.id);
      }
    }
  }

  return {
    matched: selected.map(entity => ({ id: entity.id, type: entity.type, data: entity.data })),
    related: [...included.values()]
      .filter(entity => !selectedIds.has(entity.id))
      .map(entity => ({ id: entity.id, type: entity.type, data: entity.data })),
    ambiguities,
    needsClarification: ambiguities.length > 0,
    explanation: ambiguities.length
      ? "Plusieurs fiches correspondent au même nom. Il faut choisir avant d'utiliser ces informations."
      : selected.length
        ? "Contexte trouvé par correspondance exacte dans la mémoire locale."
        : "Aucune fiche précise identifiée dans la mémoire locale."
  };
}

module.exports = { resolveContext };
