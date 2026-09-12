import type { CharacterMechanicFact } from '../characterMechanicsDomain.ts';
import { CHARACTER_CATALOG } from '../data/characters.ts';
import { CHARACTER_MECHANIC_FACTS, getCharacterMechanicsProfile } from '../data/characterMechanics.ts';
import {
  createIncomingTransferWindow, isIncomingTransferWindowActive,
  type IncomingTransferWindow, type OutgoingSwitchEvent, type ResonatorSwitchOutEvent,
} from './incomingTransferState.ts';

export const CHARACTER_OUTRO_TRANSFER_ADAPTER_ID = 'character-outro-source-amplifications-v1';

export interface CharacterOutroAmplification {
  readonly statOrEffect: string;
  readonly value: number;
}

interface CharacterOutroContract {
  readonly factId: string;
  readonly characterId: string;
  readonly durationSeconds: number;
  readonly amplifications: readonly CharacterOutroAmplification[];
  readonly stackPolicy?: 'UNKNOWN_SINGLE_ACTIVATION_ONLY';
}

/** Reviewed only for one source-qualified activation, not repeated-activation stack/refresh behavior. */
export const CHARACTER_OUTRO_SINGLE_ACTIVATION_REVIEW = {
  reviewedAt: '2026-09-10',
  factIds: ['zhezhi-outro-carve-and-draw', 'lumi-outro-escorting', 'roccia-outro-applause-please', 'sanhua-outro-silversnow', 'lupa-outro-stand-by-me-warrior', 'qiuyuan-outro-strike-before-ready-amplification', 'lynae-outro-lets-hit-the-road-amplification', 'cantarella-outro-gentle-tentacles'],
  lupaReviewedAt: '2026-09-11',
  qiuyuanReviewedAt: '2026-09-11',
  lynaeCantarellaReviewedAt: '2026-09-11',
  sourceCheckedAt: '2026-08-28',
  sanhuaSourceCheckedAt: '2026-08-29',
  qiuyuanSourceCheckedAt: '2026-08-29',
  lynaeCantarellaSourceCheckedAt: '2026-08-29',
  // Only Silversnow's canonical Deepen wording is mapped to this source-proven amplification scope.
  sanhuaSemanticSource: 'https://wuthering.wiki/character_1102.html',
  sourceCommit: '5fa70b11f1d84fb644e4dbed47873708da0fe66f',
  stackPolicy: 'UNKNOWN_SINGLE_ACTIVATION_ONLY',
} as const;

/** Read already-canonical amounts. RAW_ONLY remains unchanged for the unknown repeated-activation lifecycle. */
export function resolveCharacterOutroSingleActivationContract(fact: CharacterMechanicFact): CharacterOutroContract | null {
  const owner = fact.factId === 'zhezhi-outro-carve-and-draw' ? 'zhezhi'
    : fact.factId === 'lumi-outro-escorting' ? 'lumi'
    : fact.factId === 'roccia-outro-applause-please' ? 'roccia'
    : fact.factId === 'sanhua-outro-silversnow' ? 'sanhua'
    : fact.factId === 'lupa-outro-stand-by-me-warrior' ? 'lupa'
    : fact.factId === 'qiuyuan-outro-strike-before-ready-amplification' ? 'qiuyuan'
    : fact.factId === 'lynae-outro-lets-hit-the-road-amplification' ? 'lynae'
    : fact.factId === 'cantarella-outro-gentle-tentacles' ? 'cantarella' : null;
  const profile = owner && getCharacterMechanicsProfile(owner);
  const knownSingleCap = owner === 'lynae' || owner === 'cantarella';
  if (!owner || fact.characterId !== owner || profile?.verificationStatus !== 'VERIFIED' || !profile.factIds.includes(fact.factId)
    || fact.kind !== 'PASSIVE' || fact.verificationStatus !== 'VERIFIED' || fact.modelingStatus !== 'RAW_ONLY'
    || fact.section !== 'OUTRO_SKILL' || fact.scope !== 'NEXT_CHARACTER' || fact.maxStacks !== (knownSingleCap ? 1 : null)
    || fact.provenance.checkedAt !== (owner === 'sanhua' ? CHARACTER_OUTRO_SINGLE_ACTIVATION_REVIEW.sanhuaSourceCheckedAt
      : owner === 'qiuyuan' ? CHARACTER_OUTRO_SINGLE_ACTIVATION_REVIEW.qiuyuanSourceCheckedAt
      : knownSingleCap ? CHARACTER_OUTRO_SINGLE_ACTIVATION_REVIEW.lynaeCantarellaSourceCheckedAt
      : CHARACTER_OUTRO_SINGLE_ACTIVATION_REVIEW.sourceCheckedAt)
    || !fact.provenance.sourceUrls?.includes(`https://github.com/DommyMM/wuwabuild/blob/${CHARACTER_OUTRO_SINGLE_ACTIVATION_REVIEW.sourceCommit}/public/Data/Characters.json`)
    || fact.durationSeconds === null || !Number.isFinite(fact.durationSeconds) || fact.durationSeconds <= 0) return null;
  const dual = ['zhezhi', 'roccia'].includes(owner) && fact.triggerSummary === `${owner === 'zhezhi' ? 'Zhezhi' : 'Roccia'} casts Outro Skill.` && fact.conditional === true
    ? fact.effectSummary.match(/^The incoming Resonator has (Glacio|Havoc) DMG Amplified by ([0-9]+(?:\.[0-9]+)?)% and (Resonance Skill|Basic Attack) DMG Amplified by ([0-9]+(?:\.[0-9]+)?)%\. The effect ends early if the Resonator is switched out\.$/) : null;
  if (dual && (dual[1] !== (owner === 'zhezhi' ? 'Glacio' : 'Havoc')
    || dual[3] !== (owner === 'zhezhi' ? 'Resonance Skill' : 'Basic Attack'))) return null;
  const lumi = owner === 'lumi' && fact.triggerSummary === 'Lumi casts Outro Skill Escorting.' && fact.conditional === false
    ? fact.effectSummary.match(/^The incoming Resonator has Resonance Skill DMG Amplified by ([0-9]+(?:\.[0-9]+)?)% for ([0-9]+(?:\.[0-9]+)?)s or until switched out\.$/) : null;
  const sanhua = owner === 'sanhua' && fact.triggerSummary === 'Casting Outro Skill.' && fact.conditional === true
    ? fact.effectSummary.match(/^The incoming character gains ([0-9]+(?:\.[0-9]+)?)% Basic Attack DMG Deepen for ([0-9]+(?:\.[0-9]+)?)s or until switched off field\.$/) : null;
  const lupa = owner === 'lupa' && fact.triggerSummary === "Cast Lupa's Outro Skill." && fact.conditional === false
    ? fact.effectSummary.match(/^The incoming Resonator gains ([0-9]+(?:\.[0-9]+)?)% Fusion DMG Amplification and ([0-9]+(?:\.[0-9]+)?)% Basic Attack DMG Amplification for ([0-9]+(?:\.[0-9]+)?)s or until switched out\.$/) : null;
  const qiuyuan = owner === 'qiuyuan' && fact.triggerSummary === 'Casting Outro Skill.' && fact.conditional === true
    ? fact.effectSummary.match(/^The incoming Resonator gains ([0-9]+(?:\.[0-9]+)?)% Echo Skill DMG Amplification for ([0-9]+(?:\.[0-9]+)?)s or until switched out\. Outro damage is represented separately as source-fixed ECHO damage\.$/) : null;
  // Their canonical cap is known, but repeated-activation refresh remains outside this isolated family.
  const lynae = owner === 'lynae' && fact.triggerSummary === 'Lynae casts Outro Skill and the incoming Resonator takes the field.' && fact.conditional === true
    ? fact.effectSummary.match(/^Incoming Resonator gains ([0-9]+(?:\.[0-9]+)?)% All DMG Amplification and ([0-9]+(?:\.[0-9]+)?)% Resonance Liberation DMG Amplification for ([0-9]+(?:\.[0-9]+)?)s or until switched out\. The source-fixed [0-9]+(?:\.[0-9]+)?% ATK Outro hit is stored as a separate ACTION fact\.$/) : null;
  const cantarella = owner === 'cantarella' && fact.triggerSummary === 'Cantarella casts Outro Skill and the incoming Resonator takes the field.' && fact.conditional === true
    ? fact.effectSummary.match(/^Incoming Resonator gains ([0-9]+(?:\.[0-9]+)?)% Havoc DMG Amplification and ([0-9]+(?:\.[0-9]+)?)% Resonance Skill DMG Amplification for ([0-9]+(?:\.[0-9]+)?)s or until switched out\.$/) : null;
  const single = lumi ?? sanhua ?? qiuyuan;
  const gainsDual = lupa ?? lynae ?? cantarella;
  if (!dual && !single && !gainsDual || single && Number(single[2]) !== fact.durationSeconds
    || gainsDual && Number(gainsDual[3]) !== fact.durationSeconds) return null;
  const amplifications = gainsDual ? [
    { statOrEffect: `${lupa ? 'Fusion' : lynae ? 'All' : 'Havoc'} DMG Amplification`, value: Number(gainsDual[1]) / 100 },
    { statOrEffect: `${lupa ? 'Basic Attack' : lynae ? 'Resonance Liberation' : 'Resonance Skill'} DMG Amplification`, value: Number(gainsDual[2]) / 100 },
  ] : dual ? [
    { statOrEffect: `${dual[1]} DMG Amplification`, value: Number(dual[2]) / 100 },
    { statOrEffect: `${dual[3]} DMG Amplification`, value: Number(dual[4]) / 100 },
  ] : [{ statOrEffect: `${lumi ? 'Resonance Skill' : qiuyuan ? 'Echo Skill' : 'Basic Attack'} DMG Amplification`, value: Number(single![1]) / 100 }];
  if (amplifications.some((term) => !Number.isFinite(term.value) || term.value <= 0)) return null;
  return { factId: fact.factId, characterId: owner, durationSeconds: fact.durationSeconds, amplifications,
    stackPolicy: 'UNKNOWN_SINGLE_ACTIVATION_ONLY' };
}

/**
 * Exact reviewed source sentence shapes only. Each amplification stays a
 * separate term; this parser does not choose how different damage scopes
 * combine. Other text, pending modeling and periodic resource effects stay out.
 */
export function resolveCharacterOutroTransferContract(fact: CharacterMechanicFact): CharacterOutroContract | null {
  const profile = getCharacterMechanicsProfile(fact.characterId);
  if (profile?.verificationStatus !== 'VERIFIED' || !profile.factIds.includes(fact.factId)
      || fact.kind !== 'PASSIVE' || fact.verificationStatus !== 'VERIFIED'
      || !['MODEL_READY', 'MODELED'].includes(fact.modelingStatus)
      || fact.section !== 'OUTRO_SKILL' || fact.scope !== 'NEXT_CHARACTER' || fact.maxStacks !== 1) return null;
  const character = CHARACTER_CATALOG.find((row) => row.id === fact.characterId);
  if (fact.triggerSummary !== `${character?.name} casts Outro Skill and the incoming Resonator takes the field.`) return null;

  const single = fact.effectSummary.match(/^The incoming Resonator gains ([0-9]+(?:\.[0-9]+)?)% (Aero DMG|Heavy Attack DMG) Amplification for ([0-9]+(?:\.[0-9]+)?) seconds or until (?:they switch out|that character switches out)\.$/);
  const scoped = fact.effectSummary.match(/^The incoming Resonator has (?:(Fusion|Electro) DMG Amplified by ([0-9]+(?:\.[0-9]+)?)% and )?(Resonance Liberation|Resonance Skill) DMG Amplified by ([0-9]+(?:\.[0-9]+)?)% for ([0-9]+(?:\.[0-9]+)?)(?:s| seconds) or until switched out\.$/);
  let durationSeconds: number;
  let amplifications: CharacterOutroAmplification[];
  if (single) {
    durationSeconds = Number(single[3]);
    amplifications = [{ statOrEffect: `${single[2]} Amplification`, value: Number(single[1]) / 100 }];
  } else if (scoped) {
    durationSeconds = Number(scoped[5]);
    amplifications = [
      ...(scoped[1] ? [{ statOrEffect: `${scoped[1]} DMG Amplification`, value: Number(scoped[2]) / 100 }] : []),
      { statOrEffect: `${scoped[3]} DMG Amplification`, value: Number(scoped[4]) / 100 },
    ];
  } else return null;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds !== fact.durationSeconds
      || amplifications.some((term) => !Number.isFinite(term.value) || term.value <= 0)) return null;
  return { factId: fact.factId, characterId: fact.characterId, durationSeconds, amplifications };
}

export function listCharacterOutroTransferSupport() {
  return CHARACTER_MECHANIC_FACTS.flatMap((fact) => {
    const contract = resolveCharacterOutroTransferContract(fact) ?? resolveCharacterOutroSingleActivationContract(fact);
    return contract ? [{ ...contract, primitiveId: CHARACTER_OUTRO_TRANSFER_ADAPTER_ID,
      scope: 'EXPLICIT_OUTRO_TRANSFER_ONLY' as const, endsOnIncomingSwitchOut: true as const }] : [];
  }).sort((a, b) => a.factId < b.factId ? -1 : a.factId > b.factId ? 1 : 0);
}

export function activateCharacterOutroTransfers(params: {
  readonly factId: string;
  readonly event: OutgoingSwitchEvent;
  /** Required for the reviewed RAW_ONLY bindings: no earlier activation is still active. */
  readonly priorActivationState?: 'NONE_ACTIVE' | 'UNKNOWN';
}): readonly IncomingTransferWindow[] {
  const fact = CHARACTER_MECHANIC_FACTS.find((row) => row.factId === params.factId);
  const contract = fact && (resolveCharacterOutroTransferContract(fact) ?? resolveCharacterOutroSingleActivationContract(fact));
  if (!contract) throw new Error(`${params.factId}: unsupported canonical Outro transfer`);
  if (contract.stackPolicy && params.priorActivationState !== 'NONE_ACTIVE') {
    throw new Error('Explicit absence of an earlier active Outro is required; stack/refresh semantics remain unknown');
  }
  const expiresAt = params.event.atSeconds + contract.durationSeconds;
  if (!Number.isFinite(expiresAt) || expiresAt <= params.event.atSeconds) throw new Error('Outro expiration is not representable');
  return contract.amplifications.flatMap((term) => {
    const window = createIncomingTransferWindow({
      adapterId: CHARACTER_OUTRO_TRANSFER_ADAPTER_ID,
      sourceLayer: 'CHARACTER', sourceId: contract.factId,
      effectId: `${contract.factId}:${term.statOrEffect}`, sourceActorId: contract.characterId,
      statOrEffect: term.statOrEffect, value: term.value, durationSeconds: contract.durationSeconds,
      requiresIncomingIntro: false, endsOnIncomingSwitchOut: true,
    }, params.event);
    return window ? [window] : [];
  });
}

/** Explicit history is mandatory; independent terms are not combined into DPS. */
export function activeCharacterOutroAmplifications(
  windows: readonly IncomingTransferWindow[], actorId: string, atSeconds: number,
  switchOutEvents: readonly ResonatorSwitchOutEvent[],
  ordering?: {
    readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER' | 'UNKNOWN';
    readonly sameTimestampSwitchOutOrder?: 'BEFORE_QUERY' | 'AFTER_QUERY' | 'UNKNOWN';
  },
): readonly IncomingTransferWindow[] {
  if (!Array.isArray(switchOutEvents)) throw new Error('Outro query requires explicit recipient switch-out history');
  for (const window of windows) {
    if (window.adapterId !== CHARACTER_OUTRO_TRANSFER_ADAPTER_ID || window.sourceLayer !== 'CHARACTER') {
      throw new Error('Outro query requires a Character Outro transfer window');
    }
  }
  const singleOnly = windows.some((window) => CHARACTER_OUTRO_SINGLE_ACTIVATION_REVIEW.factIds.some((id) => id === window.sourceId));
  if (singleOnly) {
    if (!ordering || !['BEFORE_TRIGGER', 'AFTER_TRIGGER', 'UNKNOWN'].includes(ordering.sameTimestampOrder)) {
      throw new Error('Explicit Outro/query ordering is required');
    }
    const first = windows[0];
    if (windows.some((window) => window.sourceId !== first.sourceId || window.sourceActorId !== first.sourceActorId
      || window.incomingResonatorId !== first.incomingResonatorId || window.startedAtSeconds !== first.startedAtSeconds)
      || new Set(windows.map((window) => window.effectId)).size !== windows.length) {
      throw new Error('Unknown stack semantics require one independent activation; repeated/mixed windows are unsupported');
    }
    if (atSeconds === first.startedAtSeconds) {
      if (ordering.sameTimestampOrder === 'UNKNOWN') throw new Error('Same-timestamp Outro/query ordering is unresolved');
      if (ordering.sameTimestampOrder === 'BEFORE_TRIGGER') return [];
    }
    const ties = switchOutEvents.some((event) => event.actorId === first.incomingResonatorId && event.atSeconds === atSeconds);
    if (ties) {
      if (!['BEFORE_QUERY', 'AFTER_QUERY'].includes(ordering.sameTimestampSwitchOutOrder ?? '')) {
        throw new Error('Same-timestamp recipient switch/query ordering is unresolved');
      }
      if (ordering.sameTimestampSwitchOutOrder === 'AFTER_QUERY') {
        // Validate the complete supplied history before excluding only a proven later event.
        windows.forEach((window) => isIncomingTransferWindowActive(window, actorId, atSeconds, switchOutEvents));
        switchOutEvents = switchOutEvents.filter((event) => event.atSeconds !== atSeconds);
      }
    }
  }
  return windows.filter((window) => isIncomingTransferWindowActive(window, actorId, atSeconds, switchOutEvents));
}
