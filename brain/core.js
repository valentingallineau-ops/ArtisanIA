/* ArtisanIA Brain — deterministic local foundation.
 * No network access, external services, or automatic execution of actions.
 * Loaded as a standalone CommonJS module for tests; application integration comes later.
 */
"use strict";

const normalizeText = (input) => String(input ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[’']/g, " ")
  .replace(/[^a-z0-9€.,!?\s-]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const patterns = [
  {
    type: "reminder",
    confidence: 0.88,
    regex: /\b(rappelle moi|rappeler|ne pas oublier|pense a)\b/,
    actionType: "task",
    label: "Créer un rappel ou une tâche"
  },
  {
    type: "follow_up",
    confidence: 0.82,
    regex: /\b(relancer|relance|rappeler le client|recontacter)\b/,
    actionType: "task",
    label: "Préparer une relance"
  },
  {
    type: "schedule",
    confidence: 0.78,
    regex: /\b(rendez vous|rdv|meeting|visite)\b/,
    actionType: "event",
    label: "Proposer un rendez-vous"
  },
  {
    type: "delivery",
    confidence: 0.76,
    regex: /\b(livre|livraison|livrer|arrive)\b/,
    actionType: "note_or_event",
    label: "Enregistrer une information de livraison"
  },
  {
    type: "payment_received",
    confidence: 0.7,
    regex: /\b(recu|recois|acompte|paiement|pay[eé])\b/,
    actionType: "payment_review",
    label: "Vérifier et enregistrer un paiement"
  },
  {
    type: "job_update",
    confidence: 0.72,
    regex: /\b(chantier|commence|demarre|termine|finis|avance)\b/,
    actionType: "job_update",
    label: "Proposer une mise à jour de chantier"
  }
];

function extractRelativeDate(text) {
  const t = normalizeText(text);
  const dateTerms = ["aujourd hui", "demain", "apres demain", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche", "la semaine prochaine"];
  const found = dateTerms.find(term => t.includes(term));
  return found ? { expression: found, resolved: false } : null;
}

function analyzeMessage(input) {
  const original = String(input ?? "").trim();
  const normalized = normalizeText(original);
  if (!normalized) {
    return { input: original, normalized, intent: "empty", confidence: 0, needsClarification: true, clarification: "Que souhaitez-vous faire ?", entities: [], actionProposal: null };
  }
  const matched = patterns.find(p => p.regex.test(normalized));
  if (!matched) {
    return { input: original, normalized, intent: "unknown", confidence: 0.25, needsClarification: true, clarification: "Je n'ai pas encore identifié l'action. Pouvez-vous préciser ?", entities: [], actionProposal: null };
  }
  const date = extractRelativeDate(original);
  const proposal = {
    type: matched.actionType,
    title: matched.label,
    sourceText: original,
    dateExpression: date,
    confidence: matched.confidence,
    reasons: ["Intention détectée par règle locale simple"],
    requiresConfirmation: true,
    status: "proposed"
  };
  const needsClarification = matched.type === "payment_received" || matched.type === "job_update" || matched.type === "delivery" || (matched.type === "reminder" && !date);
  return {
    input: original,
    normalized,
    intent: matched.type,
    confidence: matched.confidence,
    needsClarification,
    clarification: needsClarification ? "Vérifions le contexte (client, chantier et/ou date) avant de créer quoi que ce soit." : null,
    entities: date ? [{ type: "relative_date", value: date.expression, resolved: false }] : [],
    actionProposal: proposal
  };
}

module.exports = { normalizeText, analyzeMessage };
