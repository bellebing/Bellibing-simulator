export type DamageTriggerClass = 'BASIC' | 'HEAVY' | 'ECHO';

/** Reviewed source phrases, not a parser for arbitrary trigger prose. */
export const DAMAGE_SOURCE_TRIGGERS: Readonly<Record<DamageTriggerClass, string>> = {
  BASIC: 'Deal Basic Attack DMG', HEAVY: 'Deal Heavy Attack DMG', ECHO: 'Deal Echo Skill DMG',
};

export interface QualifiedDamageEvent {
  readonly kind: 'DAMAGE_DEALT';
  readonly actorId: string;
  readonly damageClass: DamageTriggerClass;
  readonly atSeconds: number;
  /** The caller proved actual source-qualified damage, not a cast or expected hit. */
  readonly sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' | 'UNKNOWN';
}

export function matchesQualifiedDamageTrigger(ownerId: string, damageClass: DamageTriggerClass, event: QualifiedDamageEvent): boolean {
  if (!ownerId.trim() || !event.actorId.trim()) throw new Error('Explicit effect owner and damage actor are required.');
  if (!Number.isFinite(event.atSeconds) || event.atSeconds < 0) throw new Error('Damage time must be finite and non-negative.');
  if (event.kind !== 'DAMAGE_DEALT' || event.sourceTriggerQualification !== 'VERIFIED_DAMAGE_DEALT') {
    throw new Error('Actual source-qualified damage is required; a cast does not establish it.');
  }
  if (!Object.hasOwn(DAMAGE_SOURCE_TRIGGERS, event.damageClass)) throw new Error('Unsupported damage trigger class.');
  return event.actorId === ownerId && event.damageClass === damageClass;
}

export interface ExplicitDamageWindowQuery {
  readonly actorId: string;
  readonly atSeconds: number;
  readonly sameTimestampOrder: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER' | 'UNKNOWN';
}

/** Shared by Weapon/Sonata damage windows. Activation time alone cannot order the triggering hit. */
export function isExplicitDamageWindowActive(
  window: { readonly actorId: string; readonly startedAtSeconds: number; readonly expiresAtSeconds: number },
  query: ExplicitDamageWindowQuery,
): boolean {
  if (!query.actorId.trim() || !Number.isFinite(query.atSeconds) || query.atSeconds < 0) {
    throw new Error('Explicit actor and finite non-negative query time are required.');
  }
  if (query.atSeconds === window.startedAtSeconds) {
    if (query.sameTimestampOrder !== 'BEFORE_TRIGGER' && query.sameTimestampOrder !== 'AFTER_TRIGGER') {
      throw new Error('Same-timestamp damage/trigger ordering is unresolved.');
    }
    if (query.sameTimestampOrder === 'BEFORE_TRIGGER') return false;
  }
  return query.actorId === window.actorId && query.atSeconds >= window.startedAtSeconds && query.atSeconds < window.expiresAtSeconds;
}
