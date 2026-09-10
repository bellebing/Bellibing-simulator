import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';
import { buildProfileAdapterDependencyMatrix } from '../src/profileAdapterDependencyMatrix.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { evaluateEchoActiveHit } from '../src/combat/echoActiveHitAdapter.ts';
import { activateEchoTransferWindow } from '../src/combat/echoTransferWindowAdapter.ts';
import { activateStellarSymphonyTeamAtkWindow } from '../src/combat/shorekeeperHealingSupportWindowAdapter.ts';

test('reconciled execution edges bind existing profile equipment to actual callable primitives without closing IDs', () => {
  const queue = buildProfileExecutionWorkQueue();
  const bindings = [
    ['calcharo-standard', 'echo:echo-60000885:nightmare-thundering-mephis-active-skill-damage-adapter', 'echo-active-explicit-hit-v1'],
    ['denia-fusion-burst-aemeath', 'echo:echo-60002005:reminiscence-denia-outro-transfer-adapter', 'echo-transfer-window-v1'],
    ['shorekeeper-augusta-support', 'weapon:stellar-symphony:SSY-TEAM-ATK:healing-skill-team-uptime-adapter', 'shorekeeper-healing-support-team-windows-v1'],
  ];
  for (const [presetId, id, primitiveId] of bindings) {
    const preset = PROFILE_CATALOGS.presets.find((row) => row.id === presetId)!;
    assert.ok(preset);
    const echo = PROFILE_CATALOGS.echoLoadouts.find((row) => row.id === preset.echoLoadoutProfileId)!;
    const weapon = PROFILE_CATALOGS.weaponRecommendations.find((row) => row.id === preset.weaponRecommendationProfileId)!;
    if (id.startsWith('echo:')) assert.equal(echo.mainEchoId, id.split(':')[1]);
    else assert.equal(weapon.defaultWeaponId, 'stellar-symphony');
    const edge = queue.edges.find((row) => row.presetId === presetId && row.pendingExecutionId === id)!;
    assert.equal(edge.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
    assert.equal(edge.primitiveId, primitiveId);
  }
  const hit = evaluateEchoActiveHit({ echoId: 'echo-60000885', attackId: 'NIGHTMARE_THUNDERING_MEPHIS_ACTIVE_STRIKE',
    rank: 5, componentIndex: 0, landedHitCount: 1,
    snapshot: { damageClass: 'ECHO', element: 'Electro', scalingStat: 'ATK', totalScalingStat: 1000,
      damageBonus: 0, amplification: 0, critRate: 0, critDamage: 1.5, defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0 } });
  assert.equal(hit.expectedDamage, 4050);
  const transfer = activateEchoTransferWindow({ effectId: 'REMINISCENCE_DENIA_INCOMING_FUSION', wielderId: 'denia',
    armEvent: { kind: 'ECHO_SKILL_SUMMON', echoId: 'echo-60002005', actorId: 'denia', atSeconds: 2 },
    outroEvent: { kind: 'OUTRO_SWITCH', actorId: 'denia', incomingResonatorId: 'aemeath', incomingEntry: 'DIRECT_SWITCH', atSeconds: 3 } })!;
  assert.equal(transfer.incomingResonatorId, 'aemeath');
  assert.equal(transfer.expiresAtSeconds, 18);
  const healing = activateStellarSymphonyTeamAtkWindow({
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: 'the-shorekeeper', healingSourceFactId: 'the-shorekeeper-skill-chaos-theory-healing', atSeconds: 2 },
    selectedWeapon: { id: 'stellar-symphony', rank: 1 }, teamMemberIds: ['the-shorekeeper', 'iuno', 'augusta'],
  })!;
  assert.equal(healing.effectId, 'SSY-TEAM-ATK');
  assert.equal(healing.expiresAtSeconds, 32);
  assert.deepEqual(queue.edges.map((row) => row.pendingExecutionId).sort(), buildProfileAdapterDependencyMatrix().edges.map((row) => row.pendingExecutionId).sort());
  assert.equal(queue.edges.find((row) => row.pendingExecutionId === 'echo:echo-60001985:voidwing-moth-outro-transfer-adapter')?.semanticStatus, 'UNREVIEWED');
});

test('Blazing Justice reviewed trigger conflict remains blocked instead of resembling a safe unreviewed cast family', () => {
  const queue = buildProfileExecutionWorkQueue();
  for (const effectId of ['BJ-DEF', 'BJ-FRAZZLE']) {
    const source = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === effectId)!;
    assert.equal(source.mechanicsStatus, 'VERIFIED_RAW_PENDING_MODEL');
    assert.match(source.trigger, /Basic Attack vs Resonance Liberation/);
    const edge = queue.edges.find((row) => row.pendingExecutionId === `weapon:blazing-justice:${effectId}:trigger-uptime-adapter`)!;
    assert.equal(edge.semanticStatus, 'BLOCKED_SOURCE_CONFLICT');
    assert.equal(edge.primitiveId, null);
    assert.equal(edge.blockerId, 'source-conflict:blazing-justice-trigger');
    assert.equal(queue.actionableSharedQueue.some((group) => group.pendingExecutionIds.includes(edge.pendingExecutionId)), false);
  }
});
