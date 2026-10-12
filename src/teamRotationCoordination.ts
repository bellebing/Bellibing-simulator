import { CHARACTER_CATALOG } from './data/characters.ts';
import { TEAM_AWARE_ROTATION_REFERENCES } from './data/teamAwareRotationReferences.ts';
import { TEAM_ROTATION_CASES, TEAM_ROTATION_PATTERNS, TEAM_ROTATION_PROOFS, ROTATION_PARTICIPATION, ROTATION_PARTICIPATION_DESCRIPTIONS } from './data/teamRotationCoordination.ts';
import { findTeamAwareRotationReferences } from './teamAwareRotationReferences.ts';
import type { TeamRotationCoordinationInput, TeamRotationPatternId, TeamRotationRole } from './teamRotationCoordinationDomain.ts';

const released = new Set(CHARACTER_CATALOG.filter(row => row.releaseStatus === 'RELEASED').map(row => row.id));
const referenceById = new Map(TEAM_AWARE_ROTATION_REFERENCES.map(row => [row.id, row]));
const participationById = new Map(ROTATION_PARTICIPATION.map(row => [row.referenceId, row]));

/** Source-backed description and reference choice, never an action scheduler. */
export function coordinateTeamRotation(input: TeamRotationCoordinationInput) {
  if (!input?.members || input.members.length !== 3 || new Set(input.members.map(row => row.characterId)).size !== 3 || input.members.some(row => !released.has(row.characterId))) {
    throw new Error('Team coordination requires three unique released Characters.');
  }
  const party = input.members.map(row => row.characterId);
  const contains = (ids: readonly string[]) => ids.every(id => party.includes(id));
  for (const member of input.members) {
    if (member.role !== undefined && !['DPS', 'SUB_DPS', 'SUPPORT', 'FLEX'].includes(member.role)) throw new Error('Unknown declared team role.');
    if (member.modeKey !== undefined && !member.modeKey.trim()) throw new Error('Mode key cannot be blank.');
    if (member.referenceId !== undefined && referenceById.get(member.referenceId)?.characterId !== member.characterId) throw new Error('Selected rotation reference must belong to its member.');
  }
  const partyCases = TEAM_ROTATION_CASES.filter(row => contains(row.requiredCharacters) && !row.excludedCombinations.some(contains));
  const requestedModes = (id: string): readonly string[] | null => {
    const member = input.members.find(row=>row.characterId===id);
    if (member?.modeKey !== undefined) return [member.modeKey];
    const modes = member?.referenceId ? referenceById.get(member.referenceId)?.context.modeKeys : null;
    return modes?.length ? modes : null;
  };
  const modeMatches = (row: typeof TEAM_ROTATION_CASES[number]) => row.requiresExplicitModes.every(id=>requestedModes(id)!==null)
    && Object.entries(row.modeRequirements).every(([id,modes])=>requestedModes(id)===null || requestedModes(id)!.some(mode=>modes.includes(mode)));
  // Specificity is context matching only, not power/recommendation rank.
  const cases = partyCases.filter(modeMatches).sort((a,b) => b.requiredCharacters.length - a.requiredCharacters.length || a.id.localeCompare(b.id));
  const selectedCase = cases[0] ?? null;
  const info: { code: string; characterId: string | null; messageSv: string }[] = [];
  for (const row of partyCases.filter(row => !selectedCase && Object.entries(row.modeRequirements).some(([id,modes])=>requestedModes(id)!==null && !requestedModes(id)!.some(mode=>modes.includes(mode))))) info.push({code:'SOURCE_MODE_DIFFERS',characterId:null,messageSv:'Det valda modet skiljer sig från guidefallet för de här partnerna.'});
  const members = input.members.map(member => {
    const hint = selectedCase?.members.find(row => row.characterId === member.characterId);
    const matches = findTeamAwareRotationReferences(member.characterId, {teamCharacterIds:party,
      ...(member.modeKey === undefined ? {} : {modeKey:member.modeKey}),
      ...(member.introAvailable === undefined ? {} : {introAvailable:member.introAvailable})});
    if (!matches.length) info.push({code:'REFERENCE_NOT_FOUND',characterId:member.characterId,messageSv:'Ingen grundreferens matchar den valda mode- och partnerkontexten.'});
    const active = matches.filter(row => !['OPENER','PREPARATION'].includes(row.reference.phase));
    const preferred = hint?.referenceHints.filter(id => active.some(row => row.reference.id === id)) ?? [];
    const baseline = active.filter(row => row.reference.scope === 'BASELINE' || row.reference.scope === 'PRIORITY_GUIDANCE').map(row => row.reference.id);
    const suggested = preferred.length ? preferred : baseline.length ? baseline : member.modeKey !== undefined ? active.map(row => row.reference.id) : [];
    const chosenId = member.referenceId ?? (suggested.length === 1 ? suggested[0] : null);
    const chosen = chosenId ? referenceById.get(chosenId)! : null;
    const chosenMatch = chosenId ? matches.find(row=>row.reference.id===chosenId) : null;
    const compatible = chosenId ? chosenMatch !== undefined && chosenMatch !== null : true;
    if (chosenMatch?.needsReview.includes('MODE') && !hint?.modeHint) info.push({code:'SOURCE_MODE_UNCONFIRMED',characterId:member.characterId,messageSv:'Den föreslagna referensen hör till ett namngivet mode; spelarens mode är ännu inte specificerat.'});
    if (!compatible) info.push({code:'REFERENCE_CONTEXT_DIFFERS',characterId:member.characterId,messageSv:'Den valda referensen verkar höra till ett annat mode, Intro- eller partnerfall. Valet visas men används inte för den explicita träffbryggan.'});
    if (chosenId && hint && !hint.referenceHints.includes(chosenId)) info.push({code:'REFERENCE_VARIANT_DIFFERS',characterId:member.characterId,messageSv:'Den valda rotationen är en annan variant än teamförklaringens grundreferens. Teamtypen kan fortfarande vara relevant, men detaljerna skiljer sig.'});
    if (!member.referenceId && suggested.length > 1) info.push({code:'REFERENCE_CHOICE_NEEDED',characterId:member.characterId,messageSv:'Flera grundreferenser passar; exempelvis vapen, Intro eller carry-over avgör vilken som används.'});
    if (hint?.modeHint && member.modeKey === undefined) info.push({code:'SOURCE_MODE_HINT',characterId:member.characterId,messageSv:`Guidens teamfall använder ${hint.modeHint}; spelarens mode är ännu inte valt.`});
    if (member.role && hint && member.role !== hint.roleHint) info.push({code:'DECLARED_ROLE_DIFFERS',characterId:member.characterId,messageSv:'Spelarens rollfördelning skiljer sig från detta guidefall; den breda teamförklaringen behöver då granskas.'});
    if (chosen?.context.conditions.length) info.push({code:'GUIDE_CONDITIONS',characterId:member.characterId,messageSv:chosen.context.conditions.join(' ')});
    const participation = chosenId ? participationById.get(chosenId)?.participation ?? null : null;
    if (participation === 'REENTRY') info.push({code:'MEMBER_REENTRY',characterId:member.characterId,messageSv:'Referensen innehåller ett återinträde efter partnerarbete. Den ska inte spelas som ett enda oavbrutet fönster.'});
    const role: TeamRotationRole | null = member.role ?? hint?.roleHint ?? null;
    return {characterId:member.characterId,modeKey:member.modeKey ?? null,sourceModeHint:hint?.modeHint ?? null,
      role,roleBasis:member.role ? 'PLAYER_DECLARED' as const : hint ? 'SOURCE_CASE_HINT' as const : 'UNSPECIFIED' as const,
      referenceId:chosenId,referenceBasis:member.referenceId ? 'PLAYER_SELECTED' as const : chosenId ? 'SOURCE_SUGGESTION' as const : 'CHOICE_NEEDED' as const,
      contextCompatible:compatible,contextNeedsReview:chosenMatch?.needsReview ?? [],candidateReferenceIds:active.map(row => row.reference.id),suggestedReferenceIds:suggested,
      preparationReferenceIds:matches.filter(row => ['OPENER','PREPARATION'].includes(row.reference.phase)).map(row => row.reference.id),participation,
      participationExplanation:participation ? ROTATION_PARTICIPATION_DESCRIPTIONS[participation] : null};
  });
  let patternId: TeamRotationPatternId = selectedCase?.patternId ?? 'MEMBER_GUIDANCE_ONLY';
  let descriptionBasis: 'REVIEWED_SOURCE_CASE' | 'PLAYER_ROLE_SYNTHESIS' | 'MEMBER_REFERENCES_ONLY' = selectedCase ? 'REVIEWED_SOURCE_CASE' : 'MEMBER_REFERENCES_ONLY';
  if (!selectedCase && members.every(row => row.role !== null && row.role !== 'FLEX')) {
    const primaries = members.filter(row => row.role === 'DPS').length;
    if (primaries === 1) patternId = members.some(row => row.role === 'DPS' && row.participation === 'REENTRY') ? 'CARRY_REENTRY' : 'SINGLE_CARRY';
    else if (primaries > 1) patternId = 'SHARED_FIELD_TIME';
    if (patternId !== 'MEMBER_GUIDANCE_ONLY') descriptionBasis = 'PLAYER_ROLE_SYNTHESIS';
  }
  const pattern = TEAM_ROTATION_PATTERNS.find(row => row.id === patternId)!;
  const broadFlowSv = selectedCase?.broadFlowSv ?? (patternId === 'MEMBER_GUIDANCE_ONLY' ? [] : ['Partnernas förberedelser och fälttid samordnas','De valda skadefönstren följer karaktärernas referenser']);
  if (!selectedCase) info.push({code:'TEAM_FLOW_NOT_SOURCE_CONFIRMED',characterId:null,messageSv:'Den här kombinationen har inget granskat fullständigt teamfall. En typ från deklarerade roller är en strukturell beskrivning, inte en bekräftad guidecykel.'});
  if (selectedCase?.partyEvidence === 'PARTNER_CONTEXT') info.push({code:'PARTIAL_PARTNER_CONTEXT',characterId:null,messageSv:'Källan stöder partnerfallet, men fastställer inte hela tredje medlemmens rotation.'});
  for (const messageSv of selectedCase?.infoSv ?? []) info.push({code:'SOURCE_VARIANT_NOTE',characterId:null,messageSv});
  return structuredClone({scope:'BROAD_TEAM_ROTATION_DESCRIPTION' as const,party,pattern,descriptionBasis,
    sourceCaseId:selectedCase?.id ?? null,matchingCaseIds:cases.map(row=>row.id),partyEvidence:selectedCase?.partyEvidence ?? null,
    descriptionStatus:selectedCase && info.some(row=>['SOURCE_MODE_DIFFERS','REFERENCE_VARIANT_DIFFERS','REFERENCE_CONTEXT_DIFFERS','DECLARED_ROLE_DIFFERS'].includes(row.code)) ? 'SOURCE_CASE_WITH_DIFFERENCES' as const : selectedCase ? 'SOURCE_CASE_DESCRIPTION' as const : 'UNCONFIRMED_TEAM_DESCRIPTION' as const,
    summarySv:selectedCase?.summarySv ?? pattern.summarySv,broadFlowSv,flowPrecision:'WINDOWS_NOT_ACTION_TIMELINE' as const,members,info,
    proofs:TEAM_ROTATION_PROOFS.filter(row=>selectedCase?.proofIds.includes(row.id)),
    teamDpsReady:false as const,rotationDps:null,authorizesUpgradeVerdict:false as const});
}
export type CoordinatedTeamRotation = ReturnType<typeof coordinateTeamRotation>;
