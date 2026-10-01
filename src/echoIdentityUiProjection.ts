import { ECHO_CATALOG } from './data/echoes.ts';
import { ECHO_SKILL_RAW } from './data/echoSkillRaw.ts';
import { ECHO_SKILL_SOURCE_REVIEW_V36 } from './data/echoSkillSourceReview.ts';

export interface EchoIdentityUi {
  echoId: string;
  displayName: string;
  skillDescription: string;
  cooldownSeconds: number | null;
  sourceStatus: 'VERIFIED' | 'PENDING_SOURCE_VERIFICATION';
}

const pending = 'Echo Skill data pending source verification.';

function renderSkill(template: string, values: readonly string[]): string {
  let text = template.replace(/\{Cus:Ipt,Touch=Tap PC=Press Gamepad=Press\}/g, 'Press');
  text = text.replace(/<SapTag=(\d+)>(\{\d+\})<\/SapTag>\s*\{Cus:Sap,S=([^ ]+) P=([^ ]+) SapTag=\1\}/g,
    (_match, tag: string, placeholder: string, singular: string, plural: string) => {
      const index = Number(placeholder.slice(1, -1));
      const value = values[index];
      if (value === undefined || !Number.isFinite(Number(value))) throw new Error(`Invalid plural parameter ${tag}/${index}`);
      return `${value} ${Number(value) === 1 ? singular : plural}`;
    });
  text = text.replace(/<\/?(?:color|SapTag)(?:=[^>]+)?>/g, '');
  text = text.replace(/\{(\d+)\}/g, (_match, index: string) => {
    const value = values[Number(index)];
    if (value === undefined) throw new Error(`Missing Echo Skill Rank-5 parameter ${index}`);
    return value;
  });
  if (/[{}<>]/.test(text)) throw new Error('Unresolved Echo Skill source markup.');
  return text.replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]*\n[ \t]*\n/g, '\n\n').trim();
}

/** Display-only Rank-5 projection. No cast, damage, uptime or main-slot execution. */
export function projectEchoIdentityUiCatalog(): EchoIdentityUi[] {
  const rawById = new Map<string, (typeof ECHO_SKILL_RAW)[number]>(ECHO_SKILL_RAW.map(row => [row.echoId, row]));
  if (rawById.size !== ECHO_SKILL_RAW.length) throw new Error('Duplicate Echo Skill source identity.');
  const released = ECHO_CATALOG.filter(echo => echo.releaseStatus === 'RELEASED');
  if (released.length !== ECHO_SKILL_SOURCE_REVIEW_V36.expectedReleasedEchoCount) throw new Error('Released Echo roster drift.');
  const result = released.map(echo => {
    const raw = rawById.get(echo.id);
    if (!raw) return { echoId: echo.id, displayName: echo.name, skillDescription: pending, cooldownSeconds: null, sourceStatus: 'PENDING_SOURCE_VERIFICATION' as const };
    if (raw.name !== echo.name) throw new Error(`Echo Skill identity mismatch: ${echo.id}`);
    const cooldownToken = raw.descriptionTemplate.match(/\b(?:CD|Cooldown):?\s*\{(\d+)\}s/i);
    const cooldownSeconds = cooldownToken ? Number(raw.rank5Params[Number(cooldownToken[1])]) : NaN;
    if (!Number.isFinite(cooldownSeconds) || cooldownSeconds <= 0) throw new Error(`Unverified Echo Skill cooldown: ${echo.id}`);
    return {
      echoId: echo.id,
      displayName: echo.name,
      skillDescription: renderSkill(raw.descriptionTemplate, raw.rank5Params),
      cooldownSeconds,
      sourceStatus: 'VERIFIED' as const,
    };
  });
  if (rawById.size !== result.filter(row => row.sourceStatus === 'VERIFIED').length) throw new Error('Orphan Echo Skill source identity.');
  return result;
}
