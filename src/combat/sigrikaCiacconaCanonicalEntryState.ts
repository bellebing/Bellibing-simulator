import { PROFILE_REGISTRY } from '../data/profileCatalogs.ts';
import {
  projectCiacconaSoloConcertForSigrika,
  type SigrikaCiacconaSoloConcertProjection,
} from './sigrikaCiacconaSoloConcertState.ts';

export const SIGRIKA_CIACCONA_CANONICAL_ENTRY_ADAPTER_ID = 'sigrika-ciaccona-canonical-entry-state-v1' as const;
export const SIGRIKA_CIACCONA_PENDING_EXECUTION_ID = 'team:ciaccona:solo-concert-aero-bonus-incoming-state-adapter' as const;

export interface SigrikaCiacconaCanonicalEntryState {
  readonly adapterId: typeof SIGRIKA_CIACCONA_CANONICAL_ENTRY_ADAPTER_ID;
  readonly presetId: 'sigrika-standard';
  readonly teamProfileId: 'sigrika-qiuyuan-ciaccona';
  readonly relativeEntrySeconds: 0;
  readonly soloConcert: SigrikaCiacconaSoloConcertProjection;
  readonly provesEntryStateOnly: true;
  readonly provesActionTimestamps: false;
}

export const SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW = Object.freeze({
  reviewId: 'SIGRIKA-CIACCONA-CANONICAL-ENTRY-2026-09-01-01',
  reviewedAt: '2026-09-01',
  adapterId: SIGRIKA_CIACCONA_CANONICAL_ENTRY_ADAPTER_ID,
  pendingExecutionId: SIGRIKA_CIACCONA_PENDING_EXECUTION_ID,
  sourceLabels: [
    'Prydwen — current Sigrika synergies',
    'Prydwen — current Ciaccona Solo Concert / Ensemble Sylph review',
    'Game8 — Sigrika / Qiuyuan / Ciaccona general rotation',
  ] as const,
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/sigrika',
    'https://www.prydwen.gg/wuthering-waves/characters/ciaccona',
    'https://game8.co/games/Wuthering-Waves/archives/507924',
  ] as const,
  sourceEstablished: [
    'Current Prydwen identifies Ciaccona as the best third-slot buffer alongside Qiuyuan for Sigrika.',
    'Current Prydwen says a Jump-cancelled Ciaccona Basic Attack Stage 4 generates an Ensemble Sylph, that Ensemble Sylph duration is permanent, and that Solo Concert grants the team 24% Aero DMG Bonus while the Sylph is present; the review therefore treats the resulting buff uptime as effectively permanent.',
    'The explicit Sigrika / Qiuyuan / Ciaccona team rotation published by Game8 starts with Ciaccona generating Ensemble Sylphs, switches Ciaccona to Qiuyuan via Outro, then switches Qiuyuan to Sigrika via Outro.',
    'Together these source statements prove Solo Concert active at Sigrika entry for this named team rotation without assigning an invented timed duration to Solo Concert itself.',
  ] as const,
  boundaries: [
    'This closure proves only the canonical team entry snapshot for Solo Concert; Ciaccona remains the owner of the underlying state.',
    'No Ciaccona engine implementation is modified and no generic Solo Concert timer is created.',
    'The closure does not prove Qiuyuan 14-second transfer coverage, Sigrika action timestamps, Solsworn/Sonata timed windows or the DPS denominator.',
    'If the canonical team order or Ciaccona source lifecycle changes, this adapter must fail closed rather than preserving the snapshot by assumption.',
  ] as const,
} as const);

function validateCanonicalTeam(): void {
  const preset = PROFILE_REGISTRY.presets.get('sigrika-standard');
  if (!preset) throw new Error('Missing canonical sigrika-standard preset');
  if (preset.teamProfileId !== 'sigrika-qiuyuan-ciaccona') {
    throw new Error(`sigrika-standard team drifted to ${preset.teamProfileId}`);
  }
  const team = PROFILE_REGISTRY.teams.get('sigrika-qiuyuan-ciaccona');
  if (!team) throw new Error('Missing canonical sigrika-qiuyuan-ciaccona team');
  if (team.verificationStatus !== 'VERIFIED') throw new Error('Canonical Sigrika team must remain VERIFIED');
  const ids = team.members.map((row) => row.characterId);
  if (ids.length !== 3 || ids[0] !== 'sigrika' || ids[1] !== 'qiuyuan' || ids[2] !== 'ciaccona') {
    throw new Error(`Canonical Sigrika team members drifted: ${ids.join(',')}`);
  }
}

/**
 * Resolve the source-proven Solo Concert state exactly at Sigrika's local entry
 * checkpoint. The local clock starts at 0 for Sigrika entry; this function does
 * not create any subsequent action timestamps.
 */
export function resolveSigrikaCiacconaCanonicalEntryState(): SigrikaCiacconaCanonicalEntryState {
  validateCanonicalTeam();
  const soloConcert = projectCiacconaSoloConcertForSigrika({
    kind: 'CIACCONA_SOLO_CONCERT_EXTERNAL_STATE',
    sourceCharacterId: 'ciaccona',
    active: true,
    observedAtSeconds: 0,
  });
  if (!soloConcert) throw new Error('Canonical Ciaccona Solo Concert entry snapshot failed closed');
  return Object.freeze({
    adapterId: SIGRIKA_CIACCONA_CANONICAL_ENTRY_ADAPTER_ID,
    presetId: 'sigrika-standard',
    teamProfileId: 'sigrika-qiuyuan-ciaccona',
    relativeEntrySeconds: 0,
    soloConcert,
    provesEntryStateOnly: true,
    provesActionTimestamps: false,
  });
}

export function validateSigrikaCiacconaCanonicalEntryContract(): readonly string[] {
  const issues: string[] = [];
  try {
    const state = resolveSigrikaCiacconaCanonicalEntryState();
    if (state.soloConcert.value !== 0.24) issues.push('canonical Ciaccona entry state must preserve +24% Aero DMG Bonus');
    if (state.soloConcert.extrapolatesBeyondSnapshot !== false) issues.push('canonical Ciaccona entry projection must not claim generic snapshot extrapolation');
  } catch (error) {
    issues.push(error instanceof Error ? error.message : String(error));
  }
  return Object.freeze(issues);
}

const CONTRACT_ISSUES = validateSigrikaCiacconaCanonicalEntryContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Sigrika Ciaccona canonical entry contract: ${CONTRACT_ISSUES.join('; ')}`);
}

export const SIGRIKA_CIACCONA_CANONICAL_ENTRY_STATE = resolveSigrikaCiacconaCanonicalEntryState();
