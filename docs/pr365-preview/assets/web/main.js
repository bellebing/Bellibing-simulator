import { EchoLab, VerifiedWuwaEchoRuntime, createRank5EchoAtLevel0, createSeededRng, RANK5_PRIMARY_MAIN_STATS } from "../echoCore.js";
import { PUBLIC_DECISION_AVAILABILITY } from "../publicDecisionContract.js";
const app = document.querySelector('#app');
if (!app)
    throw new Error('Missing #app root.');
const lab = new EchoLab(new VerifiedWuwaEchoRuntime());
let session = lab.createSession();
let rng = createSeededRng('bellibing-echo-lab');
app.innerHTML = `<main class="alpha-shell"><h1>Bellibing Echo Lab</h1>
<a href="./">Home</a> · <a href="./ui-preview/index.html">Character Build / Improve</a>
<h2>Evaluation / strategy</h2><p data-decision-status="${PUBLIC_DECISION_AVAILABILITY.status}">Pending</p>
<p>Character evaluation and improvement estimates are currently unavailable.</p>
<h2>Echo mechanics</h2>
<label>Cost <select id="cost"><option>1</option><option>3</option><option>4</option></select></label>
<label>Main stat <select id="main-stat"></select></label>
<label>Count <input id="count" type="number" min="1" max="100" value="5"></label>
<label>Seed <input id="seed" value="bellibing-echo-lab"></label>
<button id="generate" type="button">Generate Echoes</button>
<label>Level <select id="level">${[5, 10, 15, 20, 25].map(level => `<option value="${level}">+${level}</option>`).join('')}</select></label>
<button id="roll" type="button">Roll all</button>
<p role="status" id="mechanics-status"></p><pre id="echoes"></pre>
</main>`;
const input = (id) => document.getElementById(id);
const main = document.getElementById('main-stat');
function mainStats() {
    const cost = Number(input('cost').value);
    main.replaceChildren(...RANK5_PRIMARY_MAIN_STATS[cost].map(row => {
        const option = document.createElement('option');
        option.value = row.name;
        option.textContent = row.name;
        return option;
    }));
}
function render() { document.getElementById('echoes').textContent = JSON.stringify(session, null, 2); }
function act(action) {
    try {
        action();
        render();
        document.getElementById('mechanics-status').textContent = '';
    }
    catch (error) {
        document.getElementById('mechanics-status').textContent = error instanceof Error ? error.message : 'Unavailable';
    }
}
input('cost').onchange = mainStats;
mainStats();
render();
document.getElementById('generate').onclick = () => act(() => {
    const count = Number(input('count').value);
    if (!Number.isInteger(count) || count < 1 || count > 100)
        throw new Error('Choose 1–100 Echoes.');
    rng = createSeededRng(input('seed').value);
    session = lab.acquire(lab.createSession(), createRank5EchoAtLevel0({ id: 'lab',
        cost: Number(input('cost').value), primaryMainStat: main.value }), count, rng);
});
document.getElementById('roll').onclick = () => act(() => {
    session = lab.rollAllTo(session, Number(input('level').value), rng);
});
