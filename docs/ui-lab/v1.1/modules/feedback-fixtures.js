import { ECHO_FIXTURES } from './demo-data.js';
import { candidateFixture } from './lab-state.js';

// Presentation scenarios, NOT validation results. Caps/targets are supplied facts.
// See FEEDBACK.md for canonical references and the no-name-duplication boundary.
export const REVIEW_SCENARIOS = ['ready', 'warning', 'error', 'result', 'combination'];
const recordedAugustaMaterials = [
  { name: 'Echoes', icon: null, count: 12 },
  { name: 'Tuners', icon: 'tuner.png', count: 120 },
  { name: 'Premium Tubes', icon: 'tube.png', count: 24 },
];

export function applyFeedbackScenario(state, scenario) {
  state.feedbackScenario = REVIEW_SCENARIOS.includes(scenario) ? scenario : 'ready';
  if (state.id !== 'augusta' && !['ready', 'result'].includes(state.feedbackScenario)) state.feedbackScenario = 'ready';
  if (state.feedbackScenario === 'result') {
    state.hasRecordedRun = true;
    state.materials = state.id === 'augusta' ? structuredClone(recordedAugustaMaterials) : null;
  } else {
    // Explicit review-scenario changes swap fixtures; recording a run never fixes equipment.
    state.echoes = structuredClone(state.scenarioEchoes);
    if (state.feedbackScenario === 'warning') state.echoes[2] = null;
    if (state.feedbackScenario === 'error') state.echoes[4] = structuredClone(ECHO_FIXTURES[0]);
    state.candidates = state.echoes.map(candidateFixture);
  }
  // A configuration change must never erase the previously recorded spending.
  return state;
}

export function workshopFeedbackFixture(state) {
  const feedback = {
    severity: 'ready', title: 'Ready to Simulate', message: '', explanation: null,
    affectedSlots: [], actionAllowed: true,
    recordedMaterials: state.hasRecordedRun ? state.materials : [],
    demonstration: true,
  };
  if (state.feedbackScenario === 'warning') return {
    ...feedback, severity: 'warning', title: 'Sonata Target Not Met',
    explanation: {
      title: 'Sonata Target Not Met',
      message: 'This demonstration selects a target of three Crown of Valor Echoes. The supplied scenario has two. Adjust the Crown of Valor slots to meet that selected target.',
      facts: [{ label: 'Equipped Crown of Valor', value: '2' }, { label: 'Selected target', value: '3' }],
      note: 'A selected target is separate from an activated Sonata bonus. This warning does not block the demonstration action.',
    }, affectedSlots: [0, 1, 2],
  };
  if (state.feedbackScenario === 'error') return {
    ...feedback, severity: 'error', title: 'Cost Limit Exceeded', message: 'Blocking presentation fixture.', actionAllowed: false,
    explanation: {
      title: 'Cost Limit Exceeded',
      message: 'Your equipped Echoes exceed the permitted Cost limit. Adjust the affected Echo slots to bring the total within the permitted limit.',
      facts: [{ label: 'Equipped Cost', value: '15' }, { label: 'Permitted Cost', value: '12' }, { label: 'Affected Echo', value: '05 · The False Sovereign · Cost 4' }],
      note: 'Presentation-only blocker. Production permits rolling over-Cost batches; the Cost cap applies to equipping. Shared names are not a violation.',
    }, affectedSlots: [4],
  };
  if (state.feedbackScenario === 'result') return {
    ...feedback, severity: 'result', title: 'Run Record',
    message: 'Illustrative record · evaluation pending.',
  };
  if (state.feedbackScenario === 'combination') return {
    ...feedback, severity: 'warning', title: 'Combination Check Pending',
    explanation: {
      title: 'Echo Combination Check',
      message: 'No verified combination violation was supplied. Sharing an Echo name alone does not establish an invalid combination or a disabled Sonata bonus.',
      facts: [], note: 'Validation remains pending; this scenario does not invent a blocking rule or affected slots.',
    },
  };
  return feedback;
}
