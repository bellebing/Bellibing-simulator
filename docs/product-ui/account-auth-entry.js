import {createFirebaseAccountClient} from '../../src/firebaseAccountClient.mjs';
import {onAuthStateChanged} from 'firebase/auth';
import {firebaseConfig} from './firebase-web-config.js';
let client = null;
let user = null;
let busy = false;
let panel;
function buttons() { return document.querySelectorAll('[data-prototype-auth]'); }
function render() {
  buttons().forEach(button => {
    button.disabled = busy;
    button.textContent = busy ? 'Connecting...' : user ? (user.displayName || user.email || 'Google account') : 'Logga in';
  });
}
function message(text) {
  if (!panel) {
    panel = document.createElement('section');
    panel.className = 'prototype-import prototype-account';
    panel.setAttribute('aria-label', 'Google account');
    const header = document.createElement('header');
    const title = document.createElement('h2'); title.textContent = 'Account';
    const close = document.createElement('button'); close.type = 'button'; close.textContent = '\u00d7'; close.setAttribute('aria-label', 'Close account'); close.onclick = () => {panel.hidden = true;};
    header.append(title, close);
    const status = document.createElement('p'); status.setAttribute('role', 'status');
    const signOut = document.createElement('button'); signOut.className = 'bc-import-action'; signOut.type = 'button'; signOut.textContent = 'Sign out'; signOut.dataset.authSignout = '';
    signOut.onclick = async () => {try { await client.signOut(); panel.hidden = true; } catch (error) {message(error.message);} };
    panel.append(header, status, signOut); document.body.append(panel);
    document.addEventListener('keydown', event => {if(event.key === 'Escape') panel.hidden = true;});
  }
  panel.querySelector('[role=status]').textContent = text;
  panel.querySelector('[data-auth-signout]').hidden = !user;
  panel.hidden = false;
}
function initialize() {
  if (client) return;
  // Explicitly authorized Firebase project. No sync.run(), Firestore reads/writes,
  // account binding, build migration or Analytics is started by this test entry.
  client = createFirebaseAccountClient({config: firebaseConfig, allowProduction: true, name: 'bellibing-prototype-auth'});
  onAuthStateChanged(client.auth, next => {user = next; render();});
}
const errors = {
  'auth/unauthorized-domain': 'This preview address is not authorized in Firebase Authentication. Add localhost and 127.0.0.1 under Settings > Authorized domains, then retry.',
  'auth/operation-not-allowed': 'Enable Google under Firebase Authentication > Sign-in method.',
  'auth/popup-blocked': 'Allow the Google sign-in popup for this local page and retry.',
  'auth/popup-closed-by-user': 'Sign-in cancelled. Local builds are unchanged.',
  'auth/network-request-failed': 'Google sign-in could not connect. Check the connection and retry.'
};
document.addEventListener('click', async event => {
  if (!event.target.closest('[data-prototype-auth]') || busy) return;
  if (user) {message('Signed in as ' + (user.email || user.displayName) + '. Cloud sync is not connected yet. Builds remain saved locally.'); return;}
  busy = true; render();
  try {
    initialize();
    await client.signIn();
    user = client.auth.currentUser;
    message('Signed in as ' + (user.email || user.displayName) + '. Cloud sync is not connected yet. Builds remain saved locally.');
  } catch(error) {message(errors[error.code] || ('Google sign-in unavailable (' + (error.code || error.message) + '). Local builds are unchanged.'));}
  finally {busy = false; render();}
});
// Restore the authentication indicator on navigation after an explicit first use.
// Firebase Auth owns its own session; this never touches the simulator account.
if (localStorage.getItem('bellibing.prototype.google-auth-enabled') === '1') initialize();
document.addEventListener('click', event => {if(event.target.closest('[data-prototype-auth]')) localStorage.setItem('bellibing.prototype.google-auth-enabled','1');});

