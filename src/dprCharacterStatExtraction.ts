import { CHARACTER_CATALOG } from './data/characters.ts';
import { CHARACTER_RECOMMENDATION_UNITS } from './characterRecommendationDomain.ts';
import type { CharacterRecommendationMetric, DprReferenceRole, RecommendationUnit } from './characterRecommendationDomain.ts';
import { improvePolicySourceBinding } from './improvePolicySources.ts';

export const DPR_SPREADSHEET_ID = '1eoCTrwYIsRpacvL3KrcQpR5rwY3pbJ6gEljZdBj_DHs';
export const DPR_SPREADSHEET_TITLE = 'DPR Calc Results';
export const DPR_NORMALIZATION_VERSION = 'DPR_NATIVE_SEMANTIC_V1';

export interface NativeCell {
  readonly formattedValue?: string;
  readonly effectiveValue?: { readonly numberValue?: number; readonly stringValue?: string; readonly errorValue?: unknown };
  readonly userEnteredValue?: { readonly numberValue?: number; readonly stringValue?: string; readonly formulaValue?: string };
  readonly note?: string;
}
export interface NativeDprSnapshot {
  readonly spreadsheetId: string;
  readonly spreadsheetTitle: string;
  readonly extractionDate: string;
  readonly scanMethod: 'NATIVE_SHEETS_FULL_GRID';
  readonly sheets: readonly {
    readonly sheetId: number; readonly sheetTitle: string; readonly hidden: boolean;
    readonly scanRange: string; readonly origin: NativeCell | null;
    readonly sections: readonly {
      readonly header: { readonly row: number; readonly column: number; readonly label: string };
      readonly rows: readonly { readonly row: number; readonly label: NativeCell; readonly value: NativeCell }[];
    }[];
  }[];
}

const ALIASES: Readonly<Record<string, string>> = {
  xuanling: 'yangyang-xuanling', luuk: 'luuk-herssen', cartethiya: 'cartethyia',
  xly: 'xiangli-yao', aerover: 'rover-aero', ciaconna: 'ciaccona',
};
const VARIANTS: Readonly<Record<string, readonly [string, string]>> = {
  'Aemeath (Fusion Burst)': ['aemeath', 'FUSION_BURST'],
  'Aemeath (Rupture)': ['aemeath', 'RUPTURE'],
  'Qiuyuan 2x Forte': ['qiuyuan', 'TWO_FORTE'],
  'Qiuyuan MDPS(WIP EN TL)': ['qiuyuan', 'MDPS_WIP_EN_TL'],
  'Galbrena (WIP EN TL)': ['galbrena', 'WIP_EN_TL'],
  'Iuno MDPS (WIP)': ['iuno', 'MDPS_WIP'],
};
/** Inventory is dynamic. This table resolves identities, never selects tabs to ingest. */
export function mapDprCharacterTab(title: string): { characterId: string; variantKey: string } | null {
  const explicit = VARIANTS[title];
  if (explicit) return { characterId: explicit[0], variantKey: explicit[1] };
  const base = title.replace(/\s*\(WIP\)$/, '').trim().toLowerCase();
  const matches = CHARACTER_CATALOG.filter(c => c.id === ALIASES[base] || c.name.toLowerCase() === base || c.id === base);
  return matches.length === 1 ? { characterId: matches[0]!.id, variantKey: 'DEFAULT' } : null;
}
const METRICS: Readonly<Record<string, CharacterRecommendationMetric>> = {
  'Crit Rate': 'TOTAL_CRIT_RATE', 'Crit Damage': 'TOTAL_CRIT_DAMAGE',
  'Total ATK': 'TOTAL_ATK', 'Total HP': 'TOTAL_HP', 'Total DEF': 'TOTAL_DEF',
  ER: 'TOTAL_ENERGY_REGEN', 'Minimum ER': 'TOTAL_ENERGY_REGEN',
  'BA DMG%': 'BASIC_ATTACK_DMG_BONUS', 'HA DMG%': 'HEAVY_ATTACK_DMG_BONUS',
  'Heavy DMG%': 'HEAVY_ATTACK_DMG_BONUS', 'Skill DMG%': 'RESONANCE_SKILL_DMG_BONUS',
  'Lib DMG%': 'RESONANCE_LIBERATION_DMG_BONUS',
};
export function typeDprStatLabel(label: string) {
  const match = /^(.*?)\s*(?:\(([^()]*)\))?\s*$/.exec(label)!;
  return { metric: METRICS[match[1]!.trim()] ?? null, configurationContext: match[2] ?? null };
}
function a1(row: number, column: number) {
  let letters = ''; for (let n = column + 1; n > 0; n = Math.floor((n - 1) / 26)) letters = String.fromCharCode(65 + (n - 1) % 26) + letters;
  return letters + (row + 1);
}
function role(label: string): DprReferenceRole | null {
  if (label.trim().toLowerCase() === 'general stat recommendation') return 'GENERAL_RECOMMENDATION';
  if (label.trim().toLowerCase() === 'stats used for calcs') return 'CALC_BENCHMARK';
  return null;
}
function cellText(cell: NativeCell) { return cell.effectiveValue?.stringValue ?? cell.formattedValue ?? ''; }
function provenance(cell: NativeCell) {
  return { formattedValue: cell.formattedValue ?? null, effectiveValue: cell.effectiveValue ?? null,
    rawValue: cell.userEnteredValue ?? null, formula: cell.userEnteredValue?.formulaValue ?? null,
    note: cell.note ?? null };
}
export interface DprExtractedRow {
  readonly spreadsheetId: string; readonly spreadsheetTitle: string;
  readonly sheetId: number; readonly sheetTitle: string;
  readonly sectionRole: DprReferenceRole; readonly sectionLabel: string; readonly sectionCell: string;
  readonly characterId: string; readonly variantKey: string;
  readonly sourceRange: string; readonly labelCell: string; readonly valueCell: string;
  readonly originalStatLabel: string; readonly metric: CharacterRecommendationMetric;
  readonly formattedValue: string | null; readonly effectiveValue: NativeCell['effectiveValue'] | null;
  readonly rawValue: NativeCell['userEnteredValue'] | null; readonly formula: string | null;
  readonly labelProvenance: ReturnType<typeof provenance>;
  readonly normalizedNumericValue: number | null; readonly unit: RecommendationUnit;
  readonly configurationContext: string | null;
  readonly sourceNotes: readonly { readonly cell: string; readonly text: string; readonly formula: string | null }[];
  readonly contextMarkers: readonly string[];
  readonly origin: ReturnType<typeof provenance> | null;
  readonly extractionStatus: 'MAPPED_NUMERIC' | 'UNAVAILABLE';
}
export interface DprExtraction {
  readonly normalizationVersion: string; readonly extractionDate: string;
  readonly spreadsheetId: string; readonly spreadsheetTitle: string;
  readonly sourceClass: 'USER_APPROVED_PROJECT_SOURCE';
  readonly sheetInventory: readonly { readonly sheetId: number; readonly sheetTitle: string;
    readonly hidden: boolean; readonly sectionHeaders: readonly { readonly cell: string; readonly label: string }[] }[];
  readonly rows: readonly DprExtractedRow[];
  readonly issues: readonly { readonly sheetId: number; readonly sheetTitle: string; readonly sourceRange: string | null; readonly reason: string }[];
  readonly counts: { readonly discoveredSheetCount: number; readonly characterSourceSheetCount: number;
    readonly characterIdentityCount: number; readonly characterVariantCount: number;
    readonly mappedNumericRows: number; readonly unavailableRows: number; readonly ambiguousSkippedRows: number };
  readonly semanticSha256: string;
}

/** Hash the normalized semantic payload only; excludes its digest and capture date.
 * Native spreadsheet identity, inventory, relevant cell precision, wording, formula,
 * typing, mapping and context remain pinned. Transport bytes/metadata never enter it.
 */
export async function dprSemanticBinding(extraction: Omit<DprExtraction, 'semanticSha256'> | DprExtraction): Promise<string> {
  const { extractionDate: _date, semanticSha256: _digest, ...semantic } = extraction as DprExtraction;
  return improvePolicySourceBinding(semantic);
}
export async function extractDprCharacterStatReferences(snapshot: NativeDprSnapshot): Promise<DprExtraction> {
  if (snapshot.spreadsheetId !== DPR_SPREADSHEET_ID || snapshot.spreadsheetTitle !== DPR_SPREADSHEET_TITLE
    || snapshot.scanMethod !== 'NATIVE_SHEETS_FULL_GRID'
    || new Set(snapshot.sheets.map(s => s.sheetId)).size !== snapshot.sheets.length) throw new Error('Invalid native DPR source identity or inventory.');
  const rows: DprExtractedRow[] = [];
  const issues: DprExtraction['issues'][number][] = [];
  const sheetInventory: DprExtraction['sheetInventory'][number][] = [];
  let characterSourceSheetCount = 0;
  for (const sheet of [...snapshot.sheets].sort((a,b) => a.sheetId - b.sheetId)) {
    const sections = [...sheet.sections].sort((a,b) => a.header.row - b.header.row || a.header.column - b.header.column);
    sheetInventory.push({ sheetId: sheet.sheetId, sheetTitle: sheet.sheetTitle, hidden: sheet.hidden,
      sectionHeaders: sections.map(s => ({ cell: a1(s.header.row,s.header.column), label: s.header.label })) });
    if (!sections.length) continue;
    characterSourceSheetCount++;
    const identity = mapDprCharacterTab(sheet.sheetTitle);
    if (!identity) { issues.push({ sheetId: sheet.sheetId, sheetTitle: sheet.sheetTitle, sourceRange: null,
      reason: 'Unmapped Character/variant tab; no inference.' }); continue; }
    for (const section of sections) {
      const sectionRole = role(section.header.label);
      const { row: headerRow, column } = section.header;
      if (!sectionRole || cellText(section.rows[0]?.label ?? {}) !== section.header.label
        || section.rows[0]?.row !== headerRow || section.rows[1]?.row !== headerRow + 1
        || cellText(section.rows[1]?.label ?? {}).trim() !== 'Stat'
        || section.rows.some((r,i) => r.row !== headerRow+i)) {
        issues.push({ sheetId: sheet.sheetId, sheetTitle: sheet.sheetTitle, sourceRange: a1(headerRow,column),
          reason: 'Unsupported explicit stat-section structure.' }); continue;
      }
      const sourceNotes: DprExtractedRow['sourceNotes'][number][] = [];
      const statRows: DprExtractedRow[] = [];
      for (const r of section.rows.slice(2)) {
        const originalStatLabel = cellText(r.label);
        const { metric, configurationContext } = typeDprStatLabel(originalStatLabel);
        const labelCell = a1(r.row,column), valueCell = a1(r.row,column+1);
        if (!metric) {
          // Only observed guidance shapes with no numeric value are notes.
          if (/^(Your goal is to get around |Ignore BA DMG in Echo Mode$)/.test(originalStatLabel)
            && r.value.effectiveValue?.numberValue === undefined) {
            sourceNotes.push({ cell: labelCell, text: originalStatLabel, formula: r.label.userEnteredValue?.formulaValue ?? null });
          } else issues.push({ sheetId: sheet.sheetId, sheetTitle: sheet.sheetTitle, sourceRange: labelCell+':'+valueCell,
            reason: 'Unknown stat label: '+originalStatLabel });
          continue;
        }
        const number = r.value.effectiveValue?.numberValue;
        const numeric = typeof number === 'number' && Number.isFinite(number) ? number : null;
        if (numeric === null && (r.value.effectiveValue !== undefined || r.value.userEnteredValue !== undefined)) {
          issues.push({ sheetId: sheet.sheetId, sheetTitle: sheet.sheetTitle, sourceRange: labelCell+':'+valueCell,
            reason: 'Non-numeric/unresolved stat value; remains unavailable.' });
        }
        for (const [cell,c] of [[labelCell,r.label],[valueCell,r.value]] as const) if(c.note) sourceNotes.push({cell,text:c.note,formula:null});
        statRows.push({ spreadsheetId: snapshot.spreadsheetId, spreadsheetTitle: snapshot.spreadsheetTitle,
          sheetId: sheet.sheetId, sheetTitle: sheet.sheetTitle, sectionRole, sectionLabel: section.header.label,
          sectionCell: a1(headerRow,column), ...identity, sourceRange: labelCell+':'+valueCell, labelCell, valueCell,
          originalStatLabel, metric, formattedValue: r.value.formattedValue ?? null,
          effectiveValue: r.value.effectiveValue ?? null, rawValue: r.value.userEnteredValue ?? null,
          formula: r.value.userEnteredValue?.formulaValue ?? null, labelProvenance: provenance(r.label),
          normalizedNumericValue: numeric, unit: CHARACTER_RECOMMENDATION_UNITS[metric], configurationContext,
          sourceNotes, contextMarkers: sheet.sheetTitle.includes('WIP') ? ['WIP', ...(sheet.sheetTitle.includes('EN TL') ? ['EN_TL'] : [])] : [],
          origin: sheet.origin ? provenance(sheet.origin) : null, extractionStatus: numeric === null ? 'UNAVAILABLE' : 'MAPPED_NUMERIC' });
      }
      rows.push(...statRows);
    }
  }
  const payload: Omit<DprExtraction,'semanticSha256'> = {
    normalizationVersion: DPR_NORMALIZATION_VERSION, extractionDate: snapshot.extractionDate,
    spreadsheetId: snapshot.spreadsheetId, spreadsheetTitle: snapshot.spreadsheetTitle,
    sourceClass: 'USER_APPROVED_PROJECT_SOURCE', sheetInventory, rows, issues,
    counts: { discoveredSheetCount: snapshot.sheets.length, characterSourceSheetCount,
      characterIdentityCount: new Set(rows.map(r => r.characterId)).size,
      characterVariantCount: new Set(rows.map(r => r.characterId+':'+r.variantKey)).size,
      mappedNumericRows: rows.filter(r => r.extractionStatus === 'MAPPED_NUMERIC').length,
      unavailableRows: rows.filter(r => r.extractionStatus === 'UNAVAILABLE').length, ambiguousSkippedRows: issues.length },
  };
  return { ...payload, semanticSha256: await dprSemanticBinding(payload) };
}
