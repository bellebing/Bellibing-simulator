import { assertProfileReadinessAudit } from '../src/profileReadinessRegistry.ts';

const summary = assertProfileReadinessAudit();

console.log('Profile readiness / Pre-DPS freeze audit');
console.log(`released Characters: ${summary.releasedCharacterCount}`);
console.log(`PROFILE_COMPLETE_PENDING_FREEZE: ${summary.profileCompletePendingFreezeCount}`);
console.log(`CHARACTER_MECHANICS_SOURCE_BLOCKED: ${summary.characterMechanicsSourceBlockedCount}`);
console.log(`PROFILE_SOURCE_PENDING: ${summary.profileSourcePendingCount}`);
console.log(`DPS_READY: ${summary.dpsReadyCount}`);
console.log(`raw DPS blockers: ${summary.rawDpsBlockedCharacterIds.join(', ') || 'none'}`);
console.log(`intrinsic DPS blockers: ${summary.intrinsicDpsBlockedCharacterIds.join(', ') || 'none'}`);
console.log(`pre-DPS freeze ready: ${summary.preDpsFreezeReady ? 'YES' : 'NO — explicit profile/freeze backlog remains'}`);
