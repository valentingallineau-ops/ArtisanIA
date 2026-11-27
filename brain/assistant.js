/* ArtisanIA Brain — local assistant pipeline.
 * Combines intent detection and explicit memory context.
 * Returns proposals only; it never writes to memory or executes actions.
 */
"use strict";

const { analyzeMessage } = require("./core.js");
const { resolveContext } = require("./context.js");

function createAssistantResponse(message, memorySnapshot) {
  const understanding = analyzeMessage(message);
  const context = resolveContext(memorySnapshot, message);
  const ambiguous = context.needsClarification;

  let proposal = understanding.actionProposal
    ? {
        ...understanding.actionProposal,
        target: null,
        relatedContext: [],
        requiresConfirmation: true,
        status: "proposed"
      }
    : null;

  if (proposal) {
    if (!ambiguous && context.matched.length === 1) {
      const primary = context.matched[0];
      proposal.target = { id: primary.id, type: primary.type };
      proposal.relatedContext = context.related.map(entity => ({
        id: entity.id,
        type: entity.type
      }));
      proposal.reasons = [
        ...proposal.reasons,
        "Une fiche correspondante a été retrouvée dans la mémoire locale."
      ];
    } else if (ambiguous) {
      proposal.reasons = [
        ...proposal.reasons,
        "Le contexte contient des homonymes : aucune fiche n'est sélectionnée."
      ];
    }
  }

  const needsClarification = understanding.needsClarification || ambiguous;
  const clarification = ambiguous
    ? "Plusieurs fiches correspondent. Laquelle voulez-vous utiliser ?"
    : understanding.clarification;

  return {
    input: String(message ?? ""),
    understanding: {
      intent: understanding.intent,
      confidence: understanding.confidence,
      normalized: understanding.normalized,
      entities: understanding.entities
    },
    context,
    needsClarification,
    clarification,
    actionProposal: proposal,
    execution: {
      performed: false,
      reason: "Aucune action n'est exécutée automatiquement. Une confirmation explicite sera nécessaire."
    }
  };
}

module.exports = { createAssistantResponse };
