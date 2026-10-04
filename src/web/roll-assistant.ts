import { PUBLIC_DECISION_AVAILABILITY } from '../publicDecisionContract.ts';
const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app root.');
app.innerHTML = `<main class="alpha-shell"><h1>Bellibing Roll Assist</h1>
<p role="status" data-decision-status="${PUBLIC_DECISION_AVAILABILITY.status}">Pending</p>
<p>Echo advice is currently unavailable.</p><nav><a href="./">Home</a> · <a href="./ui-preview/">Character Build / Improve</a> ·
<a href="./echo-lab.html">Echo Lab</a> · <a href="./roll-assistant.html">Roll Assist</a></nav></main>`;
