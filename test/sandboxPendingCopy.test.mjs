import test from 'node:test';
import assert from 'node:assert/strict';
import {sandboxPendingCopy} from '../docs/ui-lab/v1.1/modules/sandbox-pending.js';

test('server generic Pending stays generic and readable',()=>{
 const pending=sandboxPendingCopy(['CONFIGURATION_CAPABILITY_PENDING']);
 assert.match(pending.text,/Character, Weapon or Settings combination/);
 assert.doesNotMatch(pending.text,/Augusta only|choose another weapon|guaranteed/);
 assert.deepEqual(pending.codes,['CONFIGURATION_CAPABILITY_PENDING']);
});
test('server validation and execution Pending explain limits without fabricating results',()=>{
 assert.match(sandboxPendingCopy(['INVALID_SANDBOX_CONFIGURATION']).text,/server validation/);
 assert.match(sandboxPendingCopy(['PRIVATE_CAPABILITY_PENDING']).text,/cannot currently be executed/);
 assert.match(sandboxPendingCopy([]).text,/No simulation was performed/);
});
test('unknown or malformed reason is inert presentation text, not HTML',()=>{
 const copy=sandboxPendingCopy(['<img src=x onerror=alert(1)>','UNKNOWN_CODE','UNKNOWN_CODE']);
 assert.deepEqual(copy.codes,['UNKNOWN_CODE','UNKNOWN_CODE']);
 assert.equal(copy.text,'The local simulator has not enabled this configuration yet.');
});
